import { create } from "zustand";

/**
 * Global scroll signal — updated every frame by App.
 * Everything else (WebGL scene, background, cursor, typography)
 * reads from here so the whole page moves as one film.
 */
export const useScrollSignal = create((set) => ({
  scrollY: 0,
  progress: 0, // 0..1 across viewport heights on home
  velocity: 0, // px/frame — signed
  section: 0, // discrete scene chapter 0..6
  loaded: false,
  set: (patch) => set(patch),
}));
