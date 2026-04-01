import { create } from 'zustand';

interface UIStore {
  isChatActive: boolean;
  setIsChatActive: (active: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isChatActive: false,
  setIsChatActive: (active) => {
    set({ isChatActive: active });
    if (typeof document !== 'undefined') {
      if (active) document.body.classList.add('is-chat-active');
      else document.body.classList.remove('is-chat-active');
    }
  },
}));
