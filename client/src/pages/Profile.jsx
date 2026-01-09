import { useState } from 'react';
import { User, Mail, Instagram, Youtube, Twitter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authAPI } from '../services/api';
import useAuthStore from '../store/authStore';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    socialAccounts: {
      instagram: user?.socialAccounts?.instagram || '',
      tiktok: user?.socialAccounts?.tiktok || '',
      youtube: user?.socialAccounts?.youtube || '',
      twitter: user?.socialAccounts?.twitter || ''
    }
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('social.')) {
      const platform = name.split('.')[1];
      setFormData({
        ...formData,
        socialAccounts: { ...formData.socialAccounts, [platform]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await authAPI.updateProfile(formData);
      updateUser(data.user);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const subscriptionColors = {
    free: 'text-gray-400',
    pro: 'text-primary-400',
    enterprise: 'text-accent-400'
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          Profile Settings
        </h1>
        <p className="text-gray-400">
          Manage your account and social media connections
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="card text-center">
          <div className="mb-6">
            <img
              src={user?.avatar}
              alt={user?.username}
              className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-gray-800"
            />
            <h2 className="text-2xl font-bold text-white mb-1">
              {user?.username}
            </h2>
            <p className="text-gray-400 mb-4">{user?.email}</p>
            <span className={`inline-block px-4 py-2 rounded-full font-medium capitalize ${
              subscriptionColors[user?.subscription?.plan || 'free']
            } bg-gray-800`}>
              {user?.subscription?.plan || 'Free'} Plan
            </span>
          </div>

          <div className="text-sm text-gray-500 space-y-1">
            <p>Member since</p>
            <p className="text-white">
              {new Date(user?.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 card">
          <h3 className="text-xl font-bold text-white mb-6">Edit Profile</h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="input pl-11"
                    minLength={3}
                    maxLength={30}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input pl-11"
                    disabled
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="input"
                rows={3}
                maxLength={200}
                placeholder="Tell us about yourself..."
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.bio.length}/200 characters
              </p>
            </div>

            {/* Social Accounts */}
            <div>
              <h4 className="text-lg font-bold text-white mb-4">
                Social Media Accounts
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Instagram
                  </label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      name="social.instagram"
                      value={formData.socialAccounts.instagram}
                      onChange={handleChange}
                      className="input pl-11"
                      placeholder="@username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    TikTok
                  </label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                    <input
                      type="text"
                      name="social.tiktok"
                      value={formData.socialAccounts.tiktok}
                      onChange={handleChange}
                      className="input pl-11"
                      placeholder="@username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    YouTube
                  </label>
                  <div className="relative">
                    <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      name="social.youtube"
                      value={formData.socialAccounts.youtube}
                      onChange={handleChange}
                      className="input pl-11"
                      placeholder="@channel"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Twitter/X
                  </label>
                  <div className="relative">
                    <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      name="social.twitter"
                      value={formData.socialAccounts.twitter}
                      onChange={handleChange}
                      className="input pl-11"
                      placeholder="@username"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
