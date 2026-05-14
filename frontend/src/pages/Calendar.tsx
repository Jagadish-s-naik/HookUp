import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Filter } from 'lucide-react';
import Button from '../components/ui/Button';
import ContentCalendar from '../components/calendar/ContentCalendar';
import ScheduleModal from '../components/calendar/ScheduleModal';
import { ScheduledPost } from '../store/calendarStore';

export default function Calendar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateForModal, setSelectedDateForModal] = useState<Date | undefined>(undefined);
  const [editingEntry, setEditingEntry] = useState<ScheduledPost | undefined>(undefined);

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

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Content Calendar</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Plan, schedule, and visualize your content strategy.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 border-slate-200 dark:border-slate-800">
            <Filter className="w-4 h-4" /> Filter
          </Button>
          <Button 
            size="sm" 
            className="gap-2 shadow-lg shadow-primary/20"
            onClick={() => handleAddEntry()}
          >
            <Plus className="w-4 h-4" /> Schedule Post
          </Button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-[32px] border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none"
      >
        <ContentCalendar 
          onAddEntry={handleAddEntry} 
          onEditEntry={handleEditEntry}
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

