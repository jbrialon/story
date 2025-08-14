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
    loading: false,
    storiesLoading: [], // Array to track loading state for individual stories
    storyData: {}, // Object to store individual story data by story ID
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
      this.storiesLoading = new Array(stories.length).fill(false);
    },

    setLoading(loading) {
      this.loading = loading;
    },

    setStoryLoading(storyIndex, loading) {
      if (this.storiesLoading[storyIndex] !== undefined) {
        this.storiesLoading[storyIndex] = loading;
      }
    },

    setStoryData(storyId, data) {
      this.storyData[storyId] = data;
    },

    async loadStories() {
      this.setLoading(true);
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
        const coverImages = sortedStories
          .filter((story) => story.cover)
          .map((story) => getMediaUrl(story.id, story.cover));

        await Preloader.load(coverImages);
        setStoriesListHeight();

        return sortedStories;
      } catch (error) {
        console.error("Error loading stories:", error);
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    async fetchStoryData(storyId, storyIndex) {
      try {
        this.setStoryLoading(storyIndex, true);

        const response = await fetch(`${apiUrl}/story/${storyId}`);

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

        this.setStoryData(storyId, formattedData);

        // Preload the first 4 photos for better user experience
        const firstFourPhotos = formattedData.medias
          .slice(0, 4)
          .filter((media) => media.type === "photo")
          .map((media) => getMediaUrl(storyId, media.src));

        await Preloader.load(firstFourPhotos);
        return formattedData;
      } catch (error) {
        console.error("Error fetching story data:", error);
        throw error;
      } finally {
        this.setStoryLoading(storyIndex, false);
      }
    },
  },

  getters: {
    getStories: (state) => state.stories,
    isLoading: (state) => state.loading,
    getStoryLoading: (state) => (storyIndex) =>
      state.storiesLoading[storyIndex] || false,
    getStoryData: (state) => (storyId) => state.storyData[storyId] || null,
  },
});
