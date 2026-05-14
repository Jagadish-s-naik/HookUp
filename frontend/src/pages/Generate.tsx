import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Share2, 
  Type, 
  Smile, 
  Zap, 
  RefreshCcw, 
  Copy, 
  Heart,
  MoreVertical,
  Target,
  Languages,
  Wand2,
  TrendingUp,
  BrainCircuit,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { usePlan } from '../hooks/usePlan';
import { useUIStore } from '../store/uiStore';

const platforms = [
  { id: 'instagram', label: 'Instagram', icon: Share2 },
  { id: 'tiktok', label: 'TikTok', icon: Share2 },
  { id: 'youtube', label: 'YouTube', icon: Share2 },
  { id: 'linkedin', label: 'LinkedIn', icon: Share2 },
  { id: 'twitter', label: 'X / Twitter', icon: Share2 },
];

const tones = [
  { id: 'educational', label: 'Educational', emoji: '📚' },
  { id: 'entertaining', label: 'Entertaining', emoji: '🎭' },
  { id: 'controversial', label: 'Controversial', emoji: '🔥' },
  { id: 'inspirational', label: 'Inspirational', emoji: '✨' },
  { id: 'curiosity', label: 'Curiosity', emoji: '🤔' },
  { id: 'fomo', label: 'FOMO', emoji: '⏳' },
  { id: 'storytelling', label: 'Storytelling', emoji: '📖' },
];

const hookStyles = [
  { id: 'question', label: 'Question' },
  { id: 'bold_statement', label: 'Bold Statement' },
  { id: 'statistic', label: 'Statistic' },
  { id: 'story_opener', label: 'Story Opener' },
  { id: 'listicle', label: 'Listicle' },
  { id: 'contrarian', label: 'Contrarian' },
  { id: 'how_to', label: 'How-to' },
];

const languages = [
  'English', 'Hindi', 'Spanish', 'Portuguese', 'French', 'Arabic'
];

const nichePlaceholders: Record<string, string[]> = {
  fitness: ['How I lost 10kg in 3 months...', 'The truth about keto...', 'Morning workout routine...'],
  finance: ['How to save your first ₹1L...', 'Stock market for beginners...', 'Passive income ideas...'],
  tech: ['Best AI tools for 2024...', 'How to learn React fast...', 'The future of Web3...'],
  general: ['Morning productivity hacks...', 'Building a personal brand...', 'Travel tips for Bali...'],
};

interface HookResult {
  id: string;
  hook_text: string;
  viral_score: number;
  why_it_works: string;
  psychological_trigger: string;
  platform_fit: string[];
  is_saved: boolean;
  user_rating: number | null;
}

