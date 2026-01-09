import { Link } from 'react-router-dom';
import { TrendingUp, Clock, Sparkles, BarChart3, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';

const Landing = () => {
  const features = [
    {
      icon: TrendingUp,
      title: 'Track Trends',
      description: 'Stay ahead with real-time Gen Z content trends and viral predictions'
    },
    {
      icon: Clock,
      title: 'Perfect Timing',
      description: 'AI-powered recommendations for optimal posting times to maximize engagement'
    },
    {
      icon: BarChart3,
      title: 'Deep Analytics',
      description: 'Comprehensive metrics across all your social platforms in one place'
    },
    {
      icon: Sparkles,
      title: 'AI Insights',
      description: 'Get content suggestions and performance predictions powered by AI'
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Monitor your content performance with live metrics and notifications'
    },
    {
      icon: Target,
      title: 'Grow Faster',
      description: 'Data-driven strategies to accelerate your social media growth'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-gray-950 to-accent-900/20" />

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Logo */}
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-2xl">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-6xl font-display font-bold gradient-text">
                Vira1ine
              </h1>
            </div>

            <h2 className="text-5xl md:text-6xl font-display font-bold text-white mb-6">
              Master Social Media
              <br />
              <span className="gradient-text">Like a Gen Z Pro</span>
            </h2>

            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              AI-powered analytics platform that helps you track trends, find the perfect time to post,
              and grow your social presence with data-driven insights.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/register" className="btn-primary text-lg px-8 py-4">
                Get Started Free
              </Link>
              <Link to="/login" className="btn-secondary text-lg px-8 py-4">
                Sign In
              </Link>
            </div>

            <p className="text-gray-500 mt-6">
              No credit card required • Start tracking in 2 minutes
            </p>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h3 className="text-4xl font-display font-bold text-white mb-4">
            Everything You Need to Go Viral
          </h3>
          <p className="text-xl text-gray-400">
            Powerful features designed for the next generation of content creators
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card hover:scale-105 transition-transform duration-300"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">{feature.title}</h4>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="card bg-gradient-to-r from-primary-900/30 to-accent-900/30 text-center"
        >
          <h3 className="text-4xl font-display font-bold text-white mb-4">
            Ready to Level Up Your Content Game?
          </h3>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of creators already using Vira1ine to grow their audience
          </p>
          <Link to="/register" className="btn-primary text-lg px-8 py-4 inline-block">
            Start Your Free Trial
          </Link>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          <p>&copy; 2026 Vira1ine. Built for Gen Z creators.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
