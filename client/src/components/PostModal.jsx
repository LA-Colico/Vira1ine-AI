import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { postsAPI } from '../services/api';

const PostModal = ({ post, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    platform: post?.platform || 'instagram',
    title: post?.title || '',
    description: post?.description || '',
    contentType: post?.contentType || 'image',
    url: post?.url || '',
    thumbnailUrl: post?.thumbnailUrl || '',
    publishedAt: post?.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    hashtags: post?.hashtags?.join(', ') || '',
    metrics: {
      views: post?.metrics?.views || 0,
      likes: post?.metrics?.likes || 0,
      comments: post?.metrics?.comments || 0,
      shares: post?.metrics?.shares || 0,
      saves: post?.metrics?.saves || 0
    }
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('metrics.')) {
      const metricName = name.split('.')[1];
      setFormData({
        ...formData,
        metrics: { ...formData.metrics, [metricName]: parseInt(value) || 0 }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const postData = {
        ...formData,
        hashtags: formData.hashtags.split(',').map(tag => tag.trim()).filter(tag => tag),
        publishedAt: new Date(formData.publishedAt).toISOString()
      };

      if (post) {
        await postsAPI.update(post._id, postData);
        toast.success('Post updated successfully');
      } else {
        await postsAPI.create(postData);
        toast.success('Post created successfully');
      }

      onSave();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {post ? 'Edit Post' : 'Add New Post'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Platform & Content Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Platform
              </label>
              <select
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
                <option value="twitter">Twitter</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Content Type
              </label>
              <select
                name="contentType"
                value={formData.contentType}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="carousel">Carousel</option>
                <option value="story">Story</option>
                <option value="reel">Reel</option>
                <option value="short">Short</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input"
              placeholder="Post title or caption"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input"
              rows={3}
              placeholder="Post description (optional)"
            />
          </div>

          {/* URL & Thumbnail */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Post URL
              </label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                className="input"
                placeholder="https://..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Thumbnail URL (optional)
              </label>
              <input
                type="url"
                name="thumbnailUrl"
                value={formData.thumbnailUrl}
                onChange={handleChange}
                className="input"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Published Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Published Date & Time
            </label>
            <input
              type="datetime-local"
              name="publishedAt"
              value={formData.publishedAt}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          {/* Hashtags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Hashtags (comma-separated)
            </label>
            <input
              type="text"
              name="hashtags"
              value={formData.hashtags}
              onChange={handleChange}
              className="input"
              placeholder="viral, trending, fyp"
            />
          </div>

          {/* Metrics */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Metrics
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-400">Views</label>
                <input
                  type="number"
                  name="metrics.views"
                  value={formData.metrics.views}
                  onChange={handleChange}
                  className="input"
                  min="0"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Likes</label>
                <input
                  type="number"
                  name="metrics.likes"
                  value={formData.metrics.likes}
                  onChange={handleChange}
                  className="input"
                  min="0"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Comments</label>
                <input
                  type="number"
                  name="metrics.comments"
                  value={formData.metrics.comments}
                  onChange={handleChange}
                  className="input"
                  min="0"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Shares</label>
                <input
                  type="number"
                  name="metrics.shares"
                  value={formData.metrics.shares}
                  onChange={handleChange}
                  className="input"
                  min="0"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Saves</label>
                <input
                  type="number"
                  name="metrics.saves"
                  value={formData.metrics.saves}
                  onChange={handleChange}
                  className="input"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {loading ? 'Saving...' : post ? 'Update Post' : 'Create Post'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostModal;