export default function Generate() {
  const { profile } = useAuthStore();
  const { isFree, canGenerate } = usePlan();
  const { openUpgradeModal } = useUIStore();
  const navigate = useNavigate();
  
  const [platform, setPlatform] = useState('instagram');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('curiosity');
  const [hookStyle, setHookStyle] = useState('question');
  const [targetAudience, setTargetAudience] = useState('');
  const [language, setLanguage] = useState('English');
  const [useBrandVoice, setUseBrandVoice] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHooks, setGeneratedHooks] = useState<HookResult[]>([]);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const placeholders = nichePlaceholders[profile?.niche || 'general'] || nichePlaceholders.general;

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [placeholders]);

  const handleGenerate = async () => {
    if (!topic) {
      toast.error('Please enter a topic or context');
      return;
    }

    if (!canGenerate) {
      openUpgradeModal('daily_hooks');
      return;
    }
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-hooks', {
        body: {
          topic,
          platform,
          content_type: 'reel', // default for now
          tone,
          hook_style: hookStyle,
          target_audience: targetAudience || 'general audience',
          language,
          use_brand_voice: useBrandVoice,
        }
      });

      if (error) throw error;
      
      setGeneratedHooks(data.hooks);
      toast.success('10 viral hooks ready!');
    } catch (err) {
      console.error('Generation failed:', err);
      const message = err instanceof Error ? err.message : 'Failed to generate hooks';
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const toggleSave = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('hooks')
        .update({ is_saved: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setGeneratedHooks(prev => prev.map(h => 
        h.id === id ? { ...h, is_saved: !currentStatus } : h
      ));

      toast.success(!currentStatus ? 'Saved to library' : 'Removed from library');
    } catch (err) {
      console.error('Save status update failed:', err);
      toast.error('Failed to update save status');
    }
  };

  const handleRate = async (id: string, rating: number) => {
    try {
      const currentHook = generatedHooks.find(h => h.id === id);
      const newRating = currentHook?.user_rating === rating ? null : rating;

      const { error } = await supabase
        .from('hooks')
        .update({ user_rating: newRating })
        .eq('id', id);

      if (error) throw error;

      setGeneratedHooks(prev => prev.map(h => 
        h.id === id ? { ...h, user_rating: newRating } : h
      ));

      if (newRating !== null) {
        toast.success(newRating === 1 ? 'Glad you liked it!' : 'Feedback received');
      }
    } catch (err) {
      console.error('Rating update failed:', err);
      toast.error('Failed to save rating');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wand2 className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Generate Viral Hooks</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400">Transform your ideas into attention-grabbing headlines using psychological triggers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Configuration Sidebar */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <div className="glass p-6 rounded-2xl space-y-6 sticky top-24 border border-white/20 shadow-xl">
            {/* Topic Input */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Type className="w-4 h-4 text-primary" /> Topic or Context
              </label>
              <div className="relative">
                <textarea 
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none text-sm"
                  placeholder={placeholders[placeholderIndex]}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
            </div>

            {/* Platform Selection */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-primary" /> Platform
              </label>
              <div className="grid grid-cols-3 gap-2">
                {platforms.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPlatform(p.id)}
                    className={`py-2 px-1 rounded-xl border text-[10px] font-bold transition-all uppercase tracking-wider ${
                      platform === p.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-500 hover:border-slate-200'
                    }`}
                  >
                    {p.id === 'twitter' ? 'X' : p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hook Style & Tone */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" /> Hook Style
                </label>
                <select 
                  value={hookStyle}
                  onChange={(e) => setHookStyle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm"
                >
                  {hookStyles.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Smile className="w-4 h-4 text-primary" /> Tone
                </label>
                <select 
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm"
                >
                  {tones.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
            </div>

            {/* Target Audience & Language */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" /> Audience
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Solo devs"
                  className="w-full px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Languages className="w-4 h-4 text-primary" /> Language
                </label>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm"
                >
                  {languages.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            {profile?.brand_voice_summary && (
              <label className="flex items-center gap-3 p-3 rounded-xl border border-primary/10 bg-primary/5 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded text-primary focus:ring-primary border-primary/20"
                  checked={useBrandVoice}
                  onChange={(e) => setUseBrandVoice(e.target.checked)}
                />
                <span className="text-xs font-bold text-primary group-hover:text-primary/80 transition-colors">Apply Brand Voice Profile</span>
              </label>
            )}

            <Button 
              className="w-full h-12 shadow-lg shadow-primary/20 gap-2" 
              onClick={handleGenerate}
              isLoading={isGenerating}
            >
              <Zap className="w-4 h-4" /> Generate Hooks
            </Button>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Results {generatedHooks.length > 0 && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">{generatedHooks.length}</span>}
            </h2>
            {generatedHooks.length > 0 && (
              <button 
                onClick={() => setGeneratedHooks([])}
                className="text-xs font-medium text-slate-500 hover:text-primary flex items-center gap-1 transition-colors"
              >
                <RefreshCcw className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {isGenerating ? (
                <>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <motion.div 
                      key={`skeleton-${i}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="glass p-6 rounded-2xl animate-pulse h-48 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800" 
                    />
                  ))}
                </>
              ) : generatedHooks.length > 0 ? (
                generatedHooks.map((hook, idx) => {
                  const isBlurred = isFree && idx >= 3;
                  return (
                    <HookCard 
                      key={idx} 
                      hook={hook} 
                      idx={idx} 
                      isBlurred={isBlurred}
                      onCopy={() => isBlurred ? openUpgradeModal('blurred_hooks') : copyToClipboard(hook.hook_text)} 
                      onToggleSave={() => isBlurred ? openUpgradeModal('blurred_hooks') : toggleSave(hook.id, hook.is_saved)}
                      onRate={(rating) => isBlurred ? openUpgradeModal('blurred_hooks') : handleRate(hook.id, rating)}
                      onWriteCaption={() => {
                        if (isBlurred) {
                          openUpgradeModal('blurred_hooks');
                        } else {
                          navigate('/captions', { state: { hookText: hook.hook_text } });
                        }
                      }}
                    />
                  );
                })
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center space-y-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="w-20 h-20 rounded-3xl bg-white dark:bg-slate-900 shadow-xl flex items-center justify-center ring-1 ring-slate-100 dark:ring-slate-800">
                    <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-slate-900 dark:text-white font-bold text-xl tracking-tight">Ready to go viral?</p>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto">
                      Fill in the details and our AI will craft 10 scroll-stopping hooks for your next post.
                    </p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
      </div>
    </div>
  );
}

function HookCard({ 
  hook, 
  idx, 
  onCopy, 
  onToggleSave,
  onRate,
  onWriteCaption,
  isBlurred 
}: { 
  hook: HookResult, 
  idx: number, 
  onCopy: () => void, 
  onToggleSave: () => void,
  onRate: (rating: number) => void,
  onWriteCaption: () => void,
  isBlurred?: boolean
}) {
  const { openUpgradeModal } = useUIStore();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className={`glass p-6 rounded-2xl border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all group relative flex flex-col justify-between h-full hover:shadow-2xl hover:shadow-primary/5 ${
        isBlurred ? 'cursor-pointer overflow-hidden' : ''
      }`}
      onClick={() => isBlurred && openUpgradeModal('blurred_hooks')}
    >
      <div className={`space-y-4 ${isBlurred ? 'blur-[6px] select-none pointer-events-none' : ''}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${
              hook.viral_score >= 8 ? 'bg-orange-500/10 text-orange-500' : 'bg-primary/10 text-primary'
            }`}>
              <TrendingUp className="w-3 h-3" />
              Score: {hook.viral_score}/10
            </div>
            <div className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {hook.psychological_trigger}
            </div>
          </div>
        </div>

        <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed font-mono text-sm line-clamp-4">
          "{hook.hook_text}"
        </p>

        <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex gap-3 items-start">
          <BrainCircuit className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic leading-snug">
            {hook.why_it_works}
          </p>
        </div>
      </div>
      
      <div className="mt-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button 
            onClick={onToggleSave}
            className={`p-2 rounded-lg transition-all ${
              hook.is_saved 
                ? 'text-rose-500 bg-rose-50 dark:bg-rose-500/10' 
                : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10'
            }`}
          >
            <Heart className={`w-4 h-4 ${hook.is_saved ? 'fill-current' : ''}`} />
          </button>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 ml-1">
            <button 
              onClick={(e) => { e.stopPropagation(); onRate(1); }}
              className={`p-1.5 rounded-md transition-all ${
                hook.user_rating === 1 
                  ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onRate(-1); }}
              className={`p-1.5 rounded-md transition-all ${
                hook.user_rating === -1 
                  ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onWriteCaption(); }}
          className="p-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all"
          title="Write Caption"
        >
          <Sparkles className="w-4 h-4" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onCopy(); }}
          className="flex-1 flex items-center justify-center gap-2 text-xs font-bold text-white bg-slate-900 dark:bg-primary hover:bg-slate-800 dark:hover:bg-primary/90 py-2.5 rounded-xl transition-all shadow-lg shadow-primary/10"
        >
          <Copy className="w-3.5 h-3.5" /> Copy
        </button>
      </div>


      
      {isBlurred && (
        <div className="absolute inset-0 bg-white/10 dark:bg-slate-900/10 flex flex-col items-center justify-center p-6 text-center space-y-3 z-10 backdrop-blur-[2px]">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-primary">Premium Hook</p>
            <p className="text-[10px] text-slate-500 font-medium">Upgrade to Starter to unlock all 10 viral hooks</p>
          </div>
          <button 
            className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-primary text-white shadow-lg shadow-primary/20"
          >
            Unlock Now
          </button>
        </div>
      )}

      <button className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
        <MoreVertical className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
