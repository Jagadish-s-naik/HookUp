import { motion } from 'framer-motion';
import { 
  Sparkles, 
  TrendingUp, 
  Library, 
  Clock, 
  Zap, 
  ChevronRight, 
  Plus,
  BarChart3,
  ChevronRight, 
  Plus,
  BarChart3,
  ArrowUpRight,
  Copy
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { usePlan } from '../hooks/usePlan';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const { profile } = useAuthStore();
  const { remainingToday, isFree, plan } = usePlan();

  // Fetch Summary Stats
  const { data: analytics, isLoading: isStatsLoading } = useQuery({
    queryKey: ['user_analytics', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', profile?.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data || {
        total_hooks: 0,
        avg_viral_score: 0,
        saved_hooks: 0,
        top_platform: 'N/A'
      };
    },
    enabled: !!profile?.id,
  });

  // Fetch Recent Hooks
  const { data: recentHooks, isLoading: isHooksLoading } = useQuery({
    queryKey: ['recent_hooks', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hooks')
        .select('*')
        .eq('user_id', profile?.id)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  const stats = [
    { 
      label: 'Hooks Today', 
      value: profile?.hooks_used_today || 0, 
      icon: Zap, 
      color: 'text-yellow-500', 
      bg: 'bg-yellow-50' 
    },
    { 
      label: 'Total Generated', 
      value: analytics?.total_hooks || 0, 
      icon: Sparkles, 
      color: 'text-primary', 
      bg: 'bg-primary/5' 
    },
    { 
      label: 'Saved Hooks', 
      value: analytics?.saved_hooks || 0, 
      icon: Library, 
      color: 'text-blue-500', 
      bg: 'bg-blue-50' 
    },
    { 
      label: 'Avg Viral Score', 
      value: analytics?.avg_viral_score || 0, 
      icon: TrendingUp, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-50' 
    },
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Hook copied to clipboard!');
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Welcome back, {profile?.name?.split(' ')[0] || 'Creator'}!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {isFree 
              ? `You have ${remainingToday} free generations remaining today.` 
              : `You are on the ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan.`
            }
          </p>
        </div>
        <Link to="/generate">
          <Button className="gap-2 shadow-xl shadow-primary/20">
            <Plus className="w-4 h-4" /> Create New Hook
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass p-6 rounded-2xl flex items-center gap-4 border-slate-100 dark:border-slate-800"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
              {isStatsLoading ? (
                <div className="h-7 w-16 bg-slate-100 dark:bg-slate-800 animate-pulse rounded" />
              ) : (
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> Recent Hooks
            </h2>
            <Link to="/library" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {isHooksLoading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="glass p-5 rounded-xl border-slate-100 dark:border-slate-800 h-32 animate-pulse" />
              ))
            ) : recentHooks?.length === 0 ? (
              <div className="glass p-12 rounded-xl border-dashed border-2 border-slate-200 dark:border-slate-800 text-center">
                <p className="text-slate-500 dark:text-slate-400 mb-4">No hooks generated yet.</p>
                <Link to="/generate">
                  <Button variant="outline" size="sm">Start Generating</Button>
                </Link>
              </div>
            ) : (
              recentHooks?.map((hook) => (
                <div 
                  key={hook.id} 
                  className="group glass p-5 rounded-xl border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400">
                        {hook.platform}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatDistanceToNow(new Date(hook.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-emerald-500">
                      <TrendingUp className="w-3 h-3" /> {hook.viral_score}/10 Viral Score
                    </div>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 font-medium line-clamp-2">
                    {hook.hook_text}
                  </p>
                  <div className="mt-4 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-xs gap-1"
                      onClick={() => handleCopy(hook.hook_text)}
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar Content: Tips & Analytics */}
        <div className="space-y-8">
          {/* Daily Goal Card */}
          <div className="bg-primary p-6 rounded-2xl text-white relative overflow-hidden shadow-xl shadow-primary/30">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-2">Daily Progress</h3>
              <p className="text-white/80 text-sm mb-4">
                {isFree 
                  ? `You've used ${profile?.hooks_used_today || 0} of your 5 daily generations.`
                  : "You're crushing it! Keep the momentum going."
                }
              </p>
              {isFree && (
                <div className="w-full h-2 bg-white/20 rounded-full mb-6">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, ((profile?.hooks_used_today || 0) / 5) * 100)}%` }}
                  />
                </div>
              )}
              <Link to="/analytics">
                <Button variant="secondary" className="w-full text-primary font-bold">
                  View Full Insights
                </Button>
              </Link>
            </div>
            <Sparkles className="absolute bottom-[-20px] right-[-20px] w-32 h-32 text-white/10 rotate-12" />
          </div>

          {/* Quick Analytics Tip */}
          <div className="glass p-6 rounded-2xl border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">Niche Insight</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Hooks that start with "The secret to..." have seen a 25% higher engagement rate in the <strong>{profile?.niche || 'selected'}</strong> niche.
            </p>
            <Link to="/generate" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
              Try This Pattern <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
