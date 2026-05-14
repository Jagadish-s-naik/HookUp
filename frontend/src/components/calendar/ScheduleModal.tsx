import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar as CalendarIcon, Instagram, Youtube, Twitter, Share2, Loader2 } from 'lucide-react';
import { useCalendarStore, ScheduledPost } from '../../store/calendarStore';
import { useAuthStore } from '../../store/authStore';
import type { User } from '@supabase/supabase-js';
import Button from '../ui/Button';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  initialTitle?: string;
  initialContent?: string;
  initialPlatform?: string;
  editingEntry?: ScheduledPost;
}

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-600' },
  { id: 'tiktok', name: 'TikTok', icon: Share2, color: 'text-slate-900 dark:text-white' },
  { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'text-blue-400' },
  { id: 'linkedin', name: 'LinkedIn', icon: Share2, color: 'text-blue-700' },
];

interface ContentProps extends ScheduleModalProps {
  user: User | null;
  addEntry: (entry: Omit<ScheduledPost, 'id' | 'created_at'>) => Promise<void>;
  updateEntry: (id: string, entry: Partial<ScheduledPost>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
}


function ScheduleModalContent({ 
  onClose, 
  selectedDate,
  initialTitle = '',
  initialContent = '',
  initialPlatform = 'instagram',
  editingEntry,
  user,
  addEntry,
  updateEntry,
  deleteEntry
}: ContentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize state directly from props/editingEntry
  const scheduledDate = editingEntry ? new Date(editingEntry.scheduled_at) : null;
  
  const [formData, setFormData] = useState({
    title: editingEntry?.title || initialTitle,
    content: editingEntry?.content || initialContent || '',
    platform: editingEntry?.platform || initialPlatform,
    status: editingEntry?.status || 'pending',
    date: scheduledDate ? scheduledDate.toISOString().split('T')[0] : (selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
    time: scheduledDate ? scheduledDate.toTimeString().split(' ')[0].substring(0, 5) : '12:00'
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsSubmitting(true);
    try {
      const scheduledAt = new Date(`${formData.date}T${formData.time}`).toISOString();
      
      if (editingEntry) {
        await updateEntry(editingEntry.id, {
          title: formData.title,
          content: formData.content,
          platform: formData.platform,
          status: formData.status as any,
          scheduled_at: scheduledAt
        });
      } else {
        await addEntry({
          user_id: user.id,
          title: formData.title,
          content: formData.content,
          platform: formData.platform,
          status: formData.status as any,
          scheduled_at: scheduledAt
        });
      }

      
      onClose();
    } catch (error) {
      console.error('Failed to save post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingEntry) return;
    if (!confirm('Are you sure you want to delete this scheduled post?')) return;

    setIsDeleting(true);
    try {
      await deleteEntry(editingEntry.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete post:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 z-[70] overflow-hidden"
    >
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
        <div>
          <h3 className="text-xl font-black tracking-tight">{editingEntry ? 'Edit Post' : 'Schedule Post'}</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            {editingEntry ? 'Update your content details' : 'Plan your next viral hit'}
          </p>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Platform</label>
          <div className="grid grid-cols-5 gap-2">
            {PLATFORMS.map((platform) => (
              <button
                key={platform.id}
                type="button"
                onClick={() => setFormData({ ...formData, platform: platform.id })}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                  formData.platform === platform.id 
                    ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <platform.icon className={`w-5 h-5 ${platform.color}`} />
                <span className="text-[10px] font-bold">{platform.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Post Title</label>
          <input
            required
            type="text"
            placeholder="e.g. How I built HookUp"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary font-bold placeholder:text-slate-400"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Status</label>
          <div className="flex gap-2">
            {(['draft', 'pending', 'approved'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFormData({ ...formData, status })}
                className={`flex-1 py-2 px-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                  formData.status === status
                    ? status === 'approved' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                      status === 'pending' ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20' :
                      'bg-slate-600 border-slate-600 text-white shadow-lg shadow-slate-600/20'
                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Date</label>
            <input
              required
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary font-bold"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Time</label>
            <input
              required
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary font-bold"
            />
          </div>
        </div>


        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Notes / Caption (Optional)</label>
          <textarea
            rows={3}
            placeholder="Draft your content here..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary font-bold placeholder:text-slate-400 resize-none"
          />
        </div>

        <div className="flex gap-3">
          {editingEntry && (
            <Button 
              type="button" 
              variant="outline"
              onClick={handleDelete}
              disabled={isSubmitting || isDeleting}
              className="flex-1 py-4 rounded-2xl border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors gap-2"
            >
              {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
              Delete
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isSubmitting || isDeleting}
            className={`${editingEntry ? 'flex-[2]' : 'w-full'} py-4 rounded-2xl shadow-xl shadow-primary/20 gap-2`}
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CalendarIcon className="w-5 h-5" />}
            {isSubmitting ? (editingEntry ? 'Updating...' : 'Scheduling...') : (editingEntry ? 'Update Post' : 'Schedule Post')}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

export default function ScheduleModal(props: ScheduleModalProps) {
  const { user } = useAuthStore();
  const { addEntry, updateEntry, deleteEntry } = useCalendarStore();

  return (
    <AnimatePresence>
      {props.isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={props.onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[60]"
          />
          <ScheduleModalContent 
            {...props} 
            key={props.editingEntry?.id || 'new'}
            user={user}
            addEntry={addEntry}
            updateEntry={updateEntry}
            deleteEntry={deleteEntry}
          />
        </>
      )}
    </AnimatePresence>
  );
}
