<template>
  <Transition name="fade">
    <Loader class="loader" v-if="loading" />
  </Transition>
  <Map v-if="!isMobile" />
  <Stories />
  <!-- <Goo /> -->
</template>

<script>
// Utils
import MobileDetect from "mobile-detect";

// Components
import Map from "./components/map.vue";
import Stories from "./components/stories.vue";
import Goo from "./components/goo.vue";
import Loader from "./components/loader.vue";

// Stores
import { useStoryStore } from "./stores/storyStore.js";

const md = new MobileDetect(window.navigator.userAgent);

export default {
  data() {
    return {
      isMobile: md.mobile(),
    };
  },
  components: { Map, Stories, Goo, Loader },
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
  }
}
</style>
