<script>
import gsap from "gsap";
import { getMediaUrl } from "../utils/imageUtils.js";
import { useStoryStore } from "../stores/storyStore.js";
import { formatDate } from "../utils/dateUtils.js";

import Loader from "./loader.vue";
import Navigation from "./navigation.vue";
import Pagination from "./pagination.vue";
import Content from "./content.vue";

export default {
  name: "Story",
  props: {
    storyId: {
      type: String,
      required: true,
    },
    storyIndex: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      currentVideoPlaying: null,
      muted: false,
    };
  },
  setup() {
    const storyStore = useStoryStore();
    const tl = gsap.timeline({ paused: true });

    return { storyStore, tl };
  },
  components: { Loader, Navigation, Pagination, Content },
  computed: {
    storyData() {
      return this.storyStore.getStoryData(this.storyIndex);
    },
    loading() {
      return this.storyStore.getStoryLoading(this.storyIndex);
    },
    currentMediaIndex() {
      return this.storyStore.mediaIndex[this.storyIndex];
    },
  },
  watch: {
    currentMediaIndex() {
      if (!this.storyData) return;

      this.controlVideoPlayback();

      if (this.currentMediaIndex === this.storyData.medias.length - 1) {
        this.storyStore.setStoryViewed(this.index, true);
      }
    },
    "storyStore.mapInteracted": {
      handler(interacted) {
        if (interacted) {
          this.tl.pause();
          if (this.currentVideoPlaying) {
            this.currentVideoPlaying.pause();
          }
        } else {
          this.tl.play();
          if (this.currentMediaIndex) {
            this.currentVideoPlaying.play();
          }
        }
      },
    },
  },
  methods: {
    getDateRange(stats) {
      if (!stats || stats.length === 0) return "";

      const startDate = formatDate(stats[0].timestamp);
      const endDate = formatDate(stats[stats.length - 1].timestamp);

      return {
        startDate,
        endDate,
      };
    },
    getDistance(stats) {
      return `${stats
        .reduce((acc, curr) => acc + curr.totalDistanceKm, 0)
        .toFixed(0)}km`;
    },
    getElevation(stats) {
      return `${stats
        .reduce((acc, curr) => acc + curr.totalElevationGainM, 0)
        .toFixed(0)}m`;
    },
    getMediaUrl(src) {
      return getMediaUrl(this.storyData, src);
    },
    getClass(photo) {
      let landscape = photo.size.width > photo.size.height;
      return landscape ? "landscape" : "portrait";
    },
    controlVideoPlayback() {
      const currentMedia = this.storyData.medias[this.currentMediaIndex];
      if (currentMedia.type === "video") {
        const videoElement = this.$refs[`video-${this.currentMediaIndex}`];
        if (videoElement && videoElement.length > 0) {
          this.currentVideoPlaying = videoElement[0];
          this.currentVideoPlaying.currentTime = 0;
          this.currentVideoPlaying.play();
        }
      } else if (this.currentVideoPlaying) {
        this.currentVideoPlaying.pause();
        this.currentVideoPlaying = null;
      }
    },
    toggleMute() {
      this.muted = !this.muted;
    },
  },
};
</script>

