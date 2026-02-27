<template>
  <div class="loader">
    <div
      class="loader__bubble"
      :class="{
        loaded: coverSrc,
      }"
      :style="{ '--progress': progress + '%' }"
    >
      <img class="loader__bubble-img" :src="coverSrc" alt="" />
    </div>
  </div>
</template>

<script>
import gsap from "gsap";
import preloader from "@/classes/Preloader.js";
import { useStoryStore } from "@/stores/storyStore.js";

export default {
  name: "Loader",
  data() {
    return {
      progress: 0,
    };
  },
  props: {
    type: {
      type: String,
      default: "story",
    },
  },
  setup() {
    const storyStore = useStoryStore();
    return { storyStore };
  },
  computed: {
    coverSrc() {
      return this.storyStore.priorityCoverUrl;
    },
  },
  methods: {
    onLoaded(event) {
      const { batch, loaded, total } = event.detail;
      if (batch === `story-${this.storyStore.priorityIndex}`) {
        const target = Math.round((loaded / total) * 100);
        gsap.to(this.$data, {
          progress: target,
          duration: 0.4,
          ease: "power4.out",
          overwrite: true,
        });
      }
    },
  },
  mounted() {
    if (this.type === "main") {
      preloader.on("loaded", this.onLoaded);
    }
  },
  beforeUnmount() {
    if (this.type === "main") {
      preloader.off("loaded", this.onLoaded);
    }
  },
};
</script>

<style scoped lang="scss">
@use "../scss/mixins" as *;

.loader {
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: white;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;

  @include small-only {
    width: var(--vw);
    height: var(--vh);
  }

  &__bubble {
    position: relative;
    border-radius: 50%;
    padding: rem-calc(12px);
    transition: transform 600ms var(--easing);
    transform: scale(0);
    background: var(--c-grey-light);

    &.loaded {
      transform: scale(1);
    }

    &:before {
      content: "";
      position: absolute;
      display: block;
      inset: 0;
      border-radius: 50%;
      background-image: linear-gradient(
        to right top,
        #ffc600 20%,
        #ff0040,
        #e600cc 80%
      );
      transition: opacity 0.3s var(--easing);
      mask-image: conic-gradient(
        black 0% var(--progress),
        transparent var(--progress) 100%
      );
      -webkit-mask-image: conic-gradient(
        black 0% var(--progress),
        transparent var(--progress) 100%
      );
    }

    &:after {
      content: "";
      position: absolute;
      left: rem-calc(5px);
      top: rem-calc(5px);
      right: rem-calc(5px);
      bottom: rem-calc(5px);
      background: #fff;
      border-radius: 50%;
      z-index: 1;
    }

    &-img {
      position: relative;
      z-index: 2;
      display: block;
      width: rem-calc(120px);
      height: rem-calc(120px);
      border-radius: 50%;
      object-fit: cover;
      object-position: center;
    }
  }

  &:after {
    position: absolute;
    content: "";
    display: block;
    height: rem-calc(20px);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    aspect-ratio: 6;
    --c: #0000 64%, #e5e5e5 66% 98%, #0000 101%;
    background:
      radial-gradient(35% 146% at 50% 159%, var(--c)) 0 0,
      radial-gradient(35% 146% at 50% -59%, var(--c)) 25% 100%;
    background-size: calc(100% / 3) 50%;
    background-repeat: repeat-x;
    animation: l1 1s infinite linear;
    z-index: 10;

    @keyframes l1 {
      to {
        background-position:
          50% 0,
          75% 100%;
      }
    }
  }
}
</style>
