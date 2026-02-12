import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useAppStore = create()(
  persist(
    (set) => ({
      user: null,
      setUser: (userData) => set({ user: userData }),
      logout: () => set({ user: null }),
    }),
    {
      name: "procrm-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
