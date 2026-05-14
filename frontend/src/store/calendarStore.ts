import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export type PostStatus = 'draft' | 'pending' | 'approved' | 'posted' | 'failed';

export interface ScheduledPost {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  platform: string;
  scheduled_at: string;
  status: PostStatus;
  created_at: string;
}


interface CalendarState {
  entries: ScheduledPost[];
  isLoading: boolean;
  fetchEntries: (userId: string) => Promise<void>;
  addEntry: (entry: Omit<ScheduledPost, 'id' | 'created_at'>) => Promise<void>;

  updateEntry: (id: string, entry: Partial<ScheduledPost>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  entries: [],
  isLoading: false,

  fetchEntries: async (userId: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', userId)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      set({ entries: data || [] });
    } catch (error) {
      console.error('Error fetching calendar entries:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addEntry: async (entry) => {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert([entry])
        .select()
        .single();

      if (error) throw error;
      
      const { entries } = get();
      set({ entries: [...entries, data] });
    } catch (error) {
      console.error('Error adding calendar entry:', error);
      throw error;
    }
  },

  updateEntry: async (id, entry) => {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .update(entry)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const { entries } = get();
      set({ entries: entries.map(e => e.id === id ? data : e) });
    } catch (error) {
      console.error('Error updating calendar entry:', error);
      throw error;
    }
  },

  deleteEntry: async (id: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const { entries } = get();
      set({ entries: entries.filter(e => e.id !== id) });
    } catch (error) {
      console.error('Error deleting calendar entry:', error);
    }
  }
}));
