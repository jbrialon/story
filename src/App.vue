<template>
  <Map v-if="!isMobile" :stories="stories" :photoGps="photoGps" />
  <Stories :stories="stories" @photo-gps="handlePhotoGps" />
</template>

<script>
import MobileDetect from "mobile-detect";

import Map from "./components/map.vue";
import Stories from "./components/stories.vue";

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
        this.loading = false;
      });
  },
};
</script>

<style>
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
}
</style>
