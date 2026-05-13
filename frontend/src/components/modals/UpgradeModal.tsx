import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Sparkles, Zap, Shield, Rocket } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { loadRazorpayScript, openRazorpayCheckout } from '../../lib/razorpay';
import Button from '../ui/Button';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';

const plans = [
  {
    name: 'Free',
    price: '₹0',
    description: 'Perfect for getting started',
    features: [
      '5 hooks per day',
      '1 platform at a time',
      'Basic analytics',
      'Standard AI model'
    ],
    buttonText: 'Current Plan',
    buttonVariant: 'outline' as const,
    disabled: true,
  },
  {
    name: 'Starter',
    price: '₹499',
    period: '/month',
    description: 'For growing creators',
    features: [
      '100 hooks per month',
      '3 platforms at a time',
      'Advanced analytics',
      '7-day content calendar',
      'Priority support'
    ],
    buttonText: 'Upgrade to Starter',
    buttonVariant: 'primary' as const,
    popular: true,
    icon: Zap,
  },
  {
    name: 'Pro',
    price: '₹1,299',
    period: '/month',
    description: 'For serious influencers',
    features: [
      'Unlimited hooks',
      'All platforms',
      'Full 30-day calendar',
      'Brand Voice AI',
      'Repurpose Engine',
      'Early access features'
    ],
    buttonText: 'Upgrade to Pro',
    buttonVariant: 'primary' as const,
    icon: Rocket,
  }
];

export default function UpgradeModal() {
  const { isUpgradeModalOpen, upgradeReason, closeUpgradeModal } = useUIStore();
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    if (isUpgradeModalOpen) {
      loadRazorpayScript().then((success) => {
        if (!success) {
          toast.error("Failed to load payment gateway. Please check your connection.");
        }
      });
    }
  }, [isUpgradeModalOpen]);

  const handleUpgrade = async (plan: string) => {
    if (!user) {
      toast.error("Please login to upgrade");
      return;
    }

    setLoadingPlan(plan);
    try {
      const { data: session } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/razorpay-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.session?.access_token}`,
          },
          body: JSON.stringify({
            plan: plan.toLowerCase(),
            billing_cycle: 'monthly', // Default to monthly for now
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize checkout');
      }

      const options = {
        key: data.razorpay_key_id,
        subscription_id: data.subscription_id,
        name: 'HookAI',
        description: `${plan} Subscription`,
        image: '/logo.png', // Add your logo path
        prefill: data.prefill,
        theme: {
          color: '#7C3AED', // primary color
        },
        handler: async (response: any) => {
          toast.success("Payment successful!");
          closeUpgradeModal();
          navigate('/payment/success');
        },
        modal: {
          ondismiss: () => {
            setLoadingPlan(null);
          },
        },
      };

      openRazorpayCheckout(options);
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || "Something went wrong. Please try again.");
      setLoadingPlan(null);
    }
  };

  if (!isUpgradeModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeUpgradeModal}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button 
            onClick={closeUpgradeModal}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
          >
            <X className="w-6 h-6 text-slate-500" />
          </button>

          <div className="p-8 md:p-12">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold mb-4">
                <Sparkles className="w-4 h-4" /> Upgrade Your Account
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                {upgradeReason || "Unlock your creative potential"}
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Choose the plan that fits your growth. Scale your content across all platforms with AI-powered hooks and insights.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <div 
                  key={plan.name}
                  className={`relative flex flex-col p-8 rounded-3xl border-2 transition-all duration-300 ${
                    plan.popular 
                      ? 'border-primary bg-primary/[0.02] dark:bg-primary/[0.05] shadow-xl shadow-primary/10 scale-105 z-10' 
                      : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-xs font-bold rounded-full shadow-lg">
                      MOST POPULAR
                    </div>
                  )}

                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                      {plan.icon && <plan.icon className="w-6 h-6 text-primary" />}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
                      {plan.period && <span className="text-slate-500 dark:text-slate-400">{plan.period}</span>}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{plan.description}</p>
                  </div>

                  <div className="flex-1 space-y-4 mb-8">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <div className="mt-1 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    variant={plan.buttonVariant}
                    disabled={plan.disabled || loadingPlan === plan.name}
                    loading={loadingPlan === plan.name}
                    className="w-full font-bold h-12"
                    onClick={() => handleUpgrade(plan.name)}
                  >
                    {plan.buttonText}
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Secure Payment</h4>
                  <p className="text-xs text-slate-500">Processed via Razorpay</p>
                </div>
              </div>
              <div className="h-px w-full md:w-px md:h-10 bg-slate-200 dark:bg-slate-700" />
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                All plans include a 30-day money-back guarantee. You can cancel or switch plans at any time from your account settings.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
