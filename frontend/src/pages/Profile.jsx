import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { 
  UserCog, Mail, Lock, Save, Loader2, Shield, Phone, 
  Calendar, Clock, Activity, Users, Image as ImageIcon, CheckCircle, BarChart3,
  ShieldCheck, Sparkles, KeyRound, CheckCircle2, Leaf, Zap, Award
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import GlassCard from '../components/GlassCard';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { token, user } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone_number: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirm_password: ''
  });

  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setFormData(prev => ({
          ...prev,
          username: data.username || prev.username,
          email: data.email || prev.email,
          phone_number: data.phone_number || ''
        }));
        setProfileData(data);
      } else {
        toast.error(data.error || 'Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim()) {
      toast.error('Full Name is required');
      return;
    }
    
    setSavingProfile(true);
    try {
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: formData.username,
          phone_number: formData.phone_number
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Profile updated successfully!');
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Network error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.password !== passwordData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    
    setSavingPassword(true);
    try {
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          password: passwordData.password
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Password changed successfully! Please log in again.');
        setPasswordData({ password: '', confirm_password: '' });
      } else {
        toast.error(data.error || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Network error');
    } finally {
      setSavingPassword(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 md:p-8 flex justify-center items-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-primary-green" size={48} />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading Profile Dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = profileData?.stats || {};
  const currentUsername = formData.username || user?.username || 'User';

  return (
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      
      {/* 1. SaaS Hero Profile Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <GlassCard tilt={false} className="p-6 md:p-8 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            {/* User Details & Avatar */}
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-emerald-500/25 border-2 border-white/20">
                  {getInitials(currentUsername)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-900 flex items-center justify-center" title="Active Account">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    {currentUsername}
                  </h1>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 capitalize">
                    {profileData?.role || user?.role || 'User'}
                  </span>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1">
                    <ShieldCheck size={13} /> Verified
                  </span>
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Mail size={14} className="text-emerald-500" />
                  {formData.email || 'No email provided'}
                </p>
              </div>
            </div>

            {/* Quick Metadata Chips */}
            <div className="flex flex-wrap md:flex-col lg:flex-row gap-3 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-xs text-gray-600 dark:text-gray-300">
                <Calendar size={14} className="text-emerald-500" />
                <span>Joined <strong className="text-gray-900 dark:text-white">{formatDate(profileData?.created_at)}</strong></span>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-xs text-gray-600 dark:text-gray-300">
                <Clock size={14} className="text-blue-500" />
                <span>Last active <strong className="text-gray-900 dark:text-white">{formatDate(profileData?.last_login)}</strong></span>
              </div>
            </div>

          </div>
        </GlassCard>
      </motion.div>

      {/* 2. Responsive 4-Column KPI Stats Row */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="text-emerald-500" size={20} />
            {user?.role === 'admin' ? 'System Metrics' : 'Your Activity Overview'}
          </h2>
          <span className="text-xs text-gray-400 font-medium">Real-time statistics</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {user?.role === 'admin' ? (
            <>
              <StatCard 
                title="Total Platform Users" 
                value={stats.total_users || 0} 
                subtitle="Registered accounts"
                icon={<Users size={22} />} 
                color="from-blue-500 to-indigo-600"
              />
              <StatCard 
                title="Total AI Predictions" 
                value={stats.total_predictions || 0} 
                subtitle="Waste classifications"
                icon={<Activity size={22} />} 
                color="from-emerald-500 to-teal-600"
              />
              <StatCard 
                title="Active Users (30d)" 
                value={stats.active_users || 0} 
                subtitle="Monthly active logins"
                icon={<CheckCircle2 size={22} />} 
                color="from-violet-500 to-purple-600"
              />
              <StatCard 
                title="Images Processed" 
                value={stats.total_images_processed || 0} 
                subtitle="Total dataset scans"
                icon={<ImageIcon size={22} />} 
                color="from-amber-500 to-orange-600"
              />
            </>
          ) : (
            <>
              <StatCard 
                title="Images Uploaded" 
                value={stats.images_uploaded || 0} 
                subtitle="Total items scanned"
                icon={<ImageIcon size={22} />} 
                color="from-blue-500 to-indigo-600"
              />
              <StatCard 
                title="Total Predictions" 
                value={stats.total_predictions || 0} 
                subtitle="AI classifications"
                icon={<Activity size={22} />} 
                color="from-emerald-500 to-teal-600"
              />
              <StatCard 
                title="Average AI Confidence" 
                value={stats.avg_confidence ? `${stats.avg_confidence.toFixed(1)}%` : '0%'} 
                subtitle="Accuracy rate"
                icon={<Award size={22} />} 
                color="from-violet-500 to-purple-600"
              />
              <StatCard 
                title="Last Prediction" 
                value={stats.last_prediction !== 'N/A' ? stats.last_prediction.split(' ')[0] : 'N/A'} 
                subtitle="Recent scan date"
                icon={<Clock size={22} />} 
                color="from-amber-500 to-orange-600"
              />
            </>
          )}
        </div>
      </motion.div>

      {/* 3. Balanced 2-Column Equal-Height Settings Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch"
      >
        {/* Left Card: Account Details */}
        <GlassCard tilt={false} className="p-6 md:p-7 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20">
                  <UserCog size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Account Details</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Update your personal contact information</p>
                </div>
              </div>
            </div>

            <form id="profile-form" onSubmit={handleProfileSubmit} className="space-y-4">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-0.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <UserCog className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3.5 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl leading-5 bg-white/60 dark:bg-black/20 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm transition-all"
                    placeholder="Enter full name"
                    required
                  />
                </div>
              </div>

              {/* Email Address (Read-Only) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-0.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Email Address
                  </label>
                  <span className="text-[11px] text-gray-400 font-medium">(Read-only)</span>
                </div>
                <div className="relative opacity-80">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="block w-full pl-10 pr-3.5 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl leading-5 bg-gray-100 dark:bg-black/40 text-gray-600 dark:text-gray-400 cursor-not-allowed text-sm"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-0.5">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3.5 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl leading-5 bg-white/60 dark:bg-black/20 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm transition-all"
                    placeholder="e.g. +1 (555) 000-0000"
                  />
                </div>
              </div>

              {/* Account Meta Badges */}
              <div className="pt-2 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-xs text-gray-600 dark:text-gray-300">
                  <ShieldCheck size={15} className="text-emerald-500 flex-shrink-0" />
                  <div className="truncate">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Account Role</p>
                    <p className="font-semibold capitalize text-gray-800 dark:text-gray-200 truncate">{profileData?.role || 'User'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-xs text-gray-600 dark:text-gray-300">
                  <CheckCircle size={15} className="text-blue-500 flex-shrink-0" />
                  <div className="truncate">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Status</p>
                    <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">Active Member</p>
                  </div>
                </div>
              </div>

            </form>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              form="profile-form"
              disabled={savingProfile}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed text-sm"
            >
              {savingProfile ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </GlassCard>

        {/* Right Card: Security & Password */}
        <GlassCard tilt={false} className="p-6 md:p-7 flex flex-col justify-between h-full border-rose-500/20">
          <div>
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  <Shield size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Security & Password</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Update your account security credentials</p>
                </div>
              </div>
            </div>

            <form id="password-form" onSubmit={handlePasswordSubmit} className="space-y-4">
              
              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-0.5">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={passwordData.password}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                    className="block w-full pl-10 pr-3.5 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl leading-5 bg-white/60 dark:bg-black/20 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 text-sm transition-all"
                    placeholder="Enter new password (min 6 chars)"
                  />
                </div>
              </div>
              
              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider ml-0.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="confirm_password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                    className="block w-full pl-10 pr-3.5 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl leading-5 bg-white/60 dark:bg-black/20 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 text-sm transition-all"
                    placeholder="Re-enter new password"
                  />
                </div>
              </div>

              {/* Security Health Indicator Box */}
              <div className="pt-2 p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/10 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                  <KeyRound size={13} /> Security Standards
                </p>
                <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                    <span>JWT Token Security Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                    <span>Passwords stored with Werkzeug Hashing</span>
                  </div>
                </div>
              </div>

            </form>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              form="password-form"
              disabled={savingPassword}
              className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500 text-rose-600 dark:text-rose-400 hover:text-white font-semibold py-3 px-4 rounded-xl border border-rose-500/20 hover:border-rose-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {savingPassword ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
              {savingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </div>
        </GlassCard>
      </motion.div>

      {/* 4. Bottom Smart Waste AI Environmental Impact Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <GlassCard tilt={false} className="p-6 relative overflow-hidden bg-gradient-to-r from-emerald-900/10 via-teal-900/10 to-blue-900/10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Leaf size={26} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Smart Waste AI System Impact
                  <Sparkles size={15} className="text-amber-500" />
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Deep learning vision model operational for automated eco-friendly waste sorting.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <Zap size={14} /> Real-Time Inference
              </span>
              <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1.5">
                <ShieldCheck size={14} /> SaaS Encryption
              </span>
            </div>

          </div>
        </GlassCard>
      </motion.div>

    </div>
  );
};

// Reusable stat card component with full-height support and modern SaaS styling
const StatCard = ({ title, value, subtitle, icon, color }) => (
  <GlassCard tilt={false} className="p-5 relative overflow-hidden group h-full flex flex-col justify-between">
    <div className={`absolute -right-6 -top-6 w-20 h-20 bg-gradient-to-br ${color} rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500 pointer-events-none`} />
    
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase">{title}</p>
        <h4 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{value}</h4>
      </div>
      <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-md shadow-black/10 flex-shrink-0`}>
        {icon}
      </div>
    </div>

    {subtitle && (
      <div className="pt-3 mt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-[11px] text-gray-400 font-medium">
        <span>{subtitle}</span>
        <span className="text-emerald-500 font-bold group-hover:translate-x-0.5 transition-transform">Live &rarr;</span>
      </div>
    )}
  </GlassCard>
);

export default Profile;

