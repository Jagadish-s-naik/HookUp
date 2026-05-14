import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import Button from '../components/ui/Button';
import ContentCalendar from '../components/calendar/ContentCalendar';

export default function Calendar() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Content Calendar</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Plan, schedule, and visualize your content strategy.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" /> Filter
          </Button>
          <Button size="sm" className="gap-2 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> Schedule Post
          </Button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        <ContentCalendar />
      </motion.div>
    </div>
  );
}
