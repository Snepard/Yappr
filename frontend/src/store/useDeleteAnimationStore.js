import { create } from "zustand";

export const useDeleteAnimationStore = create((set) => ({
  isAnimating: false,
  messageText: "",
  onCompleteCallback: null,

  triggerDeleteAnimation: (messageText) => {
    return new Promise((resolve) => {
      set({
        isAnimating: true,
        messageText: messageText || "Attachment",
        onCompleteCallback: resolve,
      });
    });
  },

  closeAnimation: () => {
    set((state) => {
      if (state.onCompleteCallback) state.onCompleteCallback();
      return { isAnimating: false, messageText: "", onCompleteCallback: null };
    });
  },
}));
