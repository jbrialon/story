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
import { getCurrentLabel } from "../utils/timelineUtils";

export default {
  name: "Navigation",
  props: {
    currentVideoPlaying: {
      type: Object,
      required: false,
      default: null,
    },
    tl: {
      type: Object,
      required: true,
    },
    nextMedia: {
      type: Function,
      required: true,
    },
    prevMedia: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      mouseDownTime: null,
      maxHoldDuration: 300,
    };
  },
  setup() {
    const storyStore = useStoryStore();

    return { storyStore };
  },
  computed: {
    currentStoryIndex() {
      return this.storyStore.currentStoryIndex;
    },
    currentMediaIndex() {
      return this.storyStore.mediaIndex[this.currentStoryIndex];
    },
  },
  methods: {
    next() {
      this.nextMedia();
      const label = `bullet-${this.currentMediaIndex}`;
      const currentLabel = getCurrentLabel(this.tl);

      if (label !== currentLabel) {
        console.log("ici");
        this.tl.seek(label).play();
      }
    },
    prev() {
      const currentLabel = getCurrentLabel(this.tl);
      const currentLabelTime = this.tl.labels[currentLabel];

      // we substract the time of the full timeline to the current time to get the progress in the current media
      const progress = this.tl.time() - currentLabelTime;

      // if the progress is less than 1.5, we go to the previous media
      if (progress < 1.5) {
        this.prevMedia();
        const label = `bullet-${this.currentMediaIndex}`;
        this.tl.seek(label).play();
      } else {
        // if the progress is greater than 1.5, we reset the time to the beginning of the current media
        this.tl.seek(currentLabel).play();

        // and if the media is a video, we resume it to the beginning
        if (this.currentVideoPlaying) {
          this.currentVideoPlaying.currentTime = 0;
          this.currentVideoPlaying.play();
        }
      }
    },
    handleEventDown(event) {
      event.preventDefault();

      this.mouseDown = true;
      this.mouseDownTime = Date.now();

      this.tl.pause();
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
          this.tl.play();

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