<template>
  <div class="story">
    <Transition name="fade">
      <Loader class="story__loader" v-if="loading" />
    </Transition>
    <Transition name="fade">
      <div class="story__content" v-if="!loading && storyData">
        <Pagination
          :medias="storyData.medias"
          :tl="tl"
          :nextMedia="storyStore.nextMedia"
        />
        <div class="story__header" v-if="currentMediaIndex !== 0">
          <div class="story__header-title">
            {{ storyData.story.name }}
          </div>
          <div class="story__header-date">
            {{ storyData.medias[currentMediaIndex].exif.formattedDate }}
          </div>
          <button
            class="story__header-audio"
            @click="toggleMute"
            v-if="storyData.medias[currentMediaIndex].type === 'video'"
          >
            <i v-if="muted" class="bx bxs-volume-mute"></i>
            <i v-else class="bx bxs-volume-full"></i>
          </button>
        </div>
        <Navigation
          :currentVideoPlaying="currentVideoPlaying"
          :tl="tl"
          :nextMedia="storyStore.nextMedia"
          :prevMedia="storyStore.prevMedia"
        />
        <div class="story__media-container">
          <div
            class="story__media"
            v-for="(media, index) in storyData.medias"
            :class="{
              show: index === currentMediaIndex,
              [getClass(media)]: true,
            }"
          >
            <template v-if="media.type === 'photo'">
              <div class="story__media-overlay" v-if="index === 0">
                <h2>
                  {{ storyData.story.name }}
                </h2>
                <p>
                  <i class="bx bx-directions"></i>
                  {{ getDistance(storyData.stats) }}
                  <i class="bx bx-mountain-peak"></i>
                  {{ getElevation(storyData.stats) }}
                </p>
                <p>
                  <i class="bx bx-calendar-alt"></i>
                  {{ getDateRange(storyData.stats).startDate }}
                  <i class="bx bx-arrow-right-stroke"></i>
                  {{ getDateRange(storyData.stats).endDate }}
                </p>
              </div>
              <img
                :key="`photo-${index}`"
                :src="getMediaUrl(media.src)"
                :alt="storyData.story.name"
              />
            </template>
            <template v-else>
              <video
                :ref="`video-${index}`"
                :poster="getMediaUrl(media.poster)"
                :key="`video-${index}`"
                :src="getMediaUrl(media.src)"
                :alt="storyData.story.name"
                volume="0.35"
                :muted="muted"
                playsinline
                preload="metadata"
              />
            </template>
            <Content :exif="media.exif"></Content>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
@use "../scss/vars" as *;
@use "../scss/mixins" as *;

.story {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: center center calc($stories-width / 2 * -1);
  transform: translateZ(1px);

  @include small-only {
    transform-origin: center center calc(var(--vw) / 2 * -1);
  }

  &__loader {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
  }

  &__content {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;

    &:after {
      position: absolute;
      top: 0;
      left: 0;
      z-index: $z-gradient;
      content: "";
      height: rem-calc(100px);
      width: 100%;
      background-image: linear-gradient(
        to top,
        rgba(255, 0, 0, 0),
        rgba(0, 0, 0, 0.25)
      );
      pointer-events: none;
    }
  }

  &__media-container {
    position: relative;
    width: 100%;
    height: 100%;
  }

  &__media {
    position: absolute;
    z-index: 5;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 600ms $easing;
    background-color: $c-grey-light;

    &.show {
      opacity: 1;
    }

    &.portrait {
      img {
        @include small-only {
          object-fit: cover;
        }
      }
    }

    img,
    video {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    video {
      object-fit: cover;
    }

    &-overlay {
      background: rgba(0, 0, 0, 0.3);
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: $z-content;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      padding: rem-calc(75px) rem-calc(15px) rem-calc(15px) rem-calc(15px);
      color: #fff;

      p,
      h2 {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 14px;
        font-weight: 700;
        line-height: 1;
        padding: rem-calc(10px) rem-calc(12px) rem-calc(10px) rem-calc(12px);
        margin: 0 0 15px 0;
        background: rgba($c-grey-light, 0.2);
        letter-spacing: 0.06em;
        backdrop-filter: blur(3px);
        border-radius: rem-calc(10px);

        i {
          font-size: 18px;
        }
      }

      h2 {
        font-size: rem-calc(32px);
        margin: 0 0 rem-calc(35px) 0;
        padding: rem-calc(8px) rem-calc(25px);
        line-height: 1.2;

        i {
          font-size: 24px;
        }
      }
    }
  }

  &__header {
    display: flex;
    align-items: center;
    position: absolute;
    top: rem-calc(25px);
    left: rem-calc(10px);
    height: rem-calc(32px);
    right: rem-calc(10px);
    z-index: $z-navigation + 1;
    color: #fff;
    text-decoration: none;
    pointer-events: none;
    backface-visibility: hidden;

    &-title {
      font-size: rem-calc(14px);
      font-weight: 700;
      margin-right: rem-calc(12px);
      text-shadow: 0px 0px 2px rgba(0, 0, 0, 0.35);
    }

    &-date {
      font-size: rem-calc(14px);
      font-weight: 400;
      text-shadow: 0px 0px 2px rgba(0, 0, 0, 0.35);
    }

    &-audio {
      cursor: pointer;
      display: block;
      border: none;
      background: none;
      margin: 0 0 0 auto;
      padding: rem-calc(10px);
      pointer-events: auto;

      i {
        color: #fff;
        position: relative;
        top: rem-calc(2px);
        font-size: rem-calc(22px);
      }
    }
  }
}
</style>
