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
  Flame,
  ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';

const stats = [
  { label: 'Hooks Today', value: '12', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  { label: 'Total Generated', value: '1,284', icon: Sparkles, color: 'text-primary', bg: 'bg-primary/5' },
  { label: 'Saved Hooks', value: '86', icon: Library, color: 'text-blue-500', bg: 'bg-blue-50' },
  { label: 'Daily Streak', value: '7 Days', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
];

const recentHooks = [
  { id: 1, text: "I tried 100 different AI tools so you don't have to. Here's the truth...", type: 'LinkedIn', date: '2 hours ago', engagement: 'High' },
  { id: 2, text: "Stop using ChatGPT for your hooks. Use this simple 3-step formula instead.", type: 'X / Twitter', date: '5 hours ago', engagement: 'Medium' },
  { id: 3, text: "The secret to 10k followers isn't consistency. It's this one thing.", type: 'Instagram', date: '1 day ago', engagement: 'Very High' },
];

export default function Dashboard() {
  const { profile } = useAuthStore();

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Creator'}!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            You have 5 free generations remaining today.
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
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
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
            {recentHooks.map((hook) => (
              <div 
                key={hook.id} 
                className="group glass p-5 rounded-xl border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400">
                      {hook.type}
                    </span>
                    <span className="text-xs text-slate-400">{hook.date}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-green-500">
                    <TrendingUp className="w-3 h-3" /> {hook.engagement} Engagement
                  </div>
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-medium line-clamp-2">
                  {hook.text}
                </p>
                <div className="mt-4 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="h-8 text-xs">Copy</Button>
                  <Button variant="outline" size="sm" className="h-8 text-xs">Edit</Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Content: Tips & Analytics */}
        <div className="space-y-8">
          {/* Daily Goal Card */}
          <div className="bg-primary p-6 rounded-2xl text-white relative overflow-hidden shadow-xl shadow-primary/30">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-2">Weekly Goal</h3>
              <p className="text-white/80 text-sm mb-4">You've reached 80% of your weekly generation goal. Keep going!</p>
              <div className="w-full h-2 bg-white/20 rounded-full mb-6">
                <div className="w-4/5 h-full bg-white rounded-full" />
              </div>
              <Button variant="secondary" className="w-full text-primary font-bold">
                View Insights
              </Button>
            </div>
            <Sparkles className="absolute bottom-[-20px] right-[-20px] w-32 h-32 text-white/10 rotate-12" />
          </div>

          {/* Quick Analytics Tip */}
          <div className="glass p-6 rounded-2xl border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">Pro Tip</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Hooks that start with "I tried X so you don't have to" have seen a 40% increase in engagement this week in the <strong>{profile?.niche || 'Technology'}</strong> niche.
            </p>
            <button className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
              Read More Trends <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
