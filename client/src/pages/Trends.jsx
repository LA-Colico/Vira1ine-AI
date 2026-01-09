import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Lightbulb, Hash, Rocket } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { aiAPI } from '../services/api';
import useAuthStore from '../store/authStore';

const Trends = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);

  const isPro = user?.subscription?.plan !== 'free';

  useEffect(() => {
    if (isPro) {
      fetchTrendingInsights();
    } else {
      setLoading(false);
    }
  }, [isPro]);

  const fetchTrendingInsights = async () => {
    try {
      setLoading(true);
      const { data } = await aiAPI.getTrendingInsights();
      setInsights(data.insights);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Upgrade to Pro to access AI Trends');
      } else {
        toast.error('Failed to load trending insights');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isPro) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-display font-bold text-white mb-4">
            AI-Powered Trends
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Get personalized content recommendations, trending topics, and viral predictions powered by AI.
          </p>
          <div className="inline-block px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg">
            <p className="text-white font-bold text-lg">Upgrade to Pro to unlock AI Trends</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card text-center py-12">
          <Sparkles className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No insights yet</h3>
          <p className="text-gray-400">Add some posts to get personalized AI-powered insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          AI Trends & Insights
        </h1>
        <p className="text-gray-400">
          Personalized recommendations powered by artificial intelligence
        </p>
      </div>

      {/* Trending Topics */}
      <div className="card mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Trending Topics for Gen Z</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(insights.trendingTopics || []).map((topic, index) => (
            <div
              key={index}
              className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <p className="text-white font-medium">{topic}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Content Suggestions */}
      <div className="card mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-primary-500 rounded-xl flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Content Ideas</h2>
        </div>
        <div className="space-y-4">
          {(insights.contentSuggestions || []).map((suggestion, index) => (
            <div
              key={index}
              className="p-4 bg-gradient-to-r from-gray-800 to-gray-800/50 rounded-lg border-l-4 border-primary-500"
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl font-bold text-primary-400">
                  {index + 1}
                </span>
                <p className="text-gray-300 flex-1">{suggestion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hashtag Recommendations */}
      <div className="card mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Hash className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Recommended Hashtags</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {(insights.hashtagRecommendations || []).map((hashtag, index) => (
            <span
              key={index}
              className="px-4 py-2 bg-gradient-to-r from-primary-900/30 to-accent-900/30 text-primary-400 rounded-full font-medium hover:from-primary-800/30 hover:to-accent-800/30 transition-colors cursor-pointer"
            >
              #{hashtag}
            </span>
          ))}
        </div>
      </div>

      {/* Optimal Posting Times */}
      {insights.optimalPostingTimes && insights.optimalPostingTimes.length > 0 && (
        <div className="card mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Best Times to Post</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.optimalPostingTimes.map((time, index) => (
              <div
                key={index}
                className="p-4 bg-gray-800 rounded-lg text-center"
              >
                <p className="text-gray-400 text-sm mb-1">{time.day}</p>
                <p className="text-2xl font-bold text-white">{time.hour}:00</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Platform-Specific Advice */}
      {insights.platformAdvice && (
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Platform-Specific Tips</h2>
          </div>
          <div className="space-y-4">
            {Object.entries(insights.platformAdvice).map(([platform, advice]) => (
              <div
                key={platform}
                className="p-4 bg-gray-800 rounded-lg"
              >
                <h3 className="text-lg font-bold text-white mb-2 capitalize">
                  {platform}
                </h3>
                <p className="text-gray-300">{advice}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Trends;
