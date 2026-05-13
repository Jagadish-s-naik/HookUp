import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Zap, 
  Heart, 
  Calendar,
  ArrowUpRight,
  Target,
  Sparkles,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface AnalyticsData {
  total_hooks: number;
  avg_viral_score: number;
  saved_hooks: number;
  top_platform: string;
  hooks_last_30_days: number;
}

interface DailyData {
  day: string;
  count: number;
}

const COLORS = ['#7C3AED', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'];

export default function Analytics() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<AnalyticsData | null>(null);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [platformData, setPlatformData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch summary from view
      const { data: summaryData, error: summaryError } = await supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (summaryError && summaryError.code !== 'PGRST116') throw summaryError;
      setStats(summaryData);

      // Fetch daily counts from view
      const { data: dailyCounts, error: dailyError } = await supabase
        .from('hooks_daily')
        .select('day, count')
        .eq('user_id', user?.id)
        .order('day', { ascending: true });

      if (dailyError) throw dailyError;
      
      const formattedDaily = dailyCounts?.map(d => ({
        day: new Date(d.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        count: d.count
      })) || [];
      setDailyData(formattedDaily);

      // Fetch platform distribution
      const { data: hooks, error: hooksError } = await supabase
        .from('hooks')
        .select('platform')
        .eq('user_id', user?.id);

      if (hooksError) throw hooksError;

      const platformCounts = hooks?.reduce((acc: any, h: any) => {
        acc[h.platform] = (acc[h.platform] || 0) + 1;
        return acc;
      }, {});

      const formattedPlatforms = Object.keys(platformCounts || {}).map(key => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: platformCounts[key]
      }));
      setPlatformData(formattedPlatforms);

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    { 
      label: 'Total Hooks', 
      value: stats?.total_hooks || 0, 
      icon: Zap, 
      color: 'bg-primary/10 text-primary',
      desc: 'Hooks generated all-time'
    },
    { 
      label: 'Avg Viral Score', 
      value: stats?.avg_viral_score || 0, 
      icon: TrendingUp, 
      color: 'bg-orange-500/10 text-orange-500',
      desc: 'Out of 10 potential'
    },
    { 
      label: 'Saved Hooks', 
      value: stats?.saved_hooks || 0, 
      icon: Heart, 
      color: 'bg-rose-500/10 text-rose-500',
      desc: 'Items in your library'
    },
    { 
      label: 'Top Platform', 
      value: stats?.top_platform ? (stats.top_platform.charAt(0).toUpperCase() + stats.top_platform.slice(1)) : 'N/A', 
      icon: Target, 
      color: 'bg-blue-500/10 text-blue-500',
      desc: 'Most used destination'
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Analytics & Insights</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400">Track your performance and understand what hooks drive engagement.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6 rounded-2xl border-slate-100 dark:border-slate-800 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-xl ${m.color} flex items-center justify-center`}>
                <m.icon className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-300" />
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{m.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{m.value}</h3>
              <p className="text-[10px] text-slate-400 mt-2">{m.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass p-6 rounded-2xl border-slate-100 dark:border-slate-800 min-h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Hooks Generated (Last 30 Days)
              </h3>
            </div>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#64748B' }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#7C3AED" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Platform Distribution */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass p-6 rounded-2xl border-slate-100 dark:border-slate-800 min-h-[400px] flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-8">
              <PieChartIcon className="w-5 h-5 text-primary" /> Platform Reach
            </h3>
            <div className="flex-1 w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                {platformData.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">{p.name}</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white ml-auto">{p.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row - Psychological Triggers (Mocked for now as we don't have a view for it yet) */}
      <div className="glass p-8 rounded-3xl border-slate-100 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-32 h-32 text-primary" />
        </div>
        <div className="relative z-10 space-y-6">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">AI Content Insight</h3>
          <p className="text-slate-500 max-w-2xl leading-relaxed">
            Based on your recent generations, hooks using <span className="text-primary font-bold">Curiosity Gap</span> and <span className="text-primary font-bold">Social Proof</span> have the highest estimated viral potential for your <span className="text-slate-900 dark:text-white font-bold">{stats?.top_platform || 'Instagram'}</span> audience. 
            Try leaning more into contrarian statements to boost your average score.
          </p>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">Contrarian +15%</div>
            <div className="px-4 py-2 rounded-xl bg-orange-500/10 text-orange-500 text-xs font-bold uppercase tracking-widest">Curiosity +12%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
