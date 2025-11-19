import { create } from "~/utils/zustand-lite";

type UIState = {
  isQuickRetuneOpen: boolean;
  setQuickRetuneOpen: (isOpen: boolean) => void;
  toggleQuickRetune: () => void;
  // Feature flags
  raptorMiniEnabled: boolean;
  setRaptorMiniEnabled: (isEnabled: boolean) => void;
};

export const useUIStore = create<UIState>((set) => ({
  isQuickRetuneOpen: false,
  setQuickRetuneOpen: (isOpen) => set({ isQuickRetuneOpen: isOpen }),
  toggleQuickRetune: () =>
    set((state) => ({ isQuickRetuneOpen: !state.isQuickRetuneOpen })),
  // Default to true so the preview is available for QA/clients; can be toggled
  // by the team for rollout control.
  raptorMiniEnabled: true,
  setRaptorMiniEnabled: (isEnabled: boolean) =>
    set({ raptorMiniEnabled: isEnabled }),
}));
