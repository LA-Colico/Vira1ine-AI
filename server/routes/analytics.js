const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Analytics = require('../models/Analytics');
const { protect } = require('../middleware/auth');
const { predictOptimalPostingTime } = require('../utils/aiService');

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
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
    }).sort({ publishedAt: -1 });

    // Calculate metrics
    const totalPosts = posts.length;
    const totalViews = posts.reduce((sum, post) => sum + post.metrics.views, 0);
    const totalLikes = posts.reduce((sum, post) => sum + post.metrics.likes, 0);
    const totalComments = posts.reduce((sum, post) => sum + post.metrics.comments, 0);
    const totalShares = posts.reduce((sum, post) => sum + post.metrics.shares, 0);

    const avgEngagementRate = totalPosts > 0
      ? (posts.reduce((sum, post) => sum + parseFloat(post.metrics.engagementRate), 0) / totalPosts).toFixed(2)
      : 0;

    // Platform breakdown
    const platformBreakdown = {};
    posts.forEach(post => {
      if (!platformBreakdown[post.platform]) {
        platformBreakdown[post.platform] = {
          platform: post.platform,
          posts: 0,
          views: 0,
          engagement: 0
        };
      }
      platformBreakdown[post.platform].posts++;
      platformBreakdown[post.platform].views += post.metrics.views;
      platformBreakdown[post.platform].engagement += post.metrics.likes + post.metrics.comments + post.metrics.shares;
    });

    // Content type performance
    const contentTypePerformance = {};
    posts.forEach(post => {
      if (!contentTypePerformance[post.contentType]) {
        contentTypePerformance[post.contentType] = {
          type: post.contentType,
          count: 0,
          avgEngagement: 0,
          avgViews: 0,
          totalEngagement: 0,
          totalViews: 0
        };
      }
      const data = contentTypePerformance[post.contentType];
      data.count++;
      data.totalViews += post.metrics.views;
      data.totalEngagement += post.metrics.likes + post.metrics.comments + post.metrics.shares;
    });

    // Calculate averages for content types
    Object.values(contentTypePerformance).forEach(data => {
      data.avgViews = Math.round(data.totalViews / data.count);
      data.avgEngagement = Math.round(data.totalEngagement / data.count);
      delete data.totalViews;
      delete data.totalEngagement;
    });

    // Get top performing posts
    const topPerformingPosts = posts
      .sort((a, b) => parseFloat(b.metrics.engagementRate) - parseFloat(a.metrics.engagementRate))
      .slice(0, 5);

    // Hashtag performance
    const hashtagPerformance = {};
    posts.forEach(post => {
      if (post.hashtags && post.hashtags.length > 0) {
        post.hashtags.forEach(tag => {
          if (!hashtagPerformance[tag]) {
            hashtagPerformance[tag] = {
              tag,
              count: 0,
              totalEngagement: 0,
              avgEngagement: 0
            };
          }
          hashtagPerformance[tag].count++;
          hashtagPerformance[tag].totalEngagement += post.metrics.likes + post.metrics.comments + post.metrics.shares;
        });
      }
    });

    // Calculate average engagement for hashtags
    const topHashtags = Object.values(hashtagPerformance)
      .map(data => ({
        tag: data.tag,
        count: data.count,
        avgEngagement: Math.round(data.totalEngagement / data.count)
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement)
      .slice(0, 10);

    // Engagement over time (daily breakdown)
    const engagementOverTime = [];
    const days = period === 'monthly' ? 30 : period === 'weekly' ? 7 : 1;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayPosts = posts.filter(post => {
        const postDate = new Date(post.publishedAt);
        return postDate >= date && postDate < nextDate;
      });

      engagementOverTime.push({
        date: date.toISOString().split('T')[0],
        views: dayPosts.reduce((sum, post) => sum + post.metrics.views, 0),
        likes: dayPosts.reduce((sum, post) => sum + post.metrics.likes, 0),
        comments: dayPosts.reduce((sum, post) => sum + post.metrics.comments, 0),
        shares: dayPosts.reduce((sum, post) => sum + post.metrics.shares, 0),
        posts: dayPosts.length
      });
    }

    res.json({
      period,
      summary: {
        totalPosts,
        totalViews,
        totalLikes,
        totalComments,
        totalShares,
        avgEngagementRate
      },
      platformBreakdown: Object.values(platformBreakdown),
      contentTypePerformance: Object.values(contentTypePerformance),
      topPerformingPosts: topPerformingPosts.map(post => ({
        id: post._id,
        title: post.title,
        platform: post.platform,
        contentType: post.contentType,
        engagementRate: post.metrics.engagementRate,
        views: post.metrics.views,
        publishedAt: post.publishedAt
      })),
      topHashtags,
      engagementOverTime
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
});

// @route   GET /api/analytics/posting-times
// @desc    Get optimal posting times based on historical performance
// @access  Private
router.get('/posting-times', protect, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id }).sort({ publishedAt: -1 });

    if (posts.length < 5) {
      return res.json({
        message: 'Need at least 5 posts to calculate optimal posting times',
        optimalTimes: []
      });
    }

    const optimalTimes = await predictOptimalPostingTime(posts);

    res.json({
      optimalTimes,
      sampleSize: posts.length
    });
  } catch (error) {
    console.error('Optimal posting times error:', error);
    res.status(500).json({ message: 'Server error calculating posting times' });
  }
});

