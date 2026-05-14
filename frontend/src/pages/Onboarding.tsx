import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Share2, 
  TrendingUp, 
  Cpu, 
  Rocket, 
  Video, 
  MessageSquare, 
  Palette,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  User,
  CreditCard,
  Zap,
  ShieldCheck,
  Crown
} from 'lucide-react';
import { useOnboardingStore } from '../store/onboardingStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import { useCheckout } from '../hooks/useCheckout';

const niches = [
  { id: 'tech', label: 'Technology', icon: Cpu, color: 'bg-blue-500' },
  { id: 'marketing', label: 'Marketing', icon: TrendingUp, color: 'bg-purple-500' },
  { id: 'business', label: 'Business', icon: Rocket, color: 'bg-orange-500' },
  { id: 'creative', label: 'Creative/Design', icon: Palette, color: 'bg-pink-500' },
  { id: 'lifestyle', label: 'Lifestyle', icon: Video, color: 'bg-green-500' },
  { id: 'other', label: 'Other', icon: MessageSquare, color: 'bg-slate-500' },
];

const platforms = [
  { id: 'twitter', label: 'Twitter / X', icon: Share2 },
  { id: 'linkedin', label: 'LinkedIn', icon: Share2 },
  { id: 'instagram', label: 'Instagram', icon: Share2 },
  { id: 'tiktok', label: 'TikTok', icon: Share2 },
  { id: 'youtube', label: 'YouTube Shorts', icon: Share2 },
];

const goals = [
  { id: 'engagement', label: 'Increase Engagement', description: 'Get more likes, comments, and shares.' },
  { id: 'authority', label: 'Build Authority', description: 'Establish yourself as an expert in your niche.' },
  { id: 'traffic', label: 'Drive Traffic', description: 'Send more people to your website or product.' },
  { id: 'sales', label: 'Boost Sales', description: 'Convert your audience into paying customers.' },
];

const plans = [
  { 
    id: 'free', 
    label: 'Free Forever', 
    price: '₹0', 
    description: 'Basic hook generation for beginners',
    features: ['5 hooks per day', '1 platform', 'Standard AI model'],
    icon: Zap,
    color: 'text-slate-500'
  },
  { 
    id: 'starter', 
    label: 'Starter', 
    price: '₹499', 
    description: 'Perfect for consistent creators',
    features: ['20 hooks per day', '3 platforms', 'Advanced AI model', 'Calendar access'],
    icon: ShieldCheck,
    color: 'text-blue-500',
    popular: true
  },
  { 
    id: 'pro', 
    label: 'Pro', 
    price: '₹999', 
    description: 'For serious personal brands',
    features: ['100 hooks per day', 'All platforms', 'Priority generation', 'Brand Voice AI'],
    icon: Crown,
    color: 'text-purple-500'
  },
];

