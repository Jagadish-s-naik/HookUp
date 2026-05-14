import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  MessageSquare, 
  Video,
  Hash,
  Share2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import ScheduleModal from '../components/calendar/ScheduleModal';

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: Share2, color: 'text-pink-500' },
  { id: 'linkedin', name: 'LinkedIn', icon: Share2, color: 'text-blue-600' },
  { id: 'tiktok', name: 'TikTok', icon: Video, color: 'text-slate-900' },
  { id: 'twitter', name: 'X / Twitter', icon: Share2, color: 'text-slate-950' },
];

const TONES = ['Professional', 'Humorous', 'Contrarian', 'Educational', 'Emotional', 'Urgent'];

interface GeneratedCaption {
  caption_text: string;
  hashtags: string[];
}

export default function CaptionWriter() {
  const [topic, setTopic] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [selectedTone, setSelectedTone] = useState('Professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCaption, setGeneratedCaption] = useState<GeneratedCaption | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const handleGenerate = async () => {
    if (!topic) {
      toast.error('Please enter a topic or hook first');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-caption', {
        body: {
          topic,
          platform: selectedPlatform,
          tone: selectedTone.toLowerCase(),
        },
      });

      if (error) throw error;
      setGeneratedCaption(data);
      toast.success('Caption generated successfully!');
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Failed to generate caption';
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedCaption) return;
    
    const textToCopy = `${generatedCaption.caption_text}\n\n${generatedCaption.hashtags?.map((h: string) => `#${h.replace('#', '')}`).join(' ')}`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Viral Caption Writer</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Turn your hooks into high-converting captions in seconds.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass rounded-[32px] p-6 border-slate-200 dark:border-slate-800 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Topic or Hook Text
                </label>
                <span className={`text-[10px] font-bold ${topic.length > 2000 ? 'text-red-500' : 'text-slate-400'}`}>
                  {topic.length} characters
                </span>
              </div>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Paste a hook or enter a topic..."
                className="w-full h-32 p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none text-sm"
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                Target Platform
              </label>
              <div className="grid grid-cols-2 gap-3">
                {PLATFORMS.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
                      selectedPlatform === platform.id
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <platform.icon className={`w-4 h-4 ${selectedPlatform === platform.id ? 'text-primary' : platform.color}`} />
                    <span className="text-xs font-bold">{platform.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                Tone of Voice
              </label>
              <div className="flex flex-wrap gap-2">
                {TONES.map((tone) => (
                  <button
                    key={tone}
                    onClick={() => setSelectedTone(tone)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${
                      selectedTone === tone
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                        : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            <Button 
              fullWidth 
              size="lg" 
              className="mt-4 gap-2 shadow-xl shadow-primary/20"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </div>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Caption
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {generatedCaption ? (
              <motion.div
                key="output"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass rounded-[32px] border-slate-200 dark:border-slate-800 overflow-hidden h-full flex flex-col"
              >
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Caption Ready</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleCopy}
                      className="p-2 text-slate-500 hover:text-primary transition-colors"
                      title="Copy to clipboard"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={handleGenerate}
                      className="p-2 text-slate-500 hover:text-primary transition-colors"
                      title="Regenerate"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-8 space-y-6 overflow-y-auto">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-slate-400">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Main Content</span>
                      </div>
                      {(() => {
                        const limit = 
                          selectedPlatform === 'twitter' ? 280 : 
                          selectedPlatform === 'linkedin' ? 3000 : 
                          selectedPlatform === 'instagram' ? 2200 : 2000;
                        const count = generatedCaption.caption_text.length;
                        return (
                          <span className={`text-[10px] font-bold ${count > limit ? 'text-red-500' : 'text-slate-400'}`}>
                            {count} / {limit} chars
                          </span>
                        );
                      })()}
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-medium">
                      {generatedCaption.caption_text}
                    </p>
                  </div>

                  {generatedCaption.hashtags && generatedCaption.hashtags.length > 0 && (
                    <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Hash className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Hashtags</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {generatedCaption.hashtags.map((tag: string, i: number) => (
                          <span key={i} className="text-sm font-bold text-primary hover:underline cursor-pointer">
                            #{tag.replace('#', '')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Share2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Ready for {selectedPlatform}</p>
                        <p className="text-[10px] text-slate-500">Perfectly formatted for your selection.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setIsScheduleModalOpen(true)}>
                        Schedule
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleCopy}>
                        Copy All
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-[32px] border-slate-200 dark:border-slate-800 border-dashed border-2 p-12 h-full flex flex-col items-center justify-center text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-slate-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900 dark:text-white">No Caption Yet</h3>
                  <p className="text-sm text-slate-500 max-w-xs mx-auto">
                    Fill in the details on the left to generate your viral caption.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ScheduleModal 
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        initialTitle={topic.length > 50 ? topic.substring(0, 47) + '...' : topic}
        initialContent={generatedCaption ? `${generatedCaption.caption_text}\n\n${generatedCaption.hashtags?.map((h: string) => `#${h.replace('#', '')}`).join(' ')}` : ''}
        initialPlatform={selectedPlatform}
      />
    </div>
  );
}
