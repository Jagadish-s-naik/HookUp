import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, CalendarClock, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import ContentCalendar from '../components/calendar/ContentCalendar';
import ScheduleModal from '../components/calendar/ScheduleModal';
import { useCalendarStore, type ScheduledPost, type PostStatus } from '../store/calendarStore';

export default function Calendar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateForModal, setSelectedDateForModal] = useState<Date | undefined>(undefined);
  const [editingEntry, setEditingEntry] = useState<ScheduledPost | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<PostStatus | 'all'>('all');

  const { entries } = useCalendarStore();

  const handleAddEntry = (date?: Date) => {
    setEditingEntry(undefined);
    setSelectedDateForModal(date);
    setIsModalOpen(true);
  };

  const handleEditEntry = (entry: ScheduledPost) => {
    setEditingEntry(entry);
    setSelectedDateForModal(undefined);
    setIsModalOpen(true);
  };

  // Stats calculation
  const pendingCount = entries.filter(e => e.status === 'pending').length;
  const approvedCount = entries.filter(e => e.status === 'approved').length;
  const draftCount = entries.filter(e => e.status === 'draft').length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Content Calendar</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Plan, schedule, and visualize your content strategy.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(['all', 'draft', 'pending', 'approved'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as PostStatus | 'all')}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${
                  statusFilter === status
                    ? 'bg-white dark:bg-slate-900 text-primary shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <Button 
            size="sm" 
            className="gap-2 shadow-lg shadow-primary/20 w-full sm:w-auto"
            onClick={() => handleAddEntry()}
          >
            <Plus className="w-4 h-4" /> Schedule Post
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Scheduled', value: entries.length, icon: CalendarClock, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
          { label: 'Pending Review', value: pendingCount, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
          { label: 'Approved & Ready', value: approvedCount, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
          { label: 'Drafts', value: draftCount, icon: AlertCircle, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-500/10' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-5 rounded-2xl border-slate-200 dark:border-slate-800 flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-[32px] border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none"
      >
        <ContentCalendar 
          onAddEntry={handleAddEntry} 
          onEditEntry={handleEditEntry}
          statusFilter={statusFilter}
        />
      </motion.div>

      <ScheduleModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingEntry(undefined);
        }} 
        selectedDate={selectedDateForModal}
        editingEntry={editingEntry}
      />
    </div>
  );
}

