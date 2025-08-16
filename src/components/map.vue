<script>
import mapboxgl from "mapbox-gl";
import { getMediaUrl } from "../utils/imageUtils";

import { useStoryStore } from "../stores/storyStore.js";

export default {
  name: "Map",
  setup() {
    const storyStore = useStoryStore();
    return { storyStore };
  },
  data() {
    return {
      map: null,
      mapOptions: {
        token:
          "pk.eyJ1IjoiamJyaWFsb24iLCJhIjoiZjJkNjkyNDNiMzU0YjAxY2FjNGZlMjU3MGFiYjYyZmQifQ.lwFTmFgGxSuvfoJdTcx7Jg",
        style: "mapbox://styles/jbrialon/ck3yg7nb807lc1co990hb80mi/draft",
        center: [2.465, 44.95017765091265],
        zoom: 3,
        bounds: new mapboxgl.LngLatBounds(),
      },
      storiesMarkers: [],
      storyMarkers: [],
    };
  },
  methods: {
    getMediaUrl(story) {
      return getMediaUrl(story.id, story.cover);
    },
    // Main Markers for the stories
    createStoriesMarker(story, index) {
      const markerElement = document.createElement("div");
      const cover = this.getMediaUrl(story);
      markerElement.className = "map__marker";
      markerElement.innerHTML = `
        <div class="map__marker-circle">
          <img class="map__marker-img" src="${cover}" alt="${story.name}" />
        </div>
      `;

      markerElement.addEventListener("click", () => {
        if (this.storyStore.storiesLoading[index] === false) {
          // this.storyStore.setCurrentStoryIndex(index);
        }
      });

      const marker = new mapboxgl.Marker(markerElement);
      const coord = new mapboxgl.LngLat(
        story.location.longitude,
        story.location.latitude
      );
      marker.setLngLat(coord);
      marker.addTo(this.map);

      this.storiesMarkers.push({
        marker: marker,
        element: markerElement,
        storyIndex: index,
      });

      this.mapOptions.bounds.extend([
        story.location.longitude,
        story.location.latitude,
      ]);

      return marker;
    },
    // Markers for the story (medias of the story)
    createStoryMarker(index) {
      const story = this.storiesData[index];
      if (this.storyMarkers[index]) return;

      this.storyMarkers[index] = [];

      story.medias.forEach((media) => {
        const markerElement = document.createElement("div");
        markerElement.className = "map__story-marker";
        markerElement.innerHTML = `
        <div class="map__story-marker-circle"></div>`;

        const marker = new mapboxgl.Marker(markerElement);
        const coord = new mapboxgl.LngLat(
          media.exif.GPS.longitude,
          media.exif.GPS.latitude
        );
        marker.setLngLat(coord);
        marker.addTo(this.map);

        this.storyMarkers[index].push({
          marker: marker,
          element: markerElement,
        });
      });

      // Add path to map
      story.stats.forEach((stat, statIndex) => {
        const segments = stat.path.tracks[0].segments[0];
        const coordinates = segments.map((segment) => [
          segment.lon,
          segment.lat,
        ]);

        // Add the line source
        this.map.addSource(`path-${index}-${statIndex}`, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: coordinates,
            },
          },
        });

        // Add the line layer
        this.map.addLayer({
          id: `path-${index}-${statIndex}`,
          type: "line",
          source: `path-${index}-${statIndex}`,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#667eea",
            "line-width": 3,
            "line-opacity": 1,
            "line-dasharray": [2, 2],
            "line-blur": 1,
          },
        });
      });
    },
    getStoryMarker(storyIndex) {
      return this.storiesMarkers.find(
        (marker) => marker.storyIndex === storyIndex
      );
    },
    hideStoriesMarkers() {
      this.storiesMarkers.forEach((marker) => {
        marker.element.classList.add("hide");
      });

      this.storyMarkers[this.activeStoryIndex].forEach((marker) => {
        marker.element.classList.add("active");
      });
    },
    showStoriesMarkers() {
      this.storiesMarkers.forEach((marker) => {
        marker.element.classList.remove("hide");
      });

      this.storyMarkers[this.activeStoryIndex]?.forEach((marker) => {
        marker.element.classList.remove("active");
      });

      this.fitBounds();
    },
    fitBounds() {
      if (this.storiesMarkers.length === 0) return;

      this.map.fitBounds(this.mapOptions.bounds, {
        padding: { top: 50, bottom: 50, left: 600, right: 100 }, // hardcoded values for now
        duration: 1000,
        maxZoom: 15,
      });
    },
  },
  computed: {
    storiesData() {
      return this.storyStore.storyData;
    },
    activeStoryIndex() {
      return this.storyStore.currentStoryIndex;
    },
  },
  watch: {
    "storyStore.stories": {
      handler(stories) {
        if (stories && stories.length > 0) {
          stories.forEach((story, index) => {
            if (story.location) {
              this.createStoriesMarker(story, index);
            }
          });
          this.fitBounds();
        }
      },
      deep: true,
    },
    "storyStore.storiesLoading": {
      handler(storiesLoading) {
        storiesLoading.forEach((loading, index) => {
          if (loading === false) {
            const marker = this.getStoryMarker(index);
            if (marker) {
              marker.element.classList.add("loaded");
              this.createStoryMarker(index);
            }
          }
        });
      },
      deep: true,
    },
    "storyStore.activePhoto": {
      handler(newPhotoData) {
        if (newPhotoData && this.map) {
          this.hideStoriesMarkers();
          this.map.flyTo({
            center: [newPhotoData.longitude, newPhotoData.latitude],
            zoom: 12,
            duration: 2000,
          });
        } else if (this.storiesMarkers && this.map) {
          this.showStoriesMarkers();
        }
      },
    },
  },
  mounted() {
    mapboxgl.accessToken = this.mapOptions.token;
    this.map = new mapboxgl.Map({
      container: "map-container",
      style: this.mapOptions.style, // stylesheet location
      center: this.mapOptions.center, // starting position [lng, lat]
      zoom: this.mapOptions.zoom, // starting zoom
    });
  },
};
</script>

<template>
  <div class="map">
    <div id="map-container" class="map__container"></div>
  </div>
</template>

<style lang="scss">
@use "../scss/vars" as *;
@use "../scss/mixins" as *;

.map {
  position: absolute;
  z-index: 0;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  &__container {
    height: 100vh;
  }

  &__marker {
    pointer-events: none;

    &.loaded {
      // cursor: pointer;

      .map__marker-circle {
        transform: scale(1);
      }
    }

    &.hide {
      pointer-events: none;

      .map__marker-circle {
        opacity: 0;
        transform: scale(0.8);
      }
    }

    &-circle {
      position: relative;
      border-radius: 50%;
      padding: 6px;
      background-image: linear-gradient(
        to right top,
        #ffc600 20%,
        #ff0040,
        #e600cc 80%
      );
      transition: opacity 300ms $easing, transform 600ms $easing,
        box-shadow 300ms $easing;

      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      transform: scale(0);
      opacity: 1;

      &:before {
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

      &:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      }
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

  &__story-marker {
    pointer-events: none;

    &.active {
      .map__story-marker-circle {
        opacity: 1;
        transform: scale(1);
      }
    }

    &-circle {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 600ms $easing;
      opacity: 0;
      transform: scale(0);

      // &:hover {
      //   transform: scale(1.1);
      //   box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      // }

      // &--active {
      //   background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
      //   transform: scale(1.2);
      //   box-shadow: 0 4px 16px rgba(255, 107, 107, 0.4);
      // }
    }
  }
}

.mapboxgl-control-container {
  display: none !important;
}
</style>
