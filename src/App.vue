<template>
  <Transition name="fade" @after-leave="onLoadingTransitionComplete">
    <Loader class="waiting-screen" v-if="loading" />
  </Transition>
  <Map />
  <Stories v-cloak />
</template>

<script>
// Components
import Map from "./components/map.vue";
import Stories from "./components/stories.vue";
import Goo from "./components/goo.vue";
import Loader from "./components/loader.vue";

// Stores
import { useStoryStore } from "./stores/storyStore.js";

export default {
  setup() {
    const storyStore = useStoryStore();
    return { storyStore };
  },
  components: { Map, Stories, Goo, Loader },
  computed: {
    loading() {
      return this.storyStore.isLoading;
    },
  },
  methods: {
    onLoadingTransitionComplete() {
      this.storyStore.setLoadingTransitionComplete(true);
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

  .waiting-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
  }
}
</style>
