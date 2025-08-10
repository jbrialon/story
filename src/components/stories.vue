<script>
import { gsap } from "gsap";
import { getMediaUrl } from "../utils/imageUtils";

import Story from "./story.vue";

export default {
  name: "Stories",
  props: {
    stories: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      activeStory: null,
      currentIndex: 0,
      slides: [],
    };
  },
  components: {
    Story,
  },
  methods: {
    selectStory(id, index) {
      // TODO: fix order of rotation
      const oldIndex = this.currentIndex;
      this.currentIndex = index;

      gsap.to(this.slides[oldIndex], {
        rotationY: -90,
        onComplete: () => gsap.set(this.slides[oldIndex], { rotationY: 90 }),
      });

      gsap.to(this.slides[this.currentIndex], {
        rotationY: 0,
      });
    },
    nextStory() {
      if (this.currentIndex === this.slides.length - 1) {
        return;
      }

      this.currentIndex++;

      gsap.to(this.slides[this.currentIndex - 1], {
        rotationY: -90,
        onComplete: () => {
          // TODO:
          // we should reset the story to the first image
        },
      });
      gsap.to(this.slides[this.currentIndex], {
        rotationY: 0,
      });
    },
    prevStory() {
      if (this.currentIndex === 0) {
        return;
      }

      this.currentIndex--;

      gsap.to(this.slides[this.currentIndex + 1], {
        rotationY: 90,
      });
      gsap.to(this.slides[this.currentIndex], {
        rotationY: 0,
      });
    },
    getMediaUrl(story) {
      return getMediaUrl(story.id, story.cover);
    },
    handlePhotoGps(gpsData) {
      this.$emit("photo-gps", gpsData);
    },
  },
  mounted() {
    this.$nextTick(() => {
      setTimeout(() => {
        this.slides = this.$refs.stories.map((ref) => ref.$el);

        gsap.set(this.slides, {
          rotationY: (i) => (i ? 90 : 0),
        });
      }, 100);
    });
  },
};
</script>

<template>
  <div class="stories">
    <ul class="stories__list">
      <li
        v-for="(story, index) in stories"
        :key="story.id"
        class="stories__item"
      >
        <button class="stories__button" @click="selectStory(story.id, index)">
          <span class="stories__image">
            <img
              :src="getMediaUrl(story)"
              :alt="story.name"
              class="stories__image-img"
            />
          </span>
          <span class="stories__name">
            {{ story.name }}
          </span>
        </button>
      </li>
    </ul>
    <div ref="content" class="stories__content">
      <div class="stories__slider">
        <template v-for="story in stories" :key="story.id">
          <Story
            :story="story"
            class="stories__slide"
            ref="stories"
            @prev-story="prevStory"
            @next-story="nextStory"
            @photo-gps="handlePhotoGps"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use "../scss/vars" as *;
@use "../scss/mixins" as *;

$stories-width: 436px;

.stories {
  position: absolute;
  width: $stories-width;
  z-index: 10;
  top: 5vh;
  left: 5vh;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border-radius: 15px;
  overflow: hidden;

  @include small-only {
    width: var(--vw);
    top: 0;
    left: 0;
    bottom: 0;
    border-radius: 0;
  }

  &__list {
    list-style: none;
    padding: 20px;
    margin: 0;
    display: flex;
    flex-direction: row;
    gap: 25px;
  }

  &__item {
    display: block;
    line-height: 0;
  }

  &__button {
    position: relative;
    color: #000;
    text-decoration: none;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition-duration: 0.3s;
    transition-property: opacity;
    padding-bottom: 30px;
    background: none;
    border: none;

    &:hover {
      cursor: pointer;
    }
  }

  &__image {
    position: relative;
    border-radius: 50%;
    padding: 4px;
    background-image: linear-gradient(
      to right top,
      #ffc600 20%,
      #ff0040,
      #e600cc 80%
    );

    &::before {
      content: "";
      position: absolute;
      left: 2px;
      top: 2px;
      right: 2px;
      bottom: 2px;
      background: #fff;
      border-radius: 50%;
      z-index: 1;
    }

    &-img {
      position: relative;
      z-index: 2;
      display: block;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      object-fit: cover;
      object-position: center;
    }
  }

  &__name {
    display: block;
    min-width: 95px;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.1;
    margin-top: 10px;
    position: absolute;
    top: 70px;
  }

  &__content {
    position: relative;
    width: 100%;
    aspect-ratio: 2 / 3;
    display: flex;
    align-items: center;
    justify-content: center;
    transform-style: preserve-3d;
  }

  &__slider {
    width: 100%;
    height: 100%;
    position: relative;
    perspective: 1000px;
  }

  &__slide {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    font-size: 50px;
    backface-visibility: hidden;
    transform-origin: center center calc($stories-width / 2 * -1);

    @include small-only {
      transform-origin: center center calc(var(--vw) / 2 * -1);
    }
  }
}
</style>