export default function Onboarding() {
  const { step, setStep, data, updateData } = useOnboardingStore();
  const { user, profile, setProfile } = useAuthStore();
  const { startCheckout, isLoading: isPaymentLoading } = useCheckout();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const isLoading = isSubmitting || isPaymentLoading;

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleComplete = async () => {
    if (!user) return;
    setIsSubmitting(true);
    
    try {
      // Update profile in Supabase
      const { data: updatedProfile, error } = await supabase
        .from('users')
        .update({
          name: data.name,
          niche: data.niche,
          platforms: data.platforms,
          goal: data.goal,
          plan: data.plan,
          onboarding_complete: true,
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      // If it's a paid plan, trigger checkout
      if (data.plan !== 'free') {
        try {
          await startCheckout(data.plan);
          // startCheckout will navigate to success page on success
        } catch (paymentError) {
          // If payment failed/cancelled, we still saved their free profile
          // But maybe they want to try again or just go to dashboard on free
          toast.error("Payment was not completed. You have been started on the Free plan.");
          navigate('/dashboard');
        }
      } else {
        toast.success('Onboarding complete! Welcome aboard.');
        navigate('/dashboard');
      }

      // Update local store with what we saved (initially this will have the chosen plan, 
      // but the backend webhook will update it to confirmed plan later. 
      // For immediate UI feedback, we can use the updatedProfile)
      if (updatedProfile) {
        setProfile(updatedProfile);
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Failed to save your preferences. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-500">Step {step} of 5</span>
            <span className="text-sm font-bold text-primary">{Math.round((step / 5) * 100)}% Complete</span>
          </div>
          <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 5) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="glass p-8 md:p-12 rounded-2xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">What should we call you?</h1>
                  <p className="text-slate-500 dark:text-slate-400">Let's start with your name to personalize your experience.</p>
                </div>

                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    value={data.name}
                    onChange={(e) => updateData({ name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full h-14 pl-12 pr-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl focus:border-primary outline-none transition-all text-lg font-medium"
                    autoFocus
                  />
                </div>

                <div className="pt-4">
                  <Button 
                    className="w-full h-12" 
                    onClick={handleNext} 
                    disabled={!data.name || data.name.length < 2}
                  >
                    Get Started <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Select your niche</h1>
                  <p className="text-slate-500 dark:text-slate-400">This helps us tailor your hook ideas to your specific industry.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {niches.map((niche) => (
                    <button
                      key={niche.id}
                      onClick={() => updateData({ niche: niche.id })}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 hover:scale-[1.02] active:scale-[0.98] relative ${
                        data.niche === niche.id
                          ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5'
                          : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${niche.color}`}>
                        <niche.icon className="w-6 h-6" />
                      </div>
                      <span className="font-semibold text-sm">{niche.label}</span>
                      {data.niche === niche.id && (
                        <CheckCircle2 className="w-5 h-5 absolute top-2 right-2 text-primary" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button variant="outline" className="flex-1" onClick={handleBack}>
                    <ChevronLeft className="mr-2 w-4 h-4" /> Back
                  </Button>
                  <Button 
                    className="flex-[2]" 
                    onClick={handleNext} 
                    disabled={!data.niche}
                  >
                    Continue <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Where do you post?</h1>
                  <p className="text-slate-500 dark:text-slate-400">Select all platforms you plan to use HookAI for.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {platforms.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => {
                        const newPlatforms = data.platforms.includes(platform.id)
                          ? data.platforms.filter(p => p !== platform.id)
                          : [...data.platforms, platform.id];
                        updateData({ platforms: newPlatforms });
                      }}
                      className={`p-4 rounded-xl border-2 transition-all flex items-center gap-4 hover:scale-[1.01] active:scale-[0.99] relative ${
                        data.platforms.includes(platform.id)
                          ? 'border-primary bg-primary/5 text-primary shadow-md'
                          : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        data.platforms.includes(platform.id) ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800'
                      }`}>
                        <platform.icon className="w-5 h-5" />
                      </div>
                      <span className="font-semibold">{platform.label}</span>
                      {data.platforms.includes(platform.id) && (
                        <CheckCircle2 className="w-5 h-5 absolute top-4 right-4 text-primary" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button variant="outline" className="flex-1" onClick={handleBack}>
                    <ChevronLeft className="mr-2 w-4 h-4" /> Back
                  </Button>
                  <Button 
                    className="flex-[2]" 
                    onClick={handleNext} 
                    disabled={data.platforms.length === 0}
                  >
                    Continue <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">What is your primary goal?</h1>
                  <p className="text-slate-500 dark:text-slate-400">We'll optimize your hooks based on what you want to achieve.</p>
                </div>

                <div className="space-y-3">
                  {goals.map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => updateData({ goal: goal.id })}
                      className={`w-full p-4 rounded-xl border-2 transition-all flex items-start gap-4 text-left hover:scale-[1.01] active:scale-[0.99] relative ${
                        data.goal === goal.id
                          ? 'border-primary bg-primary/5 text-primary shadow-md'
                          : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        data.goal === goal.id ? 'border-primary bg-primary text-white' : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {data.goal === goal.id && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-bold">{goal.label}</p>
                        <p className="text-sm opacity-70">{goal.description}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button variant="outline" className="flex-1" onClick={handleBack}>
                    <ChevronLeft className="mr-2 w-4 h-4" /> Back
                  </Button>
                  <Button 
                    className="flex-[2]" 
                    onClick={handleNext} 
                    disabled={!data.goal}
                  >
                    Continue <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Choose your plan</h1>
                  <p className="text-slate-500 dark:text-slate-400">Select the plan that fits your content needs. You can change this later.</p>
                </div>

                <div className="space-y-4">
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => updateData({ plan: plan.id })}
                      className={`w-full p-5 rounded-2xl border-2 transition-all flex items-center gap-4 text-left hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden ${
                        data.plan === plan.id
                          ? 'border-primary bg-primary/5 text-primary shadow-lg'
                          : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                          Most Popular
                        </div>
                      )}
                      
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-800 ${plan.color}`}>
                        <plan.icon className="w-6 h-6" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-bold text-lg">{plan.label}</p>
                          <p className="font-black text-xl">{plan.price}<span className="text-xs font-normal opacity-60">/mo</span></p>
                        </div>
                        <p className="text-xs opacity-70 mb-3">{plan.description}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          {plan.features.slice(0, 2).map((feature, i) => (
                            <div key={i} className="flex items-center gap-1 text-[11px] font-medium">
                              <CheckCircle2 className="w-3 h-3 text-green-500" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button variant="outline" className="flex-1" onClick={handleBack}>
                    <ChevronLeft className="mr-2 w-4 h-4" /> Back
                  </Button>
                  <Button 
                    className="flex-[2] gap-2" 
                    onClick={handleComplete} 
                    disabled={isLoading}
                    isLoading={isLoading}
                  >
                    <Sparkles className="w-4 h-4" /> Finish Onboarding
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
