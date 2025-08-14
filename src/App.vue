<template>
  <Transition name="fade">
    <div v-if="loading" class="loader"></div>
  </Transition>
  <Map v-if="!isMobile" />
  <Stories />
  <!-- <Goo /> -->
</template>

<script>
import MobileDetect from "mobile-detect";

import Map from "./components/map.vue";
import Stories from "./components/stories.vue";
import Goo from "./components/goo.vue";
import { useStoryStore } from "./stores/storyStore.js";

const md = new MobileDetect(window.navigator.userAgent);

export default {
  data() {
    return {
      isMobile: md.mobile(),
    };
  },
  components: { Map, Stories, Goo },
  computed: {
    storyStore() {
      return useStoryStore();
    },
    loading() {
      return this.storyStore.isLoading;
    },
  },
  async mounted() {
    try {
      await this.storyStore.loadStories();
    } catch (error) {
      console.error("Error:", error);
    }
  },
};
</script>

<style lang="scss">
@use "./scss/vars" as *;
@use "./scss/mixins" as *;
@use "./scss/transitions";

@use "./scss/main.scss";

#app {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  @include small-only {
    width: var(--vw);
    height: var(--vh);
  }

  .loader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: white;
    z-index: 100;

    @include small-only {
      width: var(--vw);
      height: var(--vh);
    }

    &:after {
      position: absolute;
      content: "";
      display: block;
      height: 30px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      aspect-ratio: 6;
      --c: #0000 64%, #e5e5e5 66% 98%, #0000 101%;
      background: radial-gradient(35% 146% at 50% 159%, var(--c)) 0 0,
        radial-gradient(35% 146% at 50% -59%, var(--c)) 25% 100%;
      background-size: calc(100% / 3) 50%;
      background-repeat: repeat-x;
      animation: l1 1s infinite linear;

      @keyframes l1 {
        to {
          background-position: 50% 0, 75% 100%;
        }
      }
    }
  }
}
</style>
