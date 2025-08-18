import { defineStore } from "pinia";
import MobileDetect from "mobile-detect";

import Preloader from "../utils/Preloader.js";
import { getMediaUrl } from "../utils/imageUtils.js";
import { formatDate, parseExifDate } from "../utils/dateUtils.js";
import { setStoriesListHeight } from "../utils/sizeUtils.js";

const isMobile = new MobileDetect(window.navigator.userAgent).mobile();
const apiUrl = import.meta.env.VITE_API_URL;

export const useStoryStore = defineStore("story", {
  state: () => ({
    loading: true,
    loadingTransitionComplete: false,
    currentStoryIndex: 0,
    transitionDirection: 1,
    stories: [],
    storiesLoading: [], // Array to track loading state for individual stories
    storyData: [], // Array to store individual story data by story index
    mediaIndex: [],
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
      this.currentStoryIndex = index;
    },

    nextStory() {
      if (this.currentStoryIndex === this.stories.length - 1) return;

      this.transitionDirection = 1;
      this.currentStoryIndex++;
    },

    prevStory() {
      if (this.currentStoryIndex === 0) return;

      this.transitionDirection = -1;
      this.currentStoryIndex--;
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

    async loadStories() {
      try {
        const response = await fetch(`${apiUrl}/story`);

        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }

        const data = await response.json();

        // Sort stories by date (newest first, oldest last) and format dates
        const stories = data.stories
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

        // Set stories in the store
        this.setStories(stories);

        // Preload cover images
        const coverImages = this.stories
          .filter((story) => story.cover)
          .map((story) => getMediaUrl(story.id, story.cover));

        await Preloader.load(coverImages);
        setStoriesListHeight();

        // For Loop instead of ForEach to load stories sequentially
        for (let i = 0; i < stories.length; i++) {
          await this.fetchStoryData(stories[i], i);
        }

        return this.stories;
      } catch (error) {
        console.error("Error loading stories:", error);
        throw error;
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

        // Format and prepare story data
        const storyData = {
          ...data.data,
          medias: data.data.medias
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

        // Store in state
        this.setStoryData(index, storyData);

        // Preload photos
        const medias = storyData.medias.map((media) =>
          getMediaUrl(story.id, media.src)
        );
        await Preloader.load(medias);

        // Load path JSON files if stats exist
        // we don't load the json on mobile because we don't show the map
        if (storyData.stats && storyData.stats.length > 0 && !isMobile) {
          await Promise.all(
            storyData.stats.map(async (stat, statIndex) => {
              const pathUrl = `${apiUrl}/story/${encodeURIComponent(story.id)}${
                stat.pathJson
              }`;
              const pathResponse = await fetch(pathUrl);
              if (pathResponse.ok) {
                const pathData = await pathResponse.json();
                if (pathData) {
                  storyData.stats[statIndex] = {
                    ...stat,
                    path: pathData,
                  };
                }
              } else {
                console.warn(`Could not fetch path: ${pathUrl}`);
              }
            })
          );
        }

        // Update loading states
        if (index === 0) {
          this.setLoading(false);
        }
        this.setStoryLoading(index, false);

        return storyData;
      } catch (error) {
        console.error("Error fetching story data:", error);
        throw error;
      }
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
