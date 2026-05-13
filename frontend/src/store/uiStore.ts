import { create } from 'zustand';

interface UIState {
  isUpgradeModalOpen: boolean;
  upgradeReason: string | null;
  openUpgradeModal: (reason?: string) => void;
  closeUpgradeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isUpgradeModalOpen: false,
  upgradeReason: null,
  openUpgradeModal: (reason) => set({ isUpgradeModalOpen: true, upgradeReason: reason || null }),
  closeUpgradeModal: () => set({ isUpgradeModalOpen: false, upgradeReason: null }),
}));
