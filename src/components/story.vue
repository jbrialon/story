<script>
import { getMediaUrl } from "../utils/imageUtils.js";
import Preloader from "../utils/Preloader.js";
import gsap from "gsap";
import { formatDate } from "../utils/dateUtils.js";

export default {
  name: "Story",
  props: {
    story: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      storyData: null,
      loading: true,
      currentIndex: 0,
    };
  },
  watch: {
    currentIndex(index) {
      const currentPhoto = this.storyData.photos[index];
      if (!currentPhoto) return;

      const hasGps = !!(currentPhoto.exif && currentPhoto.exif.GPS);
      if (hasGps) {
        this.$emit("photo-gps", {
          latitude: currentPhoto.exif.GPS.latitude,
          longitude: currentPhoto.exif.GPS.longitude,
          storyId: this.story.id,
        });
      }
    },
  },
  methods: {
    getMediaUrl(src) {
      return getMediaUrl(this.story.id, src);
    },
    next() {
      if (this.currentIndex < this.storyData.photos.length - 1) {
        this.currentIndex++;
      } else {
        this.$emit("next-story");
      }
    },
    prev() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
      } else {
        this.$emit("prev-story");
      }
    },
    getClass(photo) {
      let landscape = photo.size.width > photo.size.height;
      return landscape ? "landscape" : "portrait";
    },
    async fetchStoryData() {
      try {
        this.loading = true;

        const response = await fetch(
          `https://api.jerem.cool/story/${this.story.id}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Format dates for all photos before setting storyData
        const formattedData = {
          ...data.data,
          photos: data.data.photos.map((photo) => ({
            ...photo,
            exif: {
              ...photo.exif,
              formattedDate: formatDate(photo.exif.date),
            },
          })),
        };

        this.storyData = formattedData;

        // Preload the first 4 photos for better user experience
        const firstFourPhotos = formattedData.photos
          .slice(0, 4)
          .map((photo) => getMediaUrl(this.story.id, photo.src));

        return Preloader.load(firstFourPhotos);
      } catch (error) {
        console.error("Error fetching story data:", error);
      } finally {
        this.loading = false;
        gsap.set(this.$refs.story, {
          rotationY: () => (this.index ? 90 : 0),
        });
      }
    },
  },
  mounted() {
    this.fetchStoryData();
  },
};
</script>

<template>
  <div class="story" ref="story">
    <transition name="fade">
      <div class="story__content" v-if="!loading">
        <div class="story__pagination">
          <span
            class="story__pagination-bullet"
            v-for="index in storyData.photos.length"
            :key="index"
          >
            <span
              class="story__pagination-bullet-progress"
              :style="{ width: index - 1 <= currentIndex ? '100%' : '0%' }"
            >
            </span>
          </span>
        </div>
        <div class="story__header">
          <div class="story__header-title">
            {{ story.name }}
          </div>
          <div class="story__header-date">
            {{ storyData.photos[currentIndex].exif.formattedDate }}
          </div>
        </div>
        <div class="story__navigation">
          <button
            class="story__navigation-button story__navigation-button--prev"
            @click="prev"
          ></button>
          <button
            class="story__navigation-button story__navigation-button--next"
            @click="next"
          ></button>
        </div>
        <div class="story__media-container">
          <div
            class="story__media"
            :class="{
              show: index === currentIndex,
              [getClass(photo)]: true,
            }"
            v-for="(photo, index) in storyData.photos"
          >
            <img
              :key="`photo-${index}`"
              :src="getMediaUrl(photo.src)"
              :alt="story.id"
            />
            <ul class="story__media-description">
              <li v-for="(desc, index) in photo.exif.description" :key="index">
                {{ desc }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style lang="scss">
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
  backface-visibility: hidden;
  transform-origin: center center calc($stories-width / 2 * -1);

  @include small-only {
    transform-origin: center center calc(var(--vw) / 2 * -1);
  }

  &__content {
    position: relative;
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

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
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
    transform: translateZ(0);

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
    transform: translateZ(0);

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
