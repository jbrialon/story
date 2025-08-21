<script>
import { getMediaUrl } from "../utils/imageUtils.js";
import { useStoryStore } from "../stores/storyStore.js";
import { formatDate } from "../utils/dateUtils.js";

import Loader from "./loader.vue";

export default {
  name: "Story",
  props: {
    storyId: {
      type: String,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      mouseDownTime: null,
      maxHoldDuration: 300,
      currentVideoPlaying: null,
    };
  },
  setup() {
    const storyStore = useStoryStore();
    return { storyStore };
  },
  components: { Loader },
  computed: {
    storyData() {
      return this.storyStore.getStoryData(this.index);
    },
    loading() {
      return this.storyStore.getStoryLoading(this.index);
    },
    currentMediaIndex() {
      return this.storyStore.mediaIndex[this.index];
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
  },
  methods: {
    getDateRange(stats) {
      if (!stats || stats.length === 0) return "";

      const startDate = formatDate(stats[0].timestamp);
      const endDate = formatDate(stats[stats.length - 1].timestamp);

      return `${startDate} → ${endDate}`;
    },
    getDistance(stats) {
      return `${stats
        .reduce((acc, curr) => acc + curr.totalDistanceKm, 0)
        .toFixed(0)}km`;
    },
    getElevation(stats) {
      return `${stats
        .reduce((acc, curr) => acc + curr.totalElevationGainM, 0)
        .toFixed(0)}m d+`;
    },
    getMediaUrl(src) {
      return getMediaUrl(this.storyData, src, this.storyData.lastUpdate);
    },
    next() {
      this.storyStore.nextMedia();
    },
    prev() {
      this.storyStore.prevMedia();
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

<template>
  <div class="story">
    <Transition name="fade">
      <Loader class="story__loader" v-if="loading" />
    </Transition>
    <Transition name="fade">
      <div class="story__content" v-if="!loading && storyData">
        <div class="story__pagination">
          <span
            class="story__pagination-bullet"
            v-for="index in storyData.medias.length"
            :key="index"
          >
            <span
              class="story__pagination-bullet-progress"
              :style="{ width: index - 1 <= currentMediaIndex ? '100%' : '0%' }"
            >
            </span>
          </span>
        </div>
        <div class="story__header" v-if="currentMediaIndex !== 0">
          <div class="story__header-title">
            {{ storyData.story.name }}
          </div>
          <div class="story__header-date">
            {{ storyData.medias[currentMediaIndex].exif.formattedDate }}
          </div>
        </div>
        <div
          class="story__navigation"
          @mousedown="handleEventDown"
          @mouseup="handleEventUp"
          @touchstart="handleEventDown"
          @touchend="handleEventUp"
        >
          <div
            data-action="prev"
            class="story__navigation-button story__navigation-button--prev"
          ></div>
          <div
            data-action="next"
            class="story__navigation-button story__navigation-button--next"
          ></div>
        </div>
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
                  <i class="bxr bxs-mountain-peak"></i>
                  {{ getDistance(storyData.stats) }} //
                  {{ getElevation(storyData.stats) }}
                </p>
                <p>
                  <i class="bxr bxs-calendar-alt"></i>
                  {{ getDateRange(storyData.stats) }}
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
                loop
                volume="0.35"
                playsinline
                preload="metadata"
              />
            </template>
            <ul
              class="story__media-description"
              v-if="media.exif.description.length > 0"
            >
              <li v-for="(desc, index) in media.exif.description" :key="index">
                {{ desc }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
@use "../scss/vars" as *;
@use "../scss/mixins" as *;

$z-gradient: 10;
$z-pagination: 20;
$z-content: 21;
$z-navigation: 30;

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
      height: 100px;
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
      background: rgba(0, 0, 0, 0.5);
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
      padding: 95px 15px 15px 15px;
      color: #fff;

      p,
      h2 {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        font-weight: 700;
        line-height: 1.2;
        padding: 10px 12px;
        margin: 0 0 15px 0;
        background: rgba($c-grey-light, 0.2);
        text-shadow: 0px 0px 4px rgba(0, 0, 0, 0.35);
        letter-spacing: 0.06em;
        backdrop-filter: blur(3px);
        border-radius: 10px;
        text-transform: uppercase;

        i {
          font-size: 18px;
        }
      }

      h2 {
        font-size: 24px;
        margin: 0 0 15px 0;
      }
    }

    &-description {
      position: absolute;
      bottom: 15px;
      left: 15px;
      right: 15px;
      z-index: $z-content;
      margin: 0;
      padding: 0;
      list-style: none;
      display: flex;
      flex-direction: column;

      li {
        display: inline-block;
        width: fit-content;
        color: #fff;
        font-size: 14px;
        font-weight: 700;
        line-height: 1.2;
        padding: 10px 12px;
        background: rgba($c-grey-light, 0.2);
        text-shadow: 0px 0px 4px rgba(0, 0, 0, 0.35);
        letter-spacing: 0.06em;
        backdrop-filter: blur(3px);
        border-radius: 10px;
        text-transform: uppercase;

        &:first-child {
          margin-bottom: 10px;
        }

        &:only-child {
          margin-bottom: 0;
        }
      }
    }
  }

  &__pagination {
    position: absolute;
    left: 0px;
    right: 0px;
    top: 10px;
    bottom: unset;
    max-width: calc(100% - 10px);
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    z-index: $z-pagination;

    &-bullet {
      width: 100%;
      flex-shrink: 10;
      border-radius: 999px;
      height: 3px;
      background: rgba(255, 255, 255, 0.35);
      position: relative;
      overflow: hidden;
      box-shadow: 0 0 1px #00000059;
      opacity: 1;
      margin: 0 4px;
    }

    &-bullet-progress {
      position: absolute;
      background: #fff;
      left: 0;
      top: 0;
      height: 100%;
      width: 0;
      transition: width 0.5s $easing;

      &.viewed {
        background: #000;
      }
    }
  }

  &__header {
    display: flex;
    align-items: center;
    position: absolute;
    top: 25px;
    left: 10px;
    height: 32px;
    z-index: $z-navigation;
    color: #fff;
    text-decoration: none;
    user-select: none;
    backface-visibility: hidden;

    &-title {
      font-size: 14px;
      font-weight: 700;
      margin-right: 12px;
      text-shadow: 0px 0px 2px rgba(0, 0, 0, 0.35);
    }

    &-date {
      font-size: 14px;
      font-weight: 400;
      text-shadow: 0px 0px 2px rgba(0, 0, 0, 0.35);
    }
  }

  &__navigation {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: $z-navigation;

    &-button {
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
}
</style>
