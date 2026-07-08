import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'en' | 'ta';

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'luxuryland-language',
    }
  )
);
