import { useState, useEffect } from 'react';
import { TrendingUp, Eye, Heart, MessageCircle, Users, ArrowUp, ArrowDown } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';
import { analyticsAPI, postsAPI } from '../services/api';
import useAuthStore from '../store/authStore';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('weekly');
  const [dashboardData, setDashboardData] = useState(null);
  const [growthData, setGrowthData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchGrowthTrends();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data } = await analyticsAPI.getDashboard({ period });
      setDashboardData(data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchGrowthTrends = async () => {
    try {
      const { data } = await analyticsAPI.getGrowthTrends();
      setGrowthData(data);
    } catch (error) {
      console.error('Failed to load growth trends');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Posts',
      value: dashboardData?.summary.totalPosts || 0,
      icon: TrendingUp,
      change: growthData?.growth.posts || 0,
      color: 'primary'
    },
    {
      label: 'Total Views',
      value: (dashboardData?.summary.totalViews || 0).toLocaleString(),
      icon: Eye,
      change: growthData?.growth.views || 0,
      color: 'blue'
    },
    {
      label: 'Total Likes',
      value: (dashboardData?.summary.totalLikes || 0).toLocaleString(),
      icon: Heart,
      change: growthData?.growth.likes || 0,
      color: 'pink'
    },
    {
      label: 'Avg Engagement',
      value: `${dashboardData?.summary.avgEngagementRate || 0}%`,
      icon: Users,
      change: growthData?.growth.avgEngagement || 0,
      color: 'purple'
    }
  ];

  const COLORS = ['#0ea5e9', '#d946ef', '#8b5cf6', '#06b6d4', '#ec4899'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-gray-400">
          Here's how your content is performing
        </p>
      </div>

      {/* Period selector */}
      <div className="flex space-x-2 mb-6">
        {['daily', 'weekly', 'monthly'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              period === p
                ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = parseFloat(stat.change) >= 0;

          return (
            <div key={index} className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-8 h-8 text-${stat.color}-500`} />
                <div className={`flex items-center space-x-1 text-sm ${
                  isPositive ? 'text-green-400' : 'text-red-400'
                }`}>
                  {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  <span>{Math.abs(stat.change)}%</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Engagement Over Time */}
        <div className="card">
          <h3 className="text-xl font-bold text-white mb-4">Engagement Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData?.engagementOverTime || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="views" stroke="#0ea5e9" strokeWidth={2} />
              <Line type="monotone" dataKey="likes" stroke="#ec4899" strokeWidth={2} />
              <Line type="monotone" dataKey="comments" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Breakdown */}
        <div className="card">
          <h3 className="text-xl font-bold text-white mb-4">Platform Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardData?.platformBreakdown || []}
                dataKey="posts"
                nameKey="platform"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => entry.platform}
              >
                {(dashboardData?.platformBreakdown || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Content Type Performance */}
        <div className="card">
          <h3 className="text-xl font-bold text-white mb-4">Content Type Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData?.contentTypePerformance || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="type" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="avgEngagement" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Hashtags */}
        <div className="card">
          <h3 className="text-xl font-bold text-white mb-4">Top Performing Hashtags</h3>
          <div className="space-y-3">
            {(dashboardData?.topHashtags || []).slice(0, 8).map((hashtag, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-primary-400 font-medium">#{hashtag.tag}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-400 text-sm">{hashtag.count} posts</span>
                  <span className="text-white font-medium">{hashtag.avgEngagement}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Posts */}
      <div className="card">
        <h3 className="text-xl font-bold text-white mb-4">Top Performing Posts</h3>
        <div className="space-y-4">
          {(dashboardData?.topPerformingPosts || []).map((post, index) => (
            <div key={post.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl font-bold text-gray-700">#{index + 1}</span>
                  <h4 className="text-white font-medium">{post.title}</h4>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span className="capitalize">{post.platform}</span>
                  <span>•</span>
                  <span className="capitalize">{post.contentType}</span>
                  <span>•</span>
                  <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary-400">{post.engagementRate}%</p>
                <p className="text-sm text-gray-400">{post.views.toLocaleString()} views</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
