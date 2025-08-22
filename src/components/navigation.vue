<template>
  <div
    class="navigation"
    @mousedown="handleEventDown"
    @mouseup="handleEventUp"
    @touchstart="handleEventDown"
    @touchend="handleEventUp"
  >
    <div
      data-action="prev"
      class="navigation__button navigation__button--prev"
    ></div>
    <div
      data-action="next"
      class="navigation__button navigation__button--next"
    ></div>
  </div>
</template>

<script>
import { useStoryStore } from "../stores/storyStore";

export default {
  name: "Navigation",
  setup() {
    const storyStore = useStoryStore();
    return { storyStore };
  },
  props: {
    currentVideoPlaying: {
      type: Object,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      mouseDownTime: null,
      maxHoldDuration: 300,
    };
  },
  methods: {
    next() {
      this.storyStore.nextMedia();
    },
    prev() {
      this.storyStore.prevMedia();
    },
    handleEventDown(event) {
      event.preventDefault();

      this.mouseDown = true;
      this.mouseDownTime = Date.now();

      if (this.currentVideoPlaying) {
        this.currentVideoPlaying.pause();
      }
    },
    handleEventUp(event) {
      event.preventDefault();

      const action = event.target.dataset.action;

      this.mouseDown = false;
      if (this.mouseDownTime) {
        const holdDuration = Date.now() - this.mouseDownTime;

        if (holdDuration > this.maxHoldDuration) {
          this.mouseDownTime = null;
          // if we release after holding too long, play the video
          if (this.currentVideoPlaying) {
            this.currentVideoPlaying.play();
          }
          return;
        }
      }

      if (action === "prev") {
        this.prev();
      } else if (action === "next") {
        this.next();
      }

      this.mouseDownTime = null;
    },
  },
};
</script>

<style lang="scss" scoped>
@use "../scss/vars" as *;
@use "../scss/mixins" as *;

.navigation {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: $z-navigation;

  &__button {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 50%;
    background: transparent;
    border: none;
    cursor: pointer;
    z-index: $z-navigation;
    -webkit-tap-highlight-color: transparent !important;

    &:focus {
      border: none !important;
      background: none !important;
    }

    &--prev {
      left: 0;
    }

    &--next {
      right: 0;
    }
  }
}
</style>
