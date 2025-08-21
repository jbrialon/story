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
    transitionDirection() {
      return this.storyStore.transitionDirection;
    },
    storyViewed() {
      return this.storyStore.storyViewed;
    },
  },
  methods: {
    selectStory(index) {
      this.storyStore.setCurrentStoryIndex(index);
    },
    getMediaUrl(story) {
      return getMediaUrl(story, story.cover, story.lastUpdate);
    },
    onAfterLeave() {
      // after we leave the story, reset the media index to 0 so when we go back we start at the first media
      this.storyStore.resetMediaIndex();
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
        :class="{
          loaded: storiesLoading[index] === false,
          loading: storiesLoading[index] === true,
        }"
      >
        <button class="stories__button" @click="selectStory(index)">
          <span
            class="stories__image"
            :class="{
              viewed: storyViewed[index],
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
            @after-leave="onAfterLeave"
          >
            <Story
              v-if="currentIndex === index"
              :storyId="story.id"
              :index="index"
              class="stories__slide"
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
  border-radius: 35px;
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
    position: relative;
    line-height: 0;

    &:before {
      content: "";
      position: absolute;
      top: 1px;
      left: 50%;
      transform: translateX(-50%);
      border-radius: 50%;
      background: $c-grey-light;
      width: 72px;
      height: 72px;
      opacity: 0;
      background: linear-gradient(45deg, #eeeeee 10%, #dddddd 18%, #eeeeee 33%);
      background-size: 800px 72px;
      transition: opacity 0.3s $easing;
      animation: none;
    }

    @keyframes loading {
      0% {
        background-position: -400px 0;
      }
      100% {
        background-position: 400px 0;
      }
    }

    &.loaded {
      .stories__image {
        transform: scale(1);
      }
      .stories__name {
        opacity: 1;
      }

      .stories__button {
        cursor: pointer;
      }
    }

    &.loading {
      &:before {
        opacity: 1;
        animation: loading 2000ms infinite;
      }
    }
  }

  &__button {
    position: relative;
    color: #000;
    text-decoration: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: opacity 0.3s $easing;
    padding-bottom: 30px;
    background: none;
    border: none;

    @include small-only {
      padding-bottom: 0;
    }
  }

  &__image {
    position: relative;
    border-radius: 50%;
    padding: 6px;
    transition: transform 600ms $easing;
    transform: scale(0);

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
        // TODO: add loading animation
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
    opacity: 0;
    transition: opacity 600ms $easing 600ms;

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
}
</style>
