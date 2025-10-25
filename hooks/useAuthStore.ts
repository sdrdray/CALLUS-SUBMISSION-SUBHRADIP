import { create } from 'zustand';

type AuthState = {
  userId: string | null;
  setUserId: (id: string | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  setUserId: (id) => set({ userId: id }),
}));