<template>
  <Transition name="fade">
    <div v-if="loading" class="loader"></div>
  </Transition>
  <Map v-if="!isMobile" :stories="stories" />
  <Stories :stories="stories" />
  <!-- <Goo /> -->
</template>

<script>
import MobileDetect from "mobile-detect";

import Map from "./components/map.vue";
import Stories from "./components/stories.vue";
import Goo from "./components/goo.vue";
import Preloader from "./utils/Preloader.js";
import { getMediaUrl } from "./utils/imageUtils.js";
import { formatDate, parseExifDate } from "./utils/dateUtils.js";
import { setStoriesListHeight } from "./utils/sizeUtils.js";

const md = new MobileDetect(window.navigator.userAgent);
const apiUrl = import.meta.env.VITE_API_URL;

export default {
  data() {
    return {
      loading: true,
      stories: [],
      isMobile: md.mobile(),
    };
  },
  components: { Map, Stories, Goo },
  mounted() {
    fetch(`${apiUrl}/story`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        // Sort stories by date (newest first, oldest last) and format dates
        this.stories = data.stories
          .sort((a, b) => {
            // Use parseExifDate utility for consistent date parsing
            const dateA = parseExifDate(a.date);
            const dateB = parseExifDate(b.date);

            // Handle cases where parsing might fail
            if (!dateA && !dateB) return 0;
            if (!dateA) return 1; // Put invalid dates at the end
            if (!dateB) return -1; // Put invalid dates at the end

            return dateB - dateA; // Newest first (descending order)
          })
          .map((story) => ({
            ...story,
            formattedDate: formatDate(story.date),
          }));

        const coverImages = data.stories
          .filter((story) => story.cover)
          .map((story) => getMediaUrl(story.id, story.cover));

        return Preloader.load(coverImages);
      })
      .then(() => {
        this.loading = false;
        setStoriesListHeight();
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
