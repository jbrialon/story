<template>
  <Transition name="fade">
    <div v-if="loading" class="loader"></div>
  </Transition>
  <Map v-if="!isMobile" :stories="stories" :photoGps="photoGps" />
  <Stories :stories="stories" @photo-gps="handlePhotoGps" />
</template>

<script>
import MobileDetect from "mobile-detect";

import Map from "./components/map.vue";
import Stories from "./components/stories.vue";
import Preloader from "./utils/Preloader.js";
import { getMediaUrl } from "./utils/imageUtils.js";

const md = new MobileDetect(window.navigator.userAgent);

export default {
  data() {
    return {
      loading: true,
      stories: [],
      photoGps: null,
      isMobile: md.mobile(),
    };
  },
  components: { Map, Stories },
  methods: {
    handlePhotoGps(gpsData) {
      this.photoGps = gpsData;
    },
  },
  mounted() {
    fetch("https://api.jerem.cool/story")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        this.stories = data.stories;

        const coverImages = data.stories
          .filter((story) => story.cover)
          .map((story) => getMediaUrl(story.id, story.cover));

        return Preloader.load(coverImages);
      })
      .then(() => {
        this.loading = false;
      })
      .catch((error) => {
        console.error("Error:", error);
        this.loading = false;
      });
  },
};
</script>

<style lang="scss">
@use "./scss/vars" as *;
@use "./scss/mixins" as *;
@use "./scss/transitions";

@import "./scss/main.scss";

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
  }
}
</style>
