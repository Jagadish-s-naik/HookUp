import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Repeat, 
  Wand2, 
  Video, 
  FileText, 
  Globe, 
  Lock, 
  Play, 
  Share2, 
  Quote, 
  Mail, 
  MessageSquare,
  Copy
} from 'lucide-react';
import Button from '../components/ui/Button';
import { usePlan } from '../hooks/usePlan';
import { useUIStore } from '../store/uiStore';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'tiktok', label: 'TikTok/Reels', icon: Play },
  { id: 'carousel', label: 'Carousel', icon: Share2 },
  { id: 'twitter', label: 'Threads', icon: MessageSquare },
  { id: 'linkedin', label: 'LinkedIn', icon: FileText },
  { id: 'quotes', label: 'Quotes', icon: Quote },
  { id: 'newsletter', label: 'Newsletter', icon: Mail },
];

export default function Repurpose() {
  const { isFeatureAllowed } = usePlan();
  const { openUpgradeModal } = useUIStore();
  const hasAccess = isFeatureAllowed('hasRepurpose');
  
  const [inputType, setInputType] = useState<'text' | 'youtube' | 'url'>('text');
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('tiktok');
  
  const [results, setResults] = useState<any>(null);

  const handleGenerate = async () => {
    if (!content) {
      toast.error('Please enter content to repurpose');
      return;
    }
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('repurpose-content', {
        body: { content, type: inputType }
      });
      if (error) throw error;
      setResults(data.results);
      toast.success('Content repurposed successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to repurpose content');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (!hasAccess) {
    return (
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 pb-20">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Repeat className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Repurpose Engine</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400">Turn one piece of content into a month of posts across all platforms.</p>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-12 text-center flex flex-col items-center justify-center space-y-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5"></div>
          <div className="w-20 h-20 rounded-3xl bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center ring-1 ring-slate-100 dark:ring-slate-700 relative z-10">
            <Lock className="w-10 h-10 text-slate-400" />
          </div>
          <div className="relative z-10 space-y-2 max-w-md">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Pro Feature</h2>
            <p className="text-slate-500 dark:text-slate-400">
              The Repurpose Engine is available on Pro and Agency plans. Upgrade to unlock this powerful feature and scale your content instantly.
            </p>
          </div>
          <Button 
            className="relative z-10 shadow-lg shadow-primary/20"
            onClick={() => openUpgradeModal('repurpose_engine')}
          >
            Upgrade to Pro
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Repeat className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Repurpose Engine</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400">Turn one piece of content into a month of posts across all platforms.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Sidebar */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <div className="glass p-6 rounded-2xl space-y-6 sticky top-24 border border-white/20 shadow-xl">
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Content Source</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setInputType('text')}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                    inputType === 'text' 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Text</span>
                </button>
                <button
                  onClick={() => setInputType('youtube')}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                    inputType === 'youtube' 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  <Youtube className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">YouTube</span>
                </button>
                <button
                  onClick={() => setInputType('url')}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                    inputType === 'url' 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  <Globe className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Blog URL</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {inputType === 'text' ? 'Paste Content (Max 5000 chars)' : 'Paste URL'}
              </label>
              {inputType === 'text' ? (
                <textarea 
                  rows={8}
                  className="w-full px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none text-sm"
                  placeholder="Paste your video script, podcast transcript, or blog post here..."
                  value={content}
                  maxLength={5000}
                  onChange={(e) => setContent(e.target.value)}
                />
              ) : (
                <input 
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                  placeholder={inputType === 'youtube' ? 'https://youtube.com/watch?v=...' : 'https://yourblog.com/post...'}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              )}
            </div>

            <Button 
              className="w-full h-12 shadow-lg shadow-primary/20 gap-2" 
              onClick={handleGenerate}
              isLoading={isGenerating}
            >
              <Wand2 className="w-4 h-4" /> Repurpose Now
            </Button>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {!results && !isGenerating ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] bg-slate-50/50 dark:bg-slate-900/50 h-full min-h-[400px]">
              <div className="w-20 h-20 rounded-3xl bg-white dark:bg-slate-900 shadow-xl flex items-center justify-center ring-1 ring-slate-100 dark:ring-slate-800">
                <Repeat className="w-10 h-10 text-primary animate-pulse" />
              </div>
              <div className="space-y-2">
                <p className="text-slate-900 dark:text-white font-bold text-xl tracking-tight">Waiting for content...</p>
                <p className="text-slate-500 text-sm max-w-md mx-auto">
                  Paste a link or text on the left, and watch our AI instantly turn it into 6 different formats for all your social channels.
                </p>
              </div>
            </div>
          ) : isGenerating ? (
            <div className="space-y-4">
              {/* Skeleton Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-10 w-24 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse shrink-0" />
                ))}
              </div>
              <div className="h-[500px] rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-700" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide items-center border-b border-slate-200 dark:border-slate-800">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg transition-all border-b-2 font-medium text-sm whitespace-nowrap ${
                        isActive 
                          ? 'border-primary text-primary bg-primary/5' 
                          : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="glass p-6 rounded-b-2xl rounded-tr-2xl border border-slate-200 dark:border-slate-800 shadow-xl relative min-h-[500px]"
                >
                  <button 
                    onClick={() => copyToClipboard(results?.[activeTab] || '')}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-primary transition-colors bg-white/50 dark:bg-slate-900/50 rounded-lg"
                    title="Copy Content"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 font-mono text-sm whitespace-pre-wrap pt-8">
                    {results?.[activeTab] || 'No content generated for this format.'}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
