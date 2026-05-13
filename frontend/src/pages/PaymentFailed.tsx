import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, RefreshCcw, MessageCircle } from 'lucide-react';
import Button from '../components/ui/Button';

export default function PaymentFailed() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none text-center"
      >
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Payment Failed</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          We couldn't process your payment. This could be due to insufficient funds, an expired card, or a temporary issue with the bank.
        </p>

        <div className="space-y-3">
          <Button 
            className="w-full h-12 gap-2"
            onClick={() => navigate('/dashboard')}
          >
            <RefreshCcw className="w-4 h-4" /> Try Again
          </Button>
          
          <Button 
            variant="outline"
            className="w-full h-12 gap-2"
            onClick={() => window.open('mailto:support@hookai.com')}
          >
            <MessageCircle className="w-4 h-4" /> Contact Support
          </Button>
        </div>
        
        <p className="mt-6 text-xs text-slate-400">
          Don't worry, you haven't been charged.
        </p>
      </motion.div>
    </div>
  );
}
