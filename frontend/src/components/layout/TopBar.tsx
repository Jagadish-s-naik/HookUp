import { Bell, Search, User, Zap } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { usePlan } from '../../hooks/usePlan';
import { useUIStore } from '../../store/uiStore';

export default function TopBar() {
  const { profile, user } = useAuthStore();
  const { plan, usage, limits, remainingToday, isFree } = usePlan();
  const { openUpgradeModal } = useUIStore();

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search hooks..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-900 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => isFree && openUpgradeModal('daily_hooks')}
          className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            isFree 
              ? 'bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer' 
              : 'bg-emerald-500/10 text-emerald-600'
          }`}
        >
          <span className="capitalize">{plan} Plan</span>
          <div className={`w-px h-3 ${isFree ? 'bg-primary/20' : 'bg-emerald-500/20'}`} />
          <span>
            {isFree 
              ? `${usage.today}/${limits.dailyHooks} hooks used today`
              : 'Unlimited Daily Generation'
            }
          </span>
          {isFree && <Zap className="w-3 h-3 ml-1 fill-current" />}
        </button>

        <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white dark:border-slate-950 rounded-full" />
        </button>

        <button className="flex items-center gap-2 p-1 pl-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <span className="text-sm font-medium">{displayName}</span>
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={displayName} className="w-full h-full rounded-full object-cover" />
            ) : (
              initial
            )}
          </div>
        </button>
      </div>
    </header>
  );
}
