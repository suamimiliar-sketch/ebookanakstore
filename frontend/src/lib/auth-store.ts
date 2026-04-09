"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  email: string | null;
  setToken: (token: string, email: string) => void;
  signOut: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      email: null,
      setToken: (token, email) => set({ token, email }),
      signOut: () => set({ token: null, email: null }),
    }),
    { name: "ebookanak-admin-auth" },
  ),
);
