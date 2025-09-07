import { defineStore } from "pinia";
import MobileDetect from "mobile-detect";

const isMobile = new MobileDetect(window.navigator.userAgent);

export const useAppStore = defineStore("app", {
  state: () => {
    const isPhone = isMobile.phone() !== null;
    return {
      isMobile: isPhone,
      mapMode: !isPhone,
    };
  },

  actions: {
    setMapMode(state) {
      this.mapMode = state;
    },
  },
  getters: {},
});
