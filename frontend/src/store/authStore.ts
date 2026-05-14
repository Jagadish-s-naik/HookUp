import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  niche: string | null;
  platforms: string[] | null;
  goal: string | null;
  plan: 'free' | 'starter' | 'pro' | 'agency';
  onboarding_complete: boolean;
  hooks_used_today: number;
  hooks_used_month: number;
  extra_hook_credits: number;
  brand_voice_summary: string | null;
  referral_code: string | null;
  affiliate_earnings: number;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (isLoading: boolean) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  signOut: async () => {
    set({ user: null, profile: null });
  },
}));
