import { create } from "zustand";
import { api } from "../lib/api";

export const useAuth = create((set, get) => ({
  user: null,
  token: localStorage.getItem("aintrix_token") || null,
  loading: false,

  async login(email, password) {
    set({ loading: true });
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("aintrix_token", data.access_token);
      set({ token: data.access_token, user: data.user, loading: false });
      return data.user;
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  async fetchMe() {
    if (!get().token) return null;
    try {
      const { data } = await api.get("/auth/me");
      set({ user: data });
      return data;
    } catch {
      localStorage.removeItem("aintrix_token");
      set({ user: null, token: null });
      return null;
    }
  },

  logout() {
    localStorage.removeItem("aintrix_token");
    set({ user: null, token: null });
  },
}));
