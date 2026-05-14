import { useState, useEffect } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, Share2, Youtube, Instagram, Twitter, Loader2, Trash2 } from 'lucide-react';
import { useCalendarStore, ScheduledPost } from '../../store/calendarStore';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';

const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  tiktok: Share2,
  youtube: Youtube,
  twitter: Twitter,
  linkedin: Share2
};

const PLATFORM_COLORS: Record<string, string> = {
  instagram: 'bg-pink-500',
  tiktok: 'bg-slate-900',
  youtube: 'bg-red-600',
  twitter: 'bg-blue-400',
  linkedin: 'bg-blue-700'
};

interface ContentCalendarProps {
  onAddEntry?: (date: Date) => void;
  onEditEntry?: (entry: ScheduledPost) => void;
}

export default function ContentCalendar({ onAddEntry, onEditEntry }: ContentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { user } = useAuthStore();
  const { entries, isLoading, fetchEntries, deleteEntry } = useCalendarStore();

  useEffect(() => {
    if (user?.id) {
      fetchEntries(user.id);

      // Real-time subscription for calendar changes
      const channel = supabase
        .channel(`public:scheduled_posts:${user.id}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'scheduled_posts',
          filter: `user_id=eq.${user.id}`
        }, () => {
          fetchEntries(user.id);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id, fetchEntries]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="bg-white dark:bg-slate-950 min-h-[600px] relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-slate-950/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Strategy...</p>
          </div>
        </div>
      )}

      {/* Calendar Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-xl font-bold">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={prevMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Today
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day) => {
          const dayEntries = entries.filter(entry => isSameDay(parseISO(entry.scheduled_at), day));
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());
          const isSelected = isSameDay(day, selectedDate);

          return (
            <div 
              key={day.toString()}
              onClick={() => setSelectedDate(day)}
              className={`min-h-[160px] p-2 border-r border-b border-slate-100 dark:border-slate-800 transition-all cursor-pointer group ${
                !isCurrentMonth ? 'bg-slate-50/30 dark:bg-slate-900/10' : ''
              } ${isSelected ? 'ring-2 ring-inset ring-primary z-[1]' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold rounded-lg w-7 h-7 flex items-center justify-center ${
                  isToday 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : isCurrentMonth ? 'text-slate-700 dark:text-slate-300' : 'text-slate-300 dark:text-slate-600'
                }`}>
                  {format(day, 'd')}
                </span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddEntry?.(day);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-primary/10 rounded-md transition-all"
                >
                  <PlusIcon className="w-3 h-3 text-primary" />
                </button>
              </div>

              <div className="space-y-1.5">
                {dayEntries.map(entry => {
                  const Icon = PLATFORM_ICONS[entry.platform] || Share2;
                  return (
                    <div 
                      key={entry.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditEntry?.(entry);
                      }}
                      className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-primary/30 hover:shadow-md transition-all group/item relative overflow-hidden"
                    >
                      <div className={`w-5 h-5 flex-shrink-0 rounded-md ${PLATFORM_COLORS[entry.platform]} flex items-center justify-center shadow-sm`}>
                        <Icon className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-[10px] font-bold truncate text-slate-700 dark:text-slate-300 pr-4">
                        {entry.title}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteEntry(entry.id);
                        }}
                        className="absolute right-1 opacity-0 group-hover/item:opacity-100 p-1 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  );
}


