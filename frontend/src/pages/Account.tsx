import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { usePlan } from '../hooks/usePlan';
import { supabase } from '../lib/supabase';
import { 
  User, 
  Mail, 
  Layout, 
  Target, 
  Globe, 
  CreditCard, 
  LogOut, 
  Save, 
  CheckCircle2,
  TrendingUp,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function Account() {
  const { profile, setProfile, signOut } = useAuthStore();
  const { plan, limits, usage, remainingToday } = usePlan();
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    niche: profile?.niche || '',
    goal: profile?.goal || '',
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          niche: formData.niche,
          goal: formData.goal,
        })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile({
        ...profile,
        ...formData
      });
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const calculateProgress = (used: number, limit: number) => {
    if (limit === Infinity) return 0;
    return Math.min(100, (used / limit) * 100);
  };

  const hookProgress = calculateProgress(
    plan === 'free' ? usage.today : usage.month,
    plan === 'free' ? limits.dailyHooks : limits.monthlyHooks
  );

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 p-4 md:p-8">
      <motion.div 
        className="max-w-6xl mx-auto space-y-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <User className="w-8 h-8 text-primary" />
              Account Settings
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Manage your profile preferences and subscription plan.
            </p>
          </div>
          <button 
            onClick={() => signOut()}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            <div className="glass rounded-2xl p-6 md:p-8 border border-white/20 dark:border-slate-800/50">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Personal Information
              </h2>
              
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Display Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="Your name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="email"
                        value={profile?.email || ''}
                        disabled
                        className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Content Niche
                    </label>
                    <div className="relative">
                      <Layout className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="text"
                        value={formData.niche}
                        onChange={(e) => setFormData(prev => ({ ...prev, niche: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="e.g. Tech, Lifestyle"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Primary Goal
                    </label>
                    <div className="relative">
                      <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="text"
                        value={formData.goal}
                        onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="e.g. Increase Engagement"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 active:scale-95"
                  >
                    {isUpdating ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>

            <div className="glass rounded-2xl p-6 md:p-8 border border-white/20 dark:border-slate-800/50">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Active Platforms
              </h2>
              <div className="flex flex-wrap gap-3">
                {profile?.platforms?.map((platform) => (
                  <span 
                    key={platform}
                    className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-medium flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {platform}
                  </span>
                )) || <p className="text-slate-500 italic text-sm">No platforms selected</p>}
              </div>
            </div>
          </motion.div>

          {/* Plan Section */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="glass rounded-2xl p-6 border border-white/20 dark:border-slate-800/50 overflow-hidden relative">
              {/* Background Decoration */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
              
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Subscription
              </h2>

              <div className="space-y-6">
                <div className="p-4 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-primary uppercase tracking-wider">Current Plan</span>
                    <Zap className="w-4 h-4 text-primary fill-primary" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
                    {plan} Plan
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Usage this {plan === 'free' ? 'day' : 'month'}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {plan === 'free' ? usage.today : usage.month} / {plan === 'free' ? limits.dailyHooks : (limits.monthlyHooks === Infinity ? '∞' : limits.monthlyHooks)}
                    </span>
                  </div>
                  
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-primary to-violet-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${hookProgress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  
                  {plan === 'free' && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Your daily limit resets in a few hours. 
                      <span className="text-primary font-medium ml-1 cursor-pointer hover:underline">
                        Upgrade for more
                      </span>
                    </p>
                  )}
                </div>

                <div className="pt-4 space-y-3">
                  <button className="w-full py-3 px-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-95">
                    Manage Subscription
                  </button>
                  {plan === 'free' && (
                    <button className="w-full py-3 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 shadow-sm">
                      Upgrade to Pro
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats/Tips */}
            <div className="glass rounded-2xl p-6 border border-white/20 dark:border-slate-800/50">
              <h3 className="font-semibold mb-4">Plan Benefits</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  {limits.dailyHooks === Infinity ? 'Unlimited' : limits.dailyHooks} daily hook generations
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Access to {limits.platforms} platform templates
                </li>
                {limits.hasBrandVoice && (
                  <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    AI Brand Voice Personalization
                  </li>
                )}
                {limits.hasCalendar && (
                  <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    Content Calendar Integration
                  </li>
                )}
              </ul>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
