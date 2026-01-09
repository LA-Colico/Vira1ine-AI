import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, TrendingUp, Eye, Heart, MessageCircle, Share2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { postsAPI } from '../services/api';
import PostModal from '../components/PostModal';

const Posts = () => {
  const [posts, setposts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { platform: filter } : {};
      const { data } = await postsAPI.getAll(params);
      setPosts(data.posts);
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await postsAPI.delete(postId);
      toast.success('Post deleted');
      fetchPosts();
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const handleEdit = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedPost(null);
    setIsModalOpen(true);
  };

  const platforms = ['all', 'instagram', 'tiktok', 'youtube', 'twitter'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            Your Posts
          </h1>
          <p className="text-gray-400">
            Manage and track your social media content
          </p>
        </div>
        <button onClick={handleAddNew} className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Add Post</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {platforms.map((platform) => (
          <button
            key={platform}
            onClick={() => setFilter(platform)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              filter === platform
                ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {platform.charAt(0).toUpperCase() + platform.slice(1)}
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="card text-center py-12">
          <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No posts yet</h3>
          <p className="text-gray-400 mb-6">Start adding your social media posts to track their performance</p>
          <button onClick={handleAddNew} className="btn-primary inline-flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Add Your First Post</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post._id} className="card hover:scale-105 transition-transform duration-300">
              {/* Platform Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 bg-primary-900/30 text-primary-400 rounded-full text-xs font-medium capitalize">
                  {post.platform}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(post.publishedAt).toLocaleDateString()}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                {post.title}
              </h3>

              {/* Content Type */}
              <p className="text-sm text-gray-400 mb-4 capitalize">
                {post.contentType}
              </p>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-300">{post.metrics.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-pink-400" />
                  <span className="text-sm text-gray-300">{post.metrics.likes.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-300">{post.metrics.comments.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Share2 className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-300">{post.metrics.shares.toLocaleString()}</span>
                </div>
              </div>

              {/* Engagement Rate */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">Engagement Rate</span>
                  <span className="text-sm font-bold text-primary-400">{post.metrics.engagementRate}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full"
                    style={{ width: `${Math.min(post.metrics.engagementRate, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(post)}
                  className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-1"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(post._id)}
                  className="flex-1 px-3 py-2 bg-red-900/20 hover:bg-red-900/30 text-red-400 rounded-lg transition-colors flex items-center justify-center space-x-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Modal */}
      {isModalOpen && (
        <PostModal
          post={selectedPost}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPost(null);
          }}
          onSave={() => {
            setIsModalOpen(false);
            setSelectedPost(null);
            fetchPosts();
          }}
        />
      )}
    </div>
  );
};

export default Posts;
