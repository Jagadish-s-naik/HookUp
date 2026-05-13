import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  niche: string | null;
  platforms: string[] | null;
  goal: string | null;
  has_onboarded: boolean;
  avatar_url?: string;
  full_name?: string;
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
