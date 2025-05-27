import { create } from 'zustand';

interface Portfolio {
  id: string;
  user_id: string;
  template_id: string;
  title: string;
  description: string;
  theme: string;
  content: any;
  created_at: Date;
  updated_at: Date;
  linkedin_url: string;
  github_url: string;
}

interface PortfolioStore {
  portfolio: Portfolio | null;
  setPortfolio: (portfolio: Portfolio) => void;
  updatePortfolio: (updates: Partial<Portfolio>) => void;
}

export const usePortfolioStore = create<PortfolioStore>((set) => ({
  portfolio: null,
  setPortfolio: (portfolio) => set({ portfolio }),
  updatePortfolio: (updates) =>
    set((state) => ({
      portfolio: state.portfolio ? { ...state.portfolio, ...updates } : null,
    })),
})); 