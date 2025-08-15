import { defineStore } from "pinia";
import Preloader from "../utils/Preloader.js";
import { getMediaUrl } from "../utils/imageUtils.js";
import { formatDate, parseExifDate } from "../utils/dateUtils.js";
import { setStoriesListHeight } from "../utils/sizeUtils.js";

const apiUrl = import.meta.env.VITE_API_URL;

export const useStoryStore = defineStore("story", {
  state: () => ({
    activePhoto: null,
    currentStoryIndex: 0,
    stories: [],
    loading: true,
    storiesLoading: [], // Array to track loading state for individual stories
    storyData: [], // Array to store individual story data by story index
  }),

  actions: {
    setActivePhoto(photo) {
      this.activePhoto = photo;
    },

    clearActivePhoto() {
      this.activePhoto = null;
    },

    setCurrentStoryIndex(index) {
      this.currentStoryIndex = index;
    },

    setStories(stories) {
      this.stories = stories;
      this.storiesLoading = new Array(stories.length).fill(true);
      this.storyData = new Array(stories.length).fill(null);
    },

    setLoading(loading) {
      this.loading = loading;
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
        const sortedStories = data.stories
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
        this.setStories(sortedStories);

        // Preload cover images
        const coverImages = this.stories
          .filter((story) => story.cover)
          .map((story) => getMediaUrl(story.id, story.cover));

        await Preloader.load(coverImages);
        setStoriesListHeight();

        // For instead of ForEach to load stories sequentially
        for (let i = 0; i < this.stories.length; i++) {
          await this.fetchStoryData(this.stories[i], i);
        }

        return this.stories;
      } catch (error) {
        console.error("Error loading stories:", error);
        throw error;
      } finally {
      }
    },

    async fetchStoryData(story, index) {
      try {
        const response = await fetch(`${apiUrl}/story/${story.id}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Format dates for all medias before setting storyData
        const formattedData = {
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
              // ordering based on the filename (should be done in the API)
              const numA = a.src.match(/\d+/)?.[0] || "";
              const numB = b.src.match(/\d+/)?.[0] || "";
              return numA.localeCompare(numB, undefined, { numeric: true });
            }),
        };

        this.setStoryData(index, formattedData);

        // Preload the photos for the stories
        const medias = formattedData.medias.map((media) =>
          getMediaUrl(story.id, media.src)
        );

        await Preloader.load(medias);
        return formattedData;
      } catch (error) {
        console.error("Error fetching story data:", error);
        throw error;
      } finally {
        // we hide the loader when the first story is loaded
        if (index === 0) {
          this.setLoading(false);
        }
        this.setStoryLoading(index, false);
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
  },
});
