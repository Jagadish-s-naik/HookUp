import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Trash2, 
  Copy, 
  TrendingUp, 
  BrainCircuit, 
  LayoutGrid, 
  List, 
  Sparkles, 
  Share2, 
  Calendar, 
  ChevronDown, 
  ThumbsUp, 
  ThumbsDown, 
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';

interface Hook {
  id: string;
  hook_text: string;
  viral_score: number;
  why_it_works: string;
  psychological_trigger: string;
  platform: string;
  platform_fit: string[];
  created_at: string;
  is_saved: boolean;
  user_rating: number | null;
  tone?: string;
  hook_style?: string;
}



export default function Library() {
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedPlatform] = useState('all');
  const [selectedTone, setSelectedTone] = useState('all');
  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchHooks = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('hooks')
        .select('*')
        .eq('is_saved', true);

      if (selectedPlatform !== 'all') {
        query = query.eq('platform', selectedPlatform);
      }

      if (selectedTone !== 'all') {
        query = query.eq('tone', selectedTone);
      }

      if (minScore > 0) {
        query = query.gte('viral_score', minScore);
      }

      if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'score') {
        query = query.order('viral_score', { ascending: false });
      } else if (sortBy === 'rating') {
        query = query.order('user_rating', { ascending: false, nullsFirst: false });
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setHooks(data || []);
    } catch (error) {
      console.error('Error fetching hooks:', error);
      toast.error('Failed to load library');
    } finally {
      setLoading(false);
    }
  }, [selectedPlatform, selectedTone, minScore, sortBy]);

  useEffect(() => {
    const triggerFetch = async () => {
      await Promise.resolve();
      fetchHooks();
    };
    triggerFetch();
  }, [fetchHooks]);

  const removeHook = async (id: string) => {
    try {
      const { error } = await supabase
        .from('hooks')
        .update({ is_saved: false })
        .eq('id', id);

      if (error) throw error;
      setHooks(hooks.filter(h => h.id !== id));
      toast.success('Removed from library');
    } catch (error) {
      console.error('Error removing hook:', error);
      toast.error('Failed to remove hook');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  const filteredHooks = hooks.filter(h => 
    h.hook_text.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Saved Hooks</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400">Your curated collection of high-performing viral hooks.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <Link to="/generate">
            <Button className="gap-2">
              <Sparkles className="w-4 h-4" /> Generate More
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search your hooks..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/20 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-40">
            <select 
              className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/20 text-sm appearance-none"
              value={selectedTone}
              onChange={(e) => setSelectedTone(e.target.value)}
            >
              <option value="all">All Tones</option>
              <option value="educational">Educational</option>
              <option value="entertaining">Entertaining</option>
              <option value="controversial">Controversial</option>
              <option value="inspirational">Inspirational</option>
              <option value="curiosity">Curiosity</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative w-full md:w-40">
            <select 
              className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/20 text-sm appearance-none"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
            >
              <option value="0">Any Score</option>
              <option value="7">Score 7+</option>
              <option value="8">Score 8+</option>
              <option value="9">Score 9+</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative w-full md:w-40">
            <select 
              className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/20 text-sm appearance-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="score">Highest Score</option>
              <option value="rating">Highest Rated</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center gap-3 text-rose-500 mb-4">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold">Remove Hook?</h3>
            </div>
            <p className="text-slate-500 text-sm mb-6">This will remove the hook from your library. You can always generate it again later.</p>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeletingId(null)}>Cancel</Button>
              <Button className="flex-1 bg-rose-500 hover:bg-rose-600 text-white border-none" onClick={() => { removeHook(deletingId); setDeletingId(null); }}>Remove</Button>
            </div>
          </motion.div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredHooks.length > 0 ? (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          <AnimatePresence mode="popLayout">
            {filteredHooks.map((hook) => (
              <LibraryHookCard 
                key={hook.id} 
                hook={hook} 
                viewMode={viewMode}
                onRemove={() => setDeletingId(hook.id)}
                onCopy={() => copyToClipboard(hook.hook_text)}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-slate-300" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Your library is empty</h3>
            <p className="text-slate-500 max-w-xs mx-auto">Start generating hooks and save your favorites here for easy access later.</p>
          </div>
          <Link to="/generate">
            <Button variant="outline">Generate Hooks</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function LibraryHookCard({ 
  hook, 
  viewMode, 
  onRemove, 
  onCopy 
}: { 
  hook: Hook, 
  viewMode: 'grid' | 'list',
  onRemove: () => void,
  onCopy: () => void
}) {
  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass p-4 rounded-xl border-slate-100 dark:border-slate-800 flex items-center gap-6 group hover:border-primary/30 transition-all"
      >
        <div className="w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
          <span className="text-lg font-bold text-primary">{hook.viral_score}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-800 dark:text-slate-200 font-medium truncate italic">"{hook.hook_text}"</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {new Date(hook.created_at).toLocaleDateString()}
            </span>
            {hook.user_rating === 1 && <ThumbsUp className="w-3 h-3 text-emerald-500" />}
            {hook.user_rating === -1 && <ThumbsDown className="w-3 h-3 text-rose-500" />}
          </div>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onCopy} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-all" title="Copy">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={onRemove} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-500 transition-all" title="Remove">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="glass p-6 rounded-2xl border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all flex flex-col justify-between group"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${
            hook.viral_score >= 8 ? 'bg-orange-500/10 text-orange-500' : 'bg-primary/10 text-primary'
          }`}>
            <TrendingUp className="w-3 h-3" />
            Score: {hook.viral_score}/10
          </div>
          <div className="flex items-center gap-1">
            {hook.user_rating === 1 && (
              <div className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">
                <ThumbsUp className="w-3 h-3" />
              </div>
            )}
            <div className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <Share2 className="w-3 h-3" /> {hook.platform}
            </div>
          </div>
        </div>

        <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed font-mono text-sm">
          "{hook.hook_text}"
        </p>

        <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex gap-3 items-start">
          <BrainCircuit className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic leading-snug">
            {hook.why_it_works}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
        <span className="text-[10px] text-slate-400 flex items-center gap-1">
          <Calendar className="w-3 h-3" /> {new Date(hook.created_at).toLocaleDateString()}
        </span>
        <div className="flex items-center gap-2">
          <button onClick={onRemove} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
          <button 
            onClick={onCopy}
            className="flex items-center gap-2 text-xs font-bold text-white bg-slate-900 dark:bg-primary hover:bg-slate-800 dark:hover:bg-primary/90 px-4 py-2 rounded-xl transition-all"
          >
            <Copy className="w-3.5 h-3.5" /> Copy
          </button>
        </div>
      </div>
    </motion.div>
  );
}
