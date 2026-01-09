const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  metrics: {
    totalPosts: {
      type: Number,
      default: 0
    },
    totalViews: {
      type: Number,
      default: 0
    },
    totalLikes: {
      type: Number,
      default: 0
    },
    totalComments: {
      type: Number,
      default: 0
    },
    totalShares: {
      type: Number,
      default: 0
    },
    avgEngagementRate: {
      type: Number,
      default: 0
    },
    followerGrowth: {
      type: Number,
      default: 0
    },
    topPerformingPlatform: {
      type: String,
      enum: ['instagram', 'tiktok', 'youtube', 'twitter', 'other']
    }
  },
  platformBreakdown: [{
    platform: {
      type: String,
      enum: ['instagram', 'tiktok', 'youtube', 'twitter', 'other']
    },
    posts: Number,
    views: Number,
    engagement: Number
  }],
  topPerformingPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  contentTypePerformance: [{
    type: {
      type: String,
      enum: ['image', 'video', 'carousel', 'story', 'reel', 'short']
    },
    count: Number,
    avgEngagement: Number,
    avgViews: Number
  }],
  bestPostingTimes: [{
    hour: {
      type: Number,
      min: 0,
      max: 23
    },
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6
    },
    avgEngagement: Number
  }],
  hashtags: [{
    tag: String,
    count: Number,
    avgEngagement: Number
  }],
  insights: {
    growthTrend: {
      type: String,
      enum: ['increasing', 'stable', 'decreasing']
    },
    recommendations: [String]
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
analyticsSchema.index({ user: 1, period: 1, date: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
