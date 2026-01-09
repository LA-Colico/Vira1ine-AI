import { useState, useEffect } from 'react';
import { Clock, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { analyticsAPI } from '../services/api';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [optimalTimes, setOptimalTimes] = useState([]);

  useEffect(() => {
    fetchOptimalPostingTimes();
  }, []);

  const fetchOptimalPostingTimes = async () => {
    try {
      setLoading(true);
      const { data } = await analyticsAPI.getPostingTimes();
      setOptimalTimes(data.optimalTimes || []);
    } catch (error) {
      toast.error('Failed to load posting times');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          Optimal Posting Times
        </h1>
        <p className="text-gray-400">
          Find the perfect time to post based on your historical performance
        </p>
      </div>

      {optimalTimes.length === 0 ? (
        <div className="card text-center py-12">
          <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Not enough data yet</h3>
          <p className="text-gray-400">Add at least 5 posts to see optimal posting time recommendations</p>
        </div>
      ) : (
        <div>
          {/* Info Card */}
          <div className="card mb-8 bg-gradient-to-r from-primary-900/30 to-accent-900/30">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Based on {optimalTimes[0]?.sampleSize || 0} posts
                </h3>
                <p className="text-gray-300">
                  These are the times when your content historically performs best. Schedule your posts during these windows to maximize engagement.
                </p>
              </div>
            </div>
          </div>

          {/* Optimal Times Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {optimalTimes.map((timeSlot, index) => (
              <div
                key={index}
                className="card hover:scale-105 transition-transform duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold text-primary-400">
                    #{index + 1}
                  </span>
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Day</span>
                    </div>
                    <p className="text-xl font-bold text-white">{timeSlot.day}</p>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Time</span>
                    </div>
                    <p className="text-xl font-bold text-white">{timeSlot.displayTime}</p>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Avg Engagement</span>
                    </div>
                    <p className="text-2xl font-bold text-primary-400">
                      {timeSlot.avgEngagement}%
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-800">
                    <p className="text-xs text-gray-500">
                      Based on {timeSlot.sampleSize} posts
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tips Section */}
          <div className="card mt-8">
            <h3 className="text-xl font-bold text-white mb-4">Pro Tips</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start space-x-3">
                <span className="text-primary-400 font-bold">•</span>
                <span>
                  <strong className="text-white">Consistency is key:</strong> Post regularly during these optimal times to train your audience when to expect new content.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-primary-400 font-bold">•</span>
                <span>
                  <strong className="text-white">Test and iterate:</strong> These recommendations improve as you add more posts. Keep tracking your performance!
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-primary-400 font-bold">•</span>
                <span>
                  <strong className="text-white">Platform matters:</strong> Different platforms have different peak times. Consider creating platform-specific schedules.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-primary-400 font-bold">•</span>
                <span>
                  <strong className="text-white">Quality over timing:</strong> While timing helps, great content will perform well at any time. Focus on creating value first!
                </span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
