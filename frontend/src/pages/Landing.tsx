import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Zap, 
  TrendingUp, 
  BrainCircuit, 
  Target, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2,
  Play,
  Share2,
  ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import LandingNavbar from '../components/landing/LandingNavbar';
import Button from '../components/ui/Button';

export default function Landing() {
  const [demoInput, setDemoInput] = useState('');
  const [isDemoGenerating, setIsDemoGenerating] = useState(false);
  const [demoResult, setDemoResult] = useState<{
    hook: string;
    viral_score: number;
    trigger: string;
  } | null>(null);

  const handleDemoGenerate = async () => {
    if (!demoInput || isDemoGenerating) return;
    
    setIsDemoGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-demo-hooks', {
        body: { topic: demoInput }
      });

      if (error) throw error;
      
      setDemoResult(data);
    } catch (err: unknown) {
      console.error('Demo generation failed:', err);
      // Fallback for demo if API fails
      setDemoResult({
        hook: `How I ${demoInput.toLowerCase()} using AI (it actually works).`,
        viral_score: 8.5,
        trigger: "Pattern Interrupt"
      });
    } finally {
      setIsDemoGenerating(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 selection:bg-primary/30">
      <LandingNavbar />

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          {/* Animated Background Orbs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/10 blur-[140px] rounded-full animate-pulse delay-1000" />
          </div>

          <motion.div 
            className="max-w-7xl mx-auto px-6 text-center space-y-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest">
              <Sparkles className="w-4 h-4 animate-spin-slow" /> Trusted by 500+ Content Creators
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9]"
            >
              STOP THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-500 to-indigo-600">SCROLL.</span><br />
              START THE <span className="relative">VIRAL
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 25 0 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="4" />
                </svg>
              </span> WAVE.
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed"
            >
              HookAI uses psychological triggers and viral patterns to craft 
              attention-grabbing hooks for Instagram, TikTok, and LinkedIn in seconds.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/signup">
                <Button size="lg" className="h-14 px-10 rounded-2xl text-base font-bold shadow-2xl shadow-primary/30 group">
                  Start Creating Free <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="#demo">
                <Button size="lg" variant="outline" className="h-14 px-10 rounded-2xl text-base font-bold gap-2">
                  <Play className="w-5 h-5 fill-current" /> Watch Demo
                </Button>
              </a>
            </motion.div>

            {/* Social Proof */}
            <motion.div variants={itemVariants} className="pt-12 flex flex-col items-center gap-6">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Optimized for your favorite platforms</p>
              <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-40 grayscale hover:grayscale-0 transition-all">
                <Share2 className="w-8 h-8" />
                <Share2 className="w-8 h-8" />
                <Share2 className="w-8 h-8" />
                <Share2 className="w-8 h-8" />
                <Share2 className="w-8 h-8" />
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Interactive Demo Section */}
        <section id="demo" className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="glass p-8 md:p-12 rounded-[3rem] border-white/20 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <Zap className="w-64 h-64 text-primary" />
              </div>

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                    See the magic in <span className="text-primary italic">real-time.</span>
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">
                    Enter your boring video topic, and let our AI inject psychological triggers to make it impossible to ignore.
                  </p>

                  <div className="space-y-4">
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="e.g. How I made a coffee..."
                        value={demoInput}
                        onChange={(e) => setDemoInput(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-inner focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm font-medium"
                      />
                      <button 
                        onClick={handleDemoGenerate}
                        disabled={isDemoGenerating}
                        className="absolute right-2 top-2 bottom-2 px-6 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
                      >
                        {isDemoGenerating ? 'Thinking...' : 'Magic'}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['Storytelling', 'Controversial', 'Educational'].map(t => (
                        <span key={t} className="text-[10px] font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary to-violet-600 opacity-20 blur-2xl rounded-[2rem] group-hover:opacity-30 transition-opacity" />
                  <div className="relative bg-slate-900 rounded-[2rem] p-8 aspect-[4/3] flex flex-col justify-center border border-white/10 shadow-2xl">
                    <AnimatePresence mode="wait">
                      {demoResult ? (
                        <motion.div 
                          key="result"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Viral Hook Generated</span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-1 h-1 rounded-full bg-primary" />)}
                            </div>
                          </div>
                          <p className="text-xl md:text-2xl font-bold text-white leading-relaxed font-mono italic">
                            "{demoResult.hook}"
                          </p>
                          <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                            <div className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase">
                              Viral Score: {demoResult.viral_score}/10
                            </div>
                            <div className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-bold uppercase">
                              {demoResult.trigger} Trigger
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="empty"
                          className="text-center space-y-4"
                        >
                          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                            <BrainCircuit className="w-8 h-8 text-white/20" />
                          </div>
                          <p className="text-slate-500 text-sm">Enter a topic to generate a preview...</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-20 px-6 bg-slate-50/50 dark:bg-slate-900/20">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Everything you need to <span className="text-primary italic">explode.</span></h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-medium">Built by creators for creators who value their time and growth.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { 
                  title: 'Viral Score AI', 
                  desc: 'Every hook is analyzed for its viral potential before you even see it.', 
                  icon: TrendingUp,
                  color: 'text-orange-500' 
                },
                { 
                  title: 'Psychological Triggers', 
                  desc: 'We use Curiosity, FOMO, and Social Proof patterns to force clicks.', 
                  icon: Target,
                  color: 'text-primary' 
                },
                { 
                  title: 'Brand Voice Sync', 
                  desc: 'Train the AI on your past content to match your unique style perfectly.', 
                  icon: BrainCircuit,
                  color: 'text-blue-500' 
                },
                { 
                  title: 'Multi-Platform', 
                  desc: 'Specific formatting for Instagram Reels, TikTok, YouTube Shorts, and X.', 
                  icon: Share2,
                  color: 'text-indigo-500' 
                },
                { 
                  title: 'Hook Library', 
                  desc: 'Save your favorites, organize by campaign, and never lose an idea.', 
                  icon: ShieldCheck,
                  color: 'text-emerald-500' 
                },
                { 
                  title: 'Analytics Insights', 
                  desc: 'See which styles are trending in your niche and double down on what works.', 
                  icon: Sparkles,
                  color: 'text-violet-500' 
                },
              ].map((f, i) => (
                <div key={i} className="glass p-8 rounded-3xl border-white/20 hover:border-primary/30 transition-all group">
                  <div className={`w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 shadow-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <f.icon className={`w-7 h-7 ${f.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32 px-6">
          <div className="max-w-5xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Transparent <span className="text-primary italic">Pricing.</span></h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Start for free, upgrade when you're ready to go pro.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Free Tier */}
              <div className="glass p-10 rounded-[2.5rem] border-white/20 flex flex-col justify-between">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Free Forever</h3>
                    <p className="text-slate-500 text-sm mt-1">For getting started.</p>
                  </div>
                  <div className="text-4xl font-black text-slate-900 dark:text-white">₹0 <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">/ month</span></div>
                  
                  <ul className="space-y-4 pt-6">
                    {['5 Hooks Daily', '3 Platform Styles', 'Viral Score Analysis', 'Basic Library'].map(f => (
                      <li key={f} className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link to="/signup" className="mt-10">
                  <Button variant="outline" className="w-full h-14 rounded-2xl font-bold">Start Free</Button>
                </Link>
              </div>

              {/* Starter Tier */}
              <div className="glass p-1 rounded-[2.5rem] bg-gradient-to-br from-primary to-indigo-600 shadow-2xl shadow-primary/20 relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-white rounded-full text-[10px] font-black text-primary uppercase tracking-[0.2em] shadow-lg">Most Popular</div>
                <div className="bg-white dark:bg-slate-950 p-10 rounded-[2.2rem] h-full flex flex-col justify-between">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Starter Pro</h3>
                      <p className="text-slate-500 text-sm mt-1">For serious creators.</p>
                    </div>
                    <div className="text-4xl font-black text-slate-900 dark:text-white">₹499 <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">/ month</span></div>
                    
                    <ul className="space-y-4 pt-6">
                      {[
                        'Unlimited Daily Hooks', 
                        'All Platforms Unlocked', 
                        'Brand Voice Personalization', 
                        'Content Calendar Sync',
                        'Priority AI Generation',
                        'Premium Templates'
                      ].map(f => (
                        <li key={f} className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                          <CheckCircle2 className="w-5 h-5 text-primary" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link to="/signup" className="mt-10">
                    <Button className="w-full h-14 rounded-2xl font-bold shadow-xl shadow-primary/20">Upgrade to Pro</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 px-6">
          <div className="max-w-3xl mx-auto space-y-12">
            <h2 className="text-3xl font-black text-center text-slate-900 dark:text-white">Frequently Asked <span className="text-primary italic">Questions.</span></h2>
            <div className="space-y-4">
              {[
                { q: "How does the AI generate hooks?", a: "We use advanced large language models trained on hundreds of thousands of high-performing viral hooks and psychological marketing patterns." },
                { q: "Can I cancel my subscription anytime?", a: "Yes, you can manage and cancel your subscription directly from your account settings with one click." },
                { q: "What platforms are supported?", a: "HookAI currently supports Instagram, TikTok, YouTube, LinkedIn, and X (Twitter) with specific viral patterns for each." },
                { q: "Is there a free trial?", a: "We offer a Free Forever plan that allows you to generate 5 hooks every single day without any credit card required." }
              ].map((faq, i) => (
                <details key={i} className="group glass p-6 rounded-2xl border-white/20 cursor-pointer">
                  <summary className="flex items-center justify-between list-none font-bold text-slate-900 dark:text-white">
                    {faq.q}
                    <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform text-primary" />
                  </summary>
                  <p className="mt-4 text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-6">
          <div className="max-w-5xl mx-auto glass bg-slate-900 p-12 md:p-20 rounded-[4rem] text-center space-y-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              className="space-y-8 relative z-10"
            >
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight">
                Ready to dominate the <br /> <span className="text-primary">explore page?</span>
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto font-medium text-lg">
                Join 500+ creators who are saving 10+ hours a week and reaching millions more people.
              </p>
              <Link to="/signup" className="inline-block">
                <Button size="lg" className="h-16 px-12 rounded-2xl text-lg font-black shadow-2xl shadow-primary/30">
                  Get Started for Free
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="py-20 px-6 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-black tracking-tighter text-slate-900 dark:text-white">HookAI</span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
              Crafting the future of attention-grabbing content for the next generation of creators.
            </p>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Product</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500 dark:text-slate-400">
              <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="#demo" className="hover:text-primary transition-colors">Live Demo</a></li>
              <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Legal</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500 dark:text-slate-400">
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 hover:text-primary hover:bg-primary/10 transition-all">
                <Share2 className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 hover:text-primary hover:bg-primary/10 transition-all">
                <Share2 className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
          <span>&copy; 2026 HookAI. All rights reserved.</span>
          <span>Made for Creators</span>
        </div>
      </footer>
    </div>
  );
}
