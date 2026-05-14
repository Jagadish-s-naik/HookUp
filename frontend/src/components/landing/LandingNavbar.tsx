import { motion } from 'framer-motion';
import { Sparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

export default function LandingNavbar() {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between glass px-6 py-3 rounded-2xl border-white/20 shadow-2xl shadow-primary/5">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">HookAI</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {['Features', 'Demo', 'Pricing', 'FAQ'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`}
              className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors uppercase tracking-widest"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" className="font-bold text-xs uppercase tracking-widest">Login</Button>
          </Link>
          <Link to="/signup">
            <Button className="font-bold text-xs uppercase tracking-widest gap-2 shadow-primary/20">
              <Zap className="w-3.5 h-3.5 fill-current" />
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
