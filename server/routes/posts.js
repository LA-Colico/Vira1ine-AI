const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');

// @route   GET /api/posts
// @desc    Get all posts for logged-in user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { platform, limit = 50, page = 1, sortBy = 'publishedAt' } = req.query;

    const query = { user: req.user.id };
    if (platform) query.platform = platform;

    const posts = await Post.find(query)
      .sort({ [sortBy]: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error fetching posts' });
  }
});

// @route   GET /api/posts/:id
// @desc    Get single post by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if post belongs to user
    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this post' });
    }

    res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error fetching post' });
  }
});

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', protect, [
  body('platform').isIn(['instagram', 'tiktok', 'youtube', 'twitter', 'other']).withMessage('Invalid platform'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('contentType').isIn(['image', 'video', 'carousel', 'story', 'reel', 'short']).withMessage('Invalid content type'),
  body('url').isURL().withMessage('Valid URL is required')
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const postData = {
      ...req.body,
      user: req.user.id
    };

    const post = await Post.create(postData);

    // Emit real-time update via Socket.io
    const io = req.app.get('io');
    io.to(`user_${req.user.id}`).emit('newPost', post);

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error creating post' });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update post
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if post belongs to user
    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    // Update post
    post = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error updating post' });
  }
});

// @route   PUT /api/posts/:id/metrics
// @desc    Update post metrics
// @access  Private
router.put('/:id/metrics', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if post belongs to user
    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    // Store historical metrics before updating
    post.historicalMetrics.push({
      timestamp: new Date(),
      views: post.metrics.views,
      likes: post.metrics.likes,
      comments: post.metrics.comments,
      shares: post.metrics.shares
    });

    // Update metrics
    post.metrics = { ...post.metrics, ...req.body };
    await post.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`user_${req.user.id}`).emit('metricsUpdate', { postId: post._id, metrics: post.metrics });

    res.json({
      message: 'Metrics updated successfully',
      post
    });
  } catch (error) {
    console.error('Update metrics error:', error);
    res.status(500).json({ message: 'Server error updating metrics' });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete post
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if post belongs to user
    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error deleting post' });
  }
});

// @route   GET /api/posts/stats/overview
// @desc    Get posts overview stats
// @access  Private
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id });

    const stats = {
      totalPosts: posts.length,
      totalViews: posts.reduce((sum, post) => sum + post.metrics.views, 0),
      totalLikes: posts.reduce((sum, post) => sum + post.metrics.likes, 0),
      totalComments: posts.reduce((sum, post) => sum + post.metrics.comments, 0),
      avgEngagementRate: posts.length > 0
        ? (posts.reduce((sum, post) => sum + parseFloat(post.metrics.engagementRate), 0) / posts.length).toFixed(2)
        : 0,
      platformBreakdown: {}
    };

    // Calculate platform breakdown
    posts.forEach(post => {
      if (!stats.platformBreakdown[post.platform]) {
        stats.platformBreakdown[post.platform] = { count: 0, views: 0, engagement: 0 };
      }
      stats.platformBreakdown[post.platform].count++;
      stats.platformBreakdown[post.platform].views += post.metrics.views;
      stats.platformBreakdown[post.platform].engagement += post.metrics.likes + post.metrics.comments + post.metrics.shares;
    });

    res.json({ stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
});

module.exports = router;
