import { create } from 'zustand';

export type OnboardingData = {
  niche: string;
  platforms: string[];
  goal: string;
};

interface OnboardingState {
  step: number;
  data: OnboardingData;
  setStep: (step: number) => void;
  updateData: (newData: Partial<OnboardingData>) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: 1,
  data: {
    niche: '',
    platforms: [],
    goal: '',
  },
  setStep: (step) => set({ step }),
  updateData: (newData) => set((state) => ({ 
    data: { ...state.data, ...newData } 
  })),
  reset: () => set({ 
    step: 1, 
    data: { niche: '', platforms: [], goal: '' } 
  }),
}));
