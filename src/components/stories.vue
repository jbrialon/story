<script>
import { getMediaUrl } from "../utils/imageUtils";
import { useStoryStore } from "../stores/storyStore.js";

import Story from "./story.vue";

export default {
  name: "Stories",
  setup() {
    const storyStore = useStoryStore();
    return { storyStore };
  },
  data() {
    return {
      storyViewed: [],
      transitionDirection: -1,
    };
  },
  components: {
    Story,
  },
  computed: {
    currentIndex() {
      return this.storyStore.currentStoryIndex;
    },
    stories() {
      return this.storyStore.stories;
    },
    storiesLoading() {
      return this.storyStore.storiesLoading;
    },
  },
  methods: {
    selectStory(index) {
      if (this.currentIndex === index) return;

      this.transitionDirection = index > this.currentIndex ? 1 : -1;
      this.storyStore.setCurrentStoryIndex(index);
    },
    nextStory() {
      if (this.currentIndex === this.stories.length - 1) return;

      this.transitionDirection = 1;
      this.storyStore.setCurrentStoryIndex(this.currentIndex + 1);
    },
    prevStory() {
      if (this.currentIndex === 0) return;

      this.transitionDirection = -1;
      this.storyStore.setCurrentStoryIndex(this.currentIndex - 1);
    },
    getMediaUrl(story) {
      return getMediaUrl(story.id, story.cover);
    },
    handleNextStory(storyId) {
      if (!this.storyViewed.includes(storyId)) {
        this.storyViewed.push(storyId);
      }
      this.nextStory();
    },
    handlePrevStory(storyId) {
      if (!this.storyViewed.includes(storyId)) {
        this.storyViewed.push(storyId);
      }
      this.prevStory();
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
        <button class="stories__button" @click="selectStory(index)">
          <span
            class="stories__image"
            :class="{
              viewed: storyViewed.includes(story.id),
              loading: storiesLoading[index],
            }"
          >
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
    <div class="stories__content">
      <div class="stories__slider">
        <template v-for="(story, index) in stories" :key="story.id">
          <Transition
            :name="
              transitionDirection === 1
                ? 'cube-effect-next'
                : 'cube-effect-prev'
            "
          >
            <Story
              v-show="currentIndex === index"
              :story="story"
              :index="index"
              class="stories__slide"
              ref="stories"
              @next-story="handleNextStory"
              @prev-story="handlePrevStory"
            />
          </Transition>
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
  top: 50%;
  left: 5vh;
  transform: translateY(-50%);
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
    transform: translateY(0);
  }

  &__list {
    list-style: none;
    padding: 20px;
    margin: 0;
    display: flex;
    flex-direction: row;
    gap: 20px;
    overflow-y: hidden;
    overflow-x: scroll;
    scrollbar-width: none;
    -ms-overflow-style: none;
    &::-webkit-scrollbar {
      display: none;
    }

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
    padding: 6px;
    transition: all 900ms $easing;

    &:before {
      content: "";
      position: absolute;
      display: block;
      inset: 0;
      border-radius: 50%;
      background-image: linear-gradient(
        to right top,
        #ffc600 20%,
        #ff0040,
        #e600cc 80%
      );
      transition: opacity 0.3s $easing;
    }

    &.viewed {
      &:before {
        opacity: 0.4;
      }
    }

    &.loading {
      &:before {
        animation: loading 2000ms infinite ease-in;
      }
    }

    &:after {
      content: "";
      position: absolute;
      left: 3px;
      top: 3px;
      right: 3px;
      bottom: 3px;
      background: #fff;
      border-radius: 50%;
      z-index: 1;
    }

    &-img {
      position: relative;
      z-index: 2;
      display: block;
      width: 60px;
      height: 60px;
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

  &__slide {
    position: absolute;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    backface-visibility: hidden;
  }

  .cube-effect-next-enter-active,
  .cube-effect-next-leave-active {
    transition: transform 1000ms $easing;
  }

  .cube-effect-next-enter-from {
    transform: rotateY(90deg);
  }

  .cube-effect-next-enter-to,
  .cube-effect-next-leave-from {
    transform: rotateY(0deg);
  }

  .cube-effect-next-leave-to {
    transform: rotateY(-90deg);
  }

  .cube-effect-prev-enter-active,
  .cube-effect-prev-leave-active {
    transition: transform 1000ms $easing;
  }

  .cube-effect-prev-enter-from {
    transform: rotateY(-90deg);
  }

  .cube-effect-prev-enter-to,
  .cube-effect-prev-leave-from {
    transform: rotateY(0deg);
  }

  .cube-effect-prev-leave-to {
    transform: rotateY(90deg);
  }

  @keyframes loading {
    to {
      transform: rotate(360deg);
    }
  }
}
</style>
