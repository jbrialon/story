import { defineStore } from "pinia";
import MobileDetect from "mobile-detect";

import Preloader from "../utils/Preloader.js";
import { getMediaUrl } from "../utils/imageUtils.js";
import { formatDate, parseDate } from "../utils/dateUtils.js";
import { setStoriesListHeight } from "../utils/sizeUtils.js";

const isMobile = new MobileDetect(window.navigator.userAgent).mobile();
const apiUrl = import.meta.env.VITE_API_URL;

export const useStoryStore = defineStore("story", {
  state: () => ({
    loading: true,
    loadingTransitionComplete: false,
    currentStoryIndex: 0,
    priorityIndex: 0,
    transitionDirection: 1,
    stories: [],
    storiesLoading: [], // Array to track loading state for individual stories
    storyViewed: [], // Array to track stories that have been viewed
    storyData: [], // Array to store individual story data by story index
    mediaIndex: [],
    mapInteracted: false,
  }),

  actions: {
    setLoading(loading) {
      this.loading = loading;
    },

    setLoadingTransitionComplete(complete) {
      this.loadingTransitionComplete = complete;
    },

    // ------------------------------
    // Story navigation
    // ------------------------------
    setCurrentStoryIndex(index) {
      if (this.currentStoryIndex === index || this.storiesLoading[index])
        return;

      this.transitionDirection = index > this.currentStoryIndex ? 1 : -1;
      this.mediaIndex[index] = 0;
      this.currentStoryIndex = index;
      this.updateUrlHash();
    },

    updateUrlHash() {
      if (this.stories.length > 0 && this.stories[this.currentStoryIndex]) {
        const storyId = this.stories[this.currentStoryIndex].id;
        window.location.hash = storyId;
      }
    },

    nextStory() {
      if (this.currentStoryIndex === this.stories.length - 1) return;

      this.transitionDirection = 1;
      this.currentStoryIndex++;
      this.updateUrlHash();
    },

    prevStory() {
      if (this.currentStoryIndex === 0) return;

      this.transitionDirection = -1;
      this.currentStoryIndex--;
      this.updateUrlHash();
    },

    setMapInteracted(interacted) {
      this.mapInteracted = interacted;
    },

    // ------------------------------
    // media navigation
    // ------------------------------
    setMediaIndex(index) {
      this.mediaIndex[this.currentStoryIndex] = index;
    },

    nextMedia() {
      if (
        this.mediaIndex[this.currentStoryIndex] <
        this.storyData[this.currentStoryIndex].medias.length - 1
      ) {
        this.mediaIndex[this.currentStoryIndex]++;
      } else {
        this.nextStory();
      }
    },

    prevMedia() {
      if (this.mediaIndex[this.currentStoryIndex] > 0) {
        this.mediaIndex[this.currentStoryIndex]--;
      } else {
        this.prevStory();
      }
    },

    resetMediaIndex() {
      this.mediaIndex = this.mediaIndex.map((_, index) =>
        index === this.currentStoryIndex ? this.mediaIndex[index] : 0
      );
    },
    // ------------------------------
    // Stories & Loading
    // ------------------------------
    setStories(stories) {
      this.stories = stories;
      this.storiesLoading = new Array(stories.length).fill(true);
      this.storyViewed = new Array(stories.length).fill(false);
      this.storyData = new Array(stories.length).fill(null);
      this.mediaIndex = new Array(stories.length).fill(0);
    },

    setStoryLoading(storyIndex, loading) {
      if (this.storiesLoading[storyIndex] !== undefined) {
        this.storiesLoading[storyIndex] = loading;
      }
    },

    setStoryData(storyIndex, data) {
      if (this.storyData[storyIndex] !== undefined) {
        this.storyData[storyIndex] = data;
      }
    },
    setStoryViewed(storyIndex, viewed) {
      if (this.storyViewed[storyIndex] !== undefined) {
        this.storyViewed[storyIndex] = viewed;
      }
    },
    // ENTRY LOADING POINT
    async loadStories() {
      try {
        // Fetch and process stories
        const stories = await this.fetchStoriesList();
        this.setStories(stories);

        // Set up initial story and URL
        this.priorityIndex = this.setupInitialStory(stories);

        // Preload covers and setup UI
        await this.preloadCovers();

        // Load stories data (priority first, then others)
        await this.loadStoriesData(stories);

        return this.stories;
      } catch (error) {
        console.error("Error loading stories:", error);
        throw error;
      }
    },

    async fetchStoriesList() {
      const response = await fetch(`${apiUrl}/story`);
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }

      const data = await response.json();
      return this.processStoriesData(data.stories);
    },

    processStoriesData(stories) {
      return stories
        .sort((a, b) => {
          const dateA = parseDate(a.date);
          const dateB = parseDate(b.date);
          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;
          return dateB - dateA;
        })
        .map((story) => ({
          ...story,
          formattedDate: formatDate(story.date),
        }));
    },

    setupInitialStory(stories) {
      const hash = window.location.hash.slice(1);
      let priorityIndex = 0;

      if (hash) {
        const hashIndex = stories.findIndex((story) => story.id === hash);
        if (hashIndex !== -1) {
          priorityIndex = hashIndex;
          this.currentStoryIndex = hashIndex;
        } else {
          window.location.hash = stories[0].id;
        }
      } else {
        window.location.hash = stories[0].id;
      }

      return priorityIndex;
    },

    async preloadCovers() {
      const coverImages = this.stories
        .filter((story) => story.cover)
        .map((story) => getMediaUrl(story, story.cover, story.lastUpdate));

      await Preloader.load(coverImages);
      setStoriesListHeight();
    },

    async loadStoriesData(stories) {
      // Load priority story first
      await this.fetchStoryData(
        stories[this.priorityIndex],
        this.priorityIndex
      );

      // Load remaining stories
      for (let i = 0; i < stories.length; i++) {
        if (i !== this.priorityIndex) {
          await this.fetchStoryData(stories[i], i);
        }
      }
    },

    async fetchStoryData(story, index) {
      try {
        // Fetch story data
        const response = await fetch(`${apiUrl}/story/${story.id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Process and store story data
        const storyData = this.processStoryData(data.data);
        this.setStoryData(index, storyData);

        // Load additional resources
        await this.loadStoryResources(story, storyData);

        // Update loading states
        this.updateLoadingStates(index);

        return storyData;
      } catch (error) {
        console.error("Error fetching story data:", error);
        throw error;
      }
    },

    processStoryData(data) {
      return {
        ...data,
        medias: data.medias
          .map((media) => ({
            ...media,
            exif: {
              ...media.exif,
              formattedDate: media.exif?.date
                ? formatDate(media.exif.date)
                : null,
            },
          }))
          .sort((a, b) => {
            const numA = a.src.match(/\d+/)?.[0] || "";
            const numB = b.src.match(/\d+/)?.[0] || "";
            return numA.localeCompare(numB, undefined, { numeric: true });
          }),
      };
    },

    async loadStoryResources(story, storyData) {
      // Preload photos
      const medias = storyData.medias.map((media) =>
        getMediaUrl(story, media.src)
      );
      await Preloader.load(medias);

      // Load map paths if needed
      if (storyData.stats?.length > 0 && !isMobile) {
        await this.loadStoryPaths(story, storyData);
      }
    },

    async loadStoryPaths(story, storyData) {
      await Promise.all(
        storyData.stats.map(async (stat, statIndex) => {
          const pathUrl = `${apiUrl}/story/${encodeURIComponent(story.id)}${
            stat.pathJson
          }?v=${story.lastUpdate}`;
          try {
            const pathResponse = await fetch(pathUrl);
            if (pathResponse.ok) {
              const pathData = await pathResponse.json();
              if (pathData) {
                storyData.stats[statIndex] = { ...stat, path: pathData };
              }
            }
          } catch (error) {
            console.warn(`Could not fetch path: ${pathUrl}`);
          }
        })
      );
    },

    updateLoadingStates(index) {
      if (index === this.currentStoryIndex) {
        this.setLoading(false);
      }
      this.setStoryLoading(index, false);
    },
  },

  getters: {
    getStories: (state) => state.stories,
    isLoading: (state) => state.loading,
    getStoryLoading: (state) => (storyIndex) =>
      state.storiesLoading[storyIndex] || false,
    getStoryData: (state) => (storyIndex) =>
      state.storyData[storyIndex] || null,
    isLoadingTransitionComplete: (state) => state.loadingTransitionComplete,
  },
});