// @route   GET /api/analytics/growth-trends
// @desc    Get growth trends and comparisons
// @access  Private
router.get('/growth-trends', protect, async (req, res) => {
  try {
    const now = new Date();

    // Current period (last 7 days)
    const currentPeriodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const currentPosts = await Post.find({
      user: req.user.id,
      publishedAt: { $gte: currentPeriodStart }
    });

    // Previous period (7-14 days ago)
    const previousPeriodStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const previousPeriodEnd = currentPeriodStart;
    const previousPosts = await Post.find({
      user: req.user.id,
      publishedAt: { $gte: previousPeriodStart, $lt: previousPeriodEnd }
    });

    // Calculate metrics for both periods
    const calculateMetrics = (posts) => ({
      posts: posts.length,
      views: posts.reduce((sum, post) => sum + post.metrics.views, 0),
      likes: posts.reduce((sum, post) => sum + post.metrics.likes, 0),
      comments: posts.reduce((sum, post) => sum + post.metrics.comments, 0),
      avgEngagement: posts.length > 0
        ? (posts.reduce((sum, post) => sum + parseFloat(post.metrics.engagementRate), 0) / posts.length).toFixed(2)
        : 0
    });

    const currentMetrics = calculateMetrics(currentPosts);
    const previousMetrics = calculateMetrics(previousPosts);

    // Calculate growth percentages
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return (((current - previous) / previous) * 100).toFixed(1);
    };

    const growth = {
      posts: calculateGrowth(currentMetrics.posts, previousMetrics.posts),
      views: calculateGrowth(currentMetrics.views, previousMetrics.views),
      likes: calculateGrowth(currentMetrics.likes, previousMetrics.likes),
      comments: calculateGrowth(currentMetrics.comments, previousMetrics.comments),
      avgEngagement: calculateGrowth(currentMetrics.avgEngagement, previousMetrics.avgEngagement)
    };

    res.json({
      currentPeriod: currentMetrics,
      previousPeriod: previousMetrics,
      growth,
      trend: parseFloat(growth.avgEngagement) > 0 ? 'increasing' : parseFloat(growth.avgEngagement) < 0 ? 'decreasing' : 'stable'
    });
  } catch (error) {
    console.error('Growth trends error:', error);
    res.status(500).json({ message: 'Server error calculating growth trends' });
  }
});

// @route   POST /api/analytics/generate
// @desc    Generate and save analytics snapshot
// @access  Private
router.post('/generate', protect, async (req, res) => {
  try {
    const { period = 'weekly' } = req.body;

    // This would be called by a scheduled job to generate periodic analytics
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

    const posts = await Post.find({
      user: req.user.id,
      publishedAt: { $gte: startDate }
    });

    // Calculate analytics (similar to dashboard endpoint)
    const analyticsData = {
      user: req.user.id,
      period,
      date: new Date(),
      metrics: {
        totalPosts: posts.length,
        totalViews: posts.reduce((sum, post) => sum + post.metrics.views, 0),
        totalLikes: posts.reduce((sum, post) => sum + post.metrics.likes, 0),
        totalComments: posts.reduce((sum, post) => sum + post.metrics.comments, 0),
        totalShares: posts.reduce((sum, post) => sum + post.metrics.shares, 0),
        avgEngagementRate: posts.length > 0
          ? (posts.reduce((sum, post) => sum + parseFloat(post.metrics.engagementRate), 0) / posts.length)
          : 0
      }
    };

    const analytics = await Analytics.create(analyticsData);

    res.json({
      message: 'Analytics generated successfully',
      analytics
    });
  } catch (error) {
    console.error('Generate analytics error:', error);
    res.status(500).json({ message: 'Server error generating analytics' });
  }
});

module.exports = router;
