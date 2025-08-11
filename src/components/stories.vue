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
        duration: 1,
        ease: "power2.out",
      });

      gsap.to(this.slides[this.currentIndex], {
        rotationY: 0,
        duration: 1,
        ease: "power2.out",
      });
    },
    nextStory() {
      if (this.currentIndex === this.slides.length - 1) return;

      if (this.slides.length === 0) {
        this.slides = this.$refs.stories.map((ref) => ref.$el);
      }

      this.currentIndex++;

      gsap.to(this.slides[this.currentIndex - 1], {
        rotationY: -90,
        onComplete: () => {
          // TODO:
          // we should reset the story to the first image
        },
        duration: 1,
        ease: "power2.out",
      });
      gsap.to(this.slides[this.currentIndex], {
        rotationY: 0,
        duration: 1,
        ease: "power2.out",
      });
    },
    prevStory() {
      if (this.currentIndex === 0) return;

      if (this.slides.length === 0) {
        this.slides = this.$refs.stories.map((ref) => ref.$el);
      }

      this.currentIndex--;

      gsap.to(this.slides[this.currentIndex + 1], {
        rotationY: 90,
        duration: 1,
        ease: "power2.out",
      });
      gsap.to(this.slides[this.currentIndex], {
        rotationY: 0,
        duration: 1,
        ease: "power2.out",
      });
    },
    getMediaUrl(story) {
      return getMediaUrl(story.id, story.cover);
    },
  },
};
</script>

<template>
  <div class="stories">
    <ul class="stories__list js-stories-list">
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
        <template v-for="(story, index) in stories" :key="story.id">
          <Story
            :story="story"
            :index="index"
            class="stories__slide"
            ref="stories"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use "../scss/vars" as *;
@use "../scss/mixins" as *;

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

    @include small-only {
      padding: 10px;
      gap: 10px;
    }
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
    transition: opacity 0.3s $easing;
    padding-bottom: 30px;
    background: none;
    border: none;

    &:hover {
      cursor: pointer;
    }

    @include small-only {
      padding-bottom: 0;
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

    @include small-only {
      display: none;
    }
  }

  &__content {
    position: relative;
    width: 100%;
    aspect-ratio: 2 / 3;
    display: flex;
    align-items: center;
    justify-content: center;
    transform-style: preserve-3d;

    @include small-only {
      height: calc(var(--vh) - var(--stories-list-height));
      aspect-ratio: unset;
    }
  }

  &__slider {
    width: 100%;
    height: 100%;
    position: relative;
    perspective: 1000px;
  }
}
</style>
