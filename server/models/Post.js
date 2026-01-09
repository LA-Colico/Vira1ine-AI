const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  platform: {
    type: String,
    enum: ['instagram', 'tiktok', 'youtube', 'twitter', 'other'],
    required: true
  },
  title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  contentType: {
    type: String,
    enum: ['image', 'video', 'carousel', 'story', 'reel', 'short'],
    required: true
  },
  url: {
    type: String,
    required: [true, 'Post URL is required']
  },
  thumbnailUrl: {
    type: String
  },
  publishedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  metrics: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    saves: {
      type: Number,
      default: 0
    },
    engagementRate: {
      type: Number,
      default: 0
    },
    reachRate: {
      type: Number,
      default: 0
    }
  },
  hashtags: [{
    type: String,
    trim: true
  }],
  aiAnalysis: {
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative']
    },
    topics: [String],
    suggestedImprovements: [String],
    predictedPerformance: {
      type: String,
      enum: ['low', 'medium', 'high', 'viral']
    },
    bestPostingTime: String,
    analyzedAt: Date
  },
  historicalMetrics: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    views: Number,
    likes: Number,
    comments: Number,
    shares: Number
  }]
}, {
  timestamps: true
});

// Calculate engagement rate before saving
postSchema.pre('save', function(next) {
  if (this.metrics.views > 0) {
    const totalEngagements = this.metrics.likes + this.metrics.comments + this.metrics.shares + (this.metrics.saves || 0);
    this.metrics.engagementRate = ((totalEngagements / this.metrics.views) * 100).toFixed(2);
  }
  next();
});

// Index for better query performance
postSchema.index({ user: 1, publishedAt: -1 });
postSchema.index({ platform: 1 });

module.exports = mongoose.model('Post', postSchema);
