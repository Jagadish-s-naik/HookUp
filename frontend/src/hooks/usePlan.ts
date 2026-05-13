import { useAuthStore } from '../store/authStore';

export type PlanType = 'free' | 'starter' | 'pro' | 'agency';

interface PlanLimits {
  dailyHooks: number;
  monthlyHooks: number;
  platforms: number;
  hasBrandVoice: boolean;
  hasRepurpose: boolean;
  hasCalendar: boolean;
}

const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    dailyHooks: 5,
    monthlyHooks: 150, // 5 * 30
    platforms: 1,
    hasBrandVoice: false,
    hasRepurpose: false,
    hasCalendar: false,
  },
  starter: {
    dailyHooks: 20,
    monthlyHooks: 100, // As per PRD
    platforms: 3,
    hasBrandVoice: false,
    hasRepurpose: false,
    hasCalendar: true,
  },
  pro: {
    dailyHooks: 100,
    monthlyHooks: Infinity,
    platforms: Infinity,
    hasBrandVoice: true,
    hasRepurpose: true,
    hasCalendar: true,
  },
  agency: {
    dailyHooks: Infinity,
    monthlyHooks: Infinity,
    platforms: Infinity,
    hasBrandVoice: true,
    hasRepurpose: true,
    hasCalendar: true,
  },
};

export function usePlan() {
  const { profile } = useAuthStore();
  
  const currentPlan = (profile?.plan as PlanType) || 'free';
  const limits = PLAN_LIMITS[currentPlan];
  
  const hooksUsedToday = profile?.hooks_used_today || 0;
  const hooksUsedMonth = profile?.hooks_used_month || 0;
  const extraCredits = profile?.extra_hook_credits || 0;

  const canGenerate = () => {
    // Check daily limits for free users
    if (currentPlan === 'free') {
      return (hooksUsedToday < limits.dailyHooks) || extraCredits > 0;
    }
    
    // Check monthly limits for starter users
    if (currentPlan === 'starter') {
      return (hooksUsedMonth < limits.monthlyHooks) || extraCredits > 0;
    }

    // Pro and Agency have no hard limits in this logic for now
    return true;
  };

  const getRemainingToday = () => {
    if (currentPlan === 'free') {
      return Math.max(0, limits.dailyHooks - hooksUsedToday);
    }
    return Infinity;
  };

  const isFeatureAllowed = (feature: keyof PlanLimits) => {
    const value = limits[feature];
    if (typeof value === 'boolean') return value;
    return value > 0;
  };

  return {
    plan: currentPlan,
    limits,
    usage: {
      today: hooksUsedToday,
      month: hooksUsedMonth,
      extra: extraCredits,
    },
    remainingToday: getRemainingToday(),
    canGenerate: canGenerate(),
    isFeatureAllowed,
    isFree: currentPlan === 'free',
    isPremium: currentPlan !== 'free',
  };
}
