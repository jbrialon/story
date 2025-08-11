import { defineStore } from "pinia";

export const useStoryStore = defineStore("story", {
  state: () => ({
    activePhoto: null,
  }),

  actions: {
    setActivePhoto(photo) {
      this.activePhoto = photo;
    },

    clearActivePhoto() {
      this.activePhoto = null;
    },
  },
});
