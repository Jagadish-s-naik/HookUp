import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import Button from '../components/ui/Button';

export default function PaymentSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Fire confetti
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none text-center"
      >
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Upgrade Successful!</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Thank you for choosing HookAI. Your account has been upgraded and all premium features are now unlocked.
        </p>

        <div className="space-y-4">
          <Button 
            className="w-full h-12 gap-2"
            onClick={() => navigate('/generate')}
          >
            Start Generating <ArrowRight className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center justify-center gap-2 text-primary text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>Go viral today</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
