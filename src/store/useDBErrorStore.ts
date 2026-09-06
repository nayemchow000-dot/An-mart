import { create } from "zustand";

interface DBErrorState {
  hasError: boolean;
  errorCode: string | null;
  errorMessage: string | null;
  sqlRequired: string | null;
  setError: (code: string, message: string, sql: string) => void;
  clearError: () => void;
}

export const useDBErrorStore = create<DBErrorState>((set) => ({
  hasError: false,
  errorCode: null,
  errorMessage: null,
  sqlRequired: null,
  setError: (code, message, sql) => set({ hasError: true, errorCode: code, errorMessage: message, sqlRequired: sql }),
  clearError: () => set({ hasError: false, errorCode: null, errorMessage: null, sqlRequired: null }),
}));

