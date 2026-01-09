const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { protect, checkSubscription } = require('../middleware/auth');
const { analyzeContent, getTrendingInsights, generatePerformanceReport } = require('../utils/aiService');

// @route   POST /api/ai/analyze-post/:id
// @desc    Analyze a specific post with AI
// @access  Private (Pro/Enterprise)
router.post('/analyze-post/:id', protect, checkSubscription('pro'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if post belongs to user
    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to analyze this post' });
    }

    // Check if already analyzed recently (within last 24 hours)
    if (post.aiAnalysis?.analyzedAt) {
      const hoursSinceAnalysis = (Date.now() - new Date(post.aiAnalysis.analyzedAt)) / (1000 * 60 * 60);
      if (hoursSinceAnalysis < 24) {
        return res.json({
          message: 'Using cached analysis (analyzed less than 24 hours ago)',
          analysis: post.aiAnalysis,
          cached: true
        });
      }
    }

    // Perform AI analysis
    const analysis = await analyzeContent({
      platform: post.platform,
      title: post.title,
      description: post.description,
      contentType: post.contentType,
      hashtags: post.hashtags
    });

    // Update post with AI analysis
    post.aiAnalysis = analysis;
    await post.save();

    res.json({
      message: 'Post analyzed successfully',
      analysis,
      cached: false
    });
  } catch (error) {
    console.error('Analyze post error:', error);
    res.status(500).json({ message: 'Server error analyzing post' });
  }
});

// @route   POST /api/ai/analyze-new
// @desc    Analyze content before posting (preview)
// @access  Private (Pro/Enterprise)
router.post('/analyze-new', protect, checkSubscription('pro'), async (req, res) => {
  try {
    const { platform, title, description, contentType, hashtags } = req.body;

    if (!platform || !title || !contentType) {
      return res.status(400).json({ message: 'Platform, title, and content type are required' });
    }

    // Perform AI analysis on draft content
    const analysis = await analyzeContent({
      platform,
      title,
      description,
      contentType,
      hashtags
    });

    res.json({
      message: 'Content analyzed successfully',
      analysis
    });
  } catch (error) {
    console.error('Analyze new content error:', error);
    res.status(500).json({ message: 'Server error analyzing content' });
  }
});

// @route   GET /api/ai/trending-insights
// @desc    Get trending topics and content recommendations
// @access  Private (Pro/Enterprise)
router.get('/trending-insights', protect, checkSubscription('pro'), async (req, res) => {
  try {
    // Get user's recent posts for context
    const userPosts = await Post.find({ user: req.user.id })
      .sort({ publishedAt: -1 })
      .limit(20);

    if (userPosts.length === 0) {
      return res.json({
        message: 'No posts found. Create some posts first to get personalized insights.',
        insights: null
      });
    }

    // Get AI-powered trending insights
    const insights = await getTrendingInsights(userPosts);

    res.json({
      message: 'Trending insights generated successfully',
      insights,
      basedOnPosts: userPosts.length
    });
  } catch (error) {
    console.error('Trending insights error:', error);
    res.status(500).json({ message: 'Server error getting trending insights' });
  }
});

// @route   GET /api/ai/performance-report
// @desc    Generate AI-powered performance report
// @access  Private (Pro/Enterprise)
router.get('/performance-report', protect, checkSubscription('pro'), async (req, res) => {
  try {
    const { period = 'weekly' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;

    switch (period) {
      case 'daily':
        startDate = new Date(now.setDate(now.getDate() - 1));
        break;
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'monthly':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7));
    }

    // Get posts in period
    const posts = await Post.find({
      user: req.user.id,
      publishedAt: { $gte: startDate }
    });

    if (posts.length === 0) {
      return res.json({
        message: 'No posts found in this period',
        report: null
      });
    }

    // Calculate summary analytics
    const analytics = {
      totalPosts: posts.length,
      totalViews: posts.reduce((sum, post) => sum + post.metrics.views, 0),
      avgEngagementRate: (posts.reduce((sum, post) => sum + parseFloat(post.metrics.engagementRate), 0) / posts.length).toFixed(2),
      topPerformingPlatform: null
    };

    // Find top performing platform
    const platformStats = {};
    posts.forEach(post => {
      if (!platformStats[post.platform]) {
        platformStats[post.platform] = 0;
      }
      platformStats[post.platform] += parseFloat(post.metrics.engagementRate);
    });

    analytics.topPerformingPlatform = Object.entries(platformStats)
      .sort(([, a], [, b]) => b - a)[0]?.[0];

    // Generate AI report
    const report = await generatePerformanceReport(analytics);

    res.json({
      message: 'Performance report generated successfully',
      period,
      analytics,
      report
    });
  } catch (error) {
    console.error('Performance report error:', error);
    res.status(500).json({ message: 'Server error generating performance report' });
  }
});

// @route   POST /api/ai/batch-analyze
// @desc    Analyze multiple posts at once
// @access  Private (Enterprise only)
router.post('/batch-analyze', protect, checkSubscription('enterprise'), async (req, res) => {
  try {
    const { postIds } = req.body;

    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
      return res.status(400).json({ message: 'Post IDs array is required' });
    }

    if (postIds.length > 10) {
      return res.status(400).json({ message: 'Maximum 10 posts can be analyzed at once' });
    }

    // Get all posts
    const posts = await Post.find({
      _id: { $in: postIds },
      user: req.user.id
    });

    if (posts.length === 0) {
      return res.status(404).json({ message: 'No posts found' });
    }

    // Analyze each post
    const results = [];
    for (const post of posts) {
      try {
        const analysis = await analyzeContent({
          platform: post.platform,
          title: post.title,
          description: post.description,
          contentType: post.contentType,
          hashtags: post.hashtags
        });

        post.aiAnalysis = analysis;
        await post.save();

        results.push({
          postId: post._id,
          title: post.title,
          analysis,
          success: true
        });
      } catch (error) {
        results.push({
          postId: post._id,
          title: post.title,
          success: false,
          error: 'Analysis failed'
        });
      }
    }

    res.json({
      message: 'Batch analysis completed',
      results,
      total: postIds.length,
      successful: results.filter(r => r.success).length
    });
  } catch (error) {
    console.error('Batch analyze error:', error);
    res.status(500).json({ message: 'Server error during batch analysis' });
  }
});

// @route   GET /api/ai/content-ideas
// @desc    Get AI-generated content ideas based on trends
// @access  Private (Pro/Enterprise)
router.get('/content-ideas', protect, checkSubscription('pro'), async (req, res) => {
  try {
    const { platform, count = 5 } = req.query;

    // Get user's recent posts for context
    const userPosts = await Post.find({ user: req.user.id })
      .sort({ publishedAt: -1 })
      .limit(10);

    // This is a simplified version - in production you'd want more sophisticated AI
    const insights = await getTrendingInsights(userPosts.length > 0 ? userPosts : []);

    const contentIdeas = insights.contentSuggestions || [];

    res.json({
      message: 'Content ideas generated',
      ideas: platform
        ? contentIdeas.filter(idea => idea.toLowerCase().includes(platform.toLowerCase())).slice(0, parseInt(count))
        : contentIdeas.slice(0, parseInt(count)),
      trendingTopics: insights.trendingTopics || []
    });
  } catch (error) {
    console.error('Content ideas error:', error);
    res.status(500).json({ message: 'Server error generating content ideas' });
  }
});

module.exports = router;
