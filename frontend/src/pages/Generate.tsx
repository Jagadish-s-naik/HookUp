import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Share2, 
  Type, 
  Smile, 
  Zap, 
  RefreshCcw, 
  Copy, 
  Heart,
  Send,
  MoreVertical
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

const platforms = [
  { id: 'twitter', label: 'X / Twitter', icon: Share2 },
  { id: 'linkedin', label: 'LinkedIn', icon: Share2 },
  { id: 'instagram', label: 'Instagram', icon: Share2 },
  { id: 'tiktok', label: 'TikTok', icon: Share2 },
];

const tones = [
  { id: 'provocative', label: 'Provocative', emoji: '🔥' },
  { id: 'educational', label: 'Educational', emoji: '📚' },
  { id: 'storytelling', label: 'Storytelling', emoji: '📖' },
  { id: 'humorous', label: 'Humorous', emoji: '😂' },
  { id: 'professional', label: 'Professional', emoji: '💼' },
];

export default function Generate() {
  const [platform, setPlatform] = useState('twitter');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('provocative');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHooks, setGeneratedHooks] = useState<string[]>([]);

  const handleGenerate = () => {
    if (!topic) {
      toast.error('Please enter a topic or context');
      return;
    }
    
    setIsGenerating(true);
    // Simulate generation for now (Sprint 2 will have real AI integration)
    setTimeout(() => {
      const mockHooks = [
        `I tried ${topic} so you don't have to. Here are the 3 biggest mistakes most people make...`,
        `Stop scrolling! If you're struggling with ${topic}, you need to see this formula.`,
        `The secret to ${topic} isn't what you think. Thread 🧵`,
      ];
      setGeneratedHooks(mockHooks);
      setIsGenerating(false);
      toast.success('Hooks generated successfully!');
    }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Generate Viral Hooks</h1>
        <p className="text-slate-500 dark:text-slate-400">Transform your ideas into attention-grabbing headlines.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Configuration Sidebar */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6 rounded-2xl space-y-6">
            {/* Platform Selection */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-primary" /> Target Platform
              </label>
              <div className="grid grid-cols-2 gap-2">
                {platforms.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPlatform(p.id)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                      platform === p.id
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Input */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Type className="w-4 h-4 text-primary" /> Topic or Context
              </label>
              <Input 
                placeholder="e.g. AI for developers, scaling a SaaS, morning routine..." 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            {/* Tone Selection */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Smile className="w-4 h-4 text-primary" /> Tone of Voice
              </label>
              <div className="flex flex-wrap gap-2">
                {tones.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id)}
                    className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all flex items-center gap-1.5 ${
                      tone === t.id
                        ? 'border-primary bg-primary text-white'
                        : 'border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    <span>{t.emoji}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

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
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Results</h2>
            {generatedHooks.length > 0 && (
              <button 
                onClick={() => setGeneratedHooks([])}
                className="text-xs font-medium text-slate-500 hover:text-primary flex items-center gap-1"
              >
                <RefreshCcw className="w-3 h-3" /> Clear Results
              </button>
            )}
          </div>

          <div className="space-y-4">
            {isGenerating ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass p-6 rounded-2xl animate-pulse h-24 bg-slate-100/50 dark:bg-slate-800/50" />
                ))}
              </div>
            ) : generatedHooks.length > 0 ? (
              generatedHooks.map((hook, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass p-6 rounded-2xl border-slate-100 dark:border-slate-800 hover:border-primary/20 transition-all group relative"
                >
                  <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed pr-10">
                    {hook}
                  </p>
                  
                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary transition-colors">
                        <Heart className="w-4 h-4" /> Save
                      </button>
                      <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary transition-colors">
                        <Send className="w-4 h-4" /> Export
                      </button>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(hook)}
                      className="flex items-center gap-1.5 text-xs font-bold text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-all"
                    >
                      <Copy className="w-4 h-4" /> Copy Hook
                    </button>
                  </div>

                  <button className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-slate-300" />
                </div>
                <div>
                  <p className="text-slate-900 dark:text-white font-bold text-lg">No hooks generated yet</p>
                  <p className="text-slate-500 text-sm max-w-xs">
                    Fill in the details on the left and click generate to see the magic happen.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
