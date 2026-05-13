import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Target, 
  TrendingUp, 
  Copy, 
  Share2, 
  ExternalLink, 
  Sparkles, 
  Gift, 
  IndianRupee,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

interface AffiliateStats {
  signups: number;
  conversions: number;
  conversion_rate: number;
  earnings: number;
}

export default function Affiliate() {
  const { profile } = useAuthStore();
  const [stats, setStats] = useState<AffiliateStats>({
    signups: 0,
    conversions: 0,
    conversion_rate: 0,
    earnings: 0
  });
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      fetchAffiliateStats();
    }
  }, [profile?.id]);

  const fetchAffiliateStats = async () => {
    setLoading(true);
    try {
      // Fetch stats from referrals table
      const { data: referrals, error: refError } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', profile?.id);

      if (refError) throw refError;

      const signups = referrals?.length || 0;
      const conversions = referrals?.filter(r => r.converted_at).length || 0;
      const earnings = referrals?.reduce((acc, r) => acc + (Number(r.commission_amount) || 0), 0) || 0;
      
      setStats({
        signups,
        conversions,
        conversion_rate: signups > 0 ? (conversions / signups) * 100 : 0,
        earnings
      });
    } catch (error) {
      console.error('Error fetching affiliate stats:', error);
      toast.error('Failed to load affiliate stats');
    } finally {
      setLoading(false);
    }
  };

  const referralLink = `${window.location.origin}/signup?ref=${profile?.referral_code}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopying(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopying(false), 2000);
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join HookAI',
          text: 'I\'m using HookAI to generate viral hooks. Join me and start creating scroll-stopping content!',
          url: referralLink,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyToClipboard();
    }
  };

  const metricCards = [
    { 
      label: 'Total Referrals', 
      value: stats.signups, 
      icon: Users, 
      color: 'bg-primary/10 text-primary',
      desc: 'Users who signed up with your link'
    },
    { 
      label: 'Conversions', 
      value: stats.conversions, 
      icon: Target, 
      color: 'bg-emerald-500/10 text-emerald-500',
      desc: 'Users who upgraded to a paid plan'
    },
    { 
      label: 'Conversion Rate', 
      value: `${stats.conversion_rate.toFixed(1)}%`, 
      icon: TrendingUp, 
      color: 'bg-orange-500/10 text-orange-500',
      desc: 'Percentage of referrals who converted'
    },
    { 
      label: 'Total Earnings', 
      value: `₹${stats.earnings}`, 
      icon: IndianRupee, 
      color: 'bg-blue-500/10 text-blue-500',
      desc: 'Commission earned from conversions'
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Gift className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Affiliate Program</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400">Share HookAI with your audience and earn 30% commission on every conversion.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Referral Link Card */}
        <div className="lg:col-span-12">
          <div className="glass p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/5 via-transparent to-primary/5 border-primary/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Sparkles className="w-48 h-48 text-primary" />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Your Referral Link</h2>
                  <p className="text-slate-500 mt-2">Earn ₹150+ for every user who upgrades to a paid plan.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch gap-3">
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      readOnly 
                      value={referralLink}
                      className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                    />
                  </div>
                  <Button 
                    onClick={copyToClipboard}
                    className="h-auto py-4 px-8 rounded-2xl gap-2 shadow-lg shadow-primary/20"
                  >
                    {copying ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    {copying ? 'Copied!' : 'Copy Link'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={shareLink}
                    className="h-auto py-4 px-8 rounded-2xl gap-2 border-slate-200"
                  >
                    <Share2 className="w-5 h-5" />
                    Share
                  </Button>
                </div>
                
                <div className="flex flex-wrap items-center gap-6 pt-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 30% Lifetime Commission
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 60-Day Cookie Duration
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Payouts via Razorpay
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-64 aspect-square rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-xl flex flex-col items-center justify-center text-center space-y-4 border border-slate-100 dark:border-slate-800">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Referral Code</div>
                <div className="text-4xl font-black text-primary tracking-tighter">{profile?.referral_code?.toUpperCase()}</div>
                <p className="text-[10px] text-slate-400 font-medium">Use this code for manual attribution</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="lg:col-span-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metricCards.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass p-6 rounded-2xl border-slate-100 dark:border-slate-800 flex flex-col gap-4 group hover:border-primary/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-xl ${m.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                    <m.icon className="w-6 h-6" />
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{m.label}</p>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{loading ? '...' : m.value}</h3>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium">{m.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Info Sections */}
        <div className="lg:col-span-7 space-y-8">
          <div className="glass p-8 rounded-3xl border-slate-100 dark:border-slate-800 space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" /> How it works
            </h3>
            <div className="space-y-6">
              {[
                { 
                  title: 'Share your link', 
                  desc: 'Share your unique referral link on social media, in your newsletter, or on your website.' 
                },
                { 
                  title: 'User signs up', 
                  desc: 'When someone clicks your link and signs up, they are automatically attributed to you.' 
                },
                { 
                  title: 'Earn commission', 
                  desc: 'When they upgrade to any paid plan, you earn 30% of their subscription fee every month.' 
                }
              ].map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{step.title}</h4>
                    <p className="text-slate-500 text-sm mt-1">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <div className="glass p-8 rounded-3xl border-slate-100 dark:border-slate-800 bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 opacity-20 pointer-events-none">
              <IndianRupee className="w-40 h-40 text-white" />
            </div>
            <div className="relative z-10 space-y-6">
              <h3 className="text-xl font-bold">Earnings & Payouts</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                  <span className="text-slate-400 text-sm">Available for withdrawal</span>
                  <span className="text-3xl font-black">₹{stats.earnings}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Payouts are processed automatically every Friday via Razorpay Payouts. Minimum withdrawal amount is ₹500.
                </p>
                <Button className="w-full h-12 bg-white text-slate-900 hover:bg-slate-100 border-none shadow-none mt-4 font-bold disabled:opacity-50 disabled:cursor-not-allowed" disabled={stats.earnings < 500}>
                  Request Payout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
