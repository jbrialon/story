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
        zoom: 4,
        bounds: new mapboxgl.LngLatBounds(),
      },
      storyMarkers: [],
      mediaMarkers: [],
      storyPaths: [],
      boundsPaths: [],
    };
  },
  computed: {
    storiesData() {
      return this.storyStore.storyData;
    },
    currentStoryIndex() {
      return this.storyStore.currentStoryIndex;
    },
  },
  watch: {
    "storyStore.stories": {
      handler(stories) {
        if (stories && stories.length > 0) {
          stories.forEach((story, index) => {
            if (story.location) {
              this.createStoryMarker(story, index);
            }
          });
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
              // when a story is loaded, create the media markers
              this.createMediaMarkers(index);
            }
          }
        });
      },
      deep: true,
    },
    "storyStore.currentStoryIndex": {
      handler(currentStoryIndex) {
        const storyData = this.storiesData[currentStoryIndex];
        const stats = storyData?.stats;

        if (stats && stats.length > 0) {
          // if we have stats, show the media markers and hide the story markers
          this.showMediaMarkers();
          this.hideStoryMarkers();
        } else {
          // if we don't have stats, hide the media markers and show the story markers
          this.hideMediaMarkers();
          this.showStoryMarkers();
        }
      },
      deep: true,
    },
    "storyStore.mediaIndex": {
      handler(mediaIndex) {
        const storyData = this.storiesData[this.currentStoryIndex];
        const stats = storyData?.stats;
        const media = storyData?.medias[mediaIndex[this.currentStoryIndex]];

        if (stats && stats.length > 0) {
          if (mediaIndex[this.currentStoryIndex] === 0) {
            this.showStoryPath();
          } else {
            if (media?.exif.GPS) {
              this.map.flyTo({
                center: [media.exif.GPS.longitude, media.exif.GPS.latitude],
                zoom: 12,
                duration: 2000,
              });

              // marker.element.classList.add("active");
            }
          }
        } else {
          this.hideStoryPath();
        }
        this.setMediaMarkerActive(mediaIndex[this.currentStoryIndex]);
      },
      deep: true,
    },
    "storyStore.loadingTransitionComplete": {
      handler(complete) {
        // when loading transition is complete we trigger the reveal animation
        if (complete) {
          this.fitBounds();
        }
      },
      immediate: true,
    },
  },
  methods: {
    getMediaUrl(story) {
      return getMediaUrl(story.id, story.cover);
    },
    fitBounds() {
      if (this.storyMarkers.length === 0) return;

      this.map.fitBounds(this.mapOptions.bounds, {
        padding: { top: 50, bottom: 50, left: 600, right: 100 }, // hardcoded values for now
        duration: 1000,
        maxZoom: 15,
      });
    },
    // ------------------------------------------------------------
    // Story markers management (Main Markers for the stories)
    // ------------------------------------------------------------
    createStoryMarker(story, index) {
      const markerElement = document.createElement("div");
      const cover = this.getMediaUrl(story);
      markerElement.className = "map__marker";
      markerElement.innerHTML = `
        <div class="map__marker-circle">
          <img class="map__marker-img" src="${cover}" alt="${story.name}" />
        </div>
      `;

      markerElement.addEventListener("click", () => {
        this.storyStore.setCurrentStoryIndex(index);
      });

      const marker = new mapboxgl.Marker(markerElement);
      const coord = new mapboxgl.LngLat(
        story.location.longitude,
        story.location.latitude
      );
      marker.setLngLat(coord);
      marker.addTo(this.map);

      this.storyMarkers.push({
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
    showStoryMarkers() {
      this.storyMarkers.forEach((marker) => {
        marker.element.classList.remove("hide");
      });

      this.fitBounds();
    },
    hideStoryMarkers() {
      this.storyMarkers.forEach((marker) => {
        marker.element.classList.add("hide");
      });
    },
    getStoryMarker(storyIndex) {
      return this.storyMarkers.find(
        (marker) => marker.storyIndex === storyIndex
      );
    },
    // ------------------------------------------------------------
    // Media markers management
    // ------------------------------------------------------------
    createMediaMarkers(storyIndex) {
      const story = this.storiesData[storyIndex];
      if (this.mediaMarkers[storyIndex]) return;

      this.mediaMarkers[storyIndex] = [];

      story.medias.forEach((media, index) => {
        if (!media.exif.GPS) return;
        const markerElement = document.createElement("div");
        markerElement.className = "map__story-marker hide";
        markerElement.innerHTML = `
        <div class="map__story-marker-circle"></div>`;

        markerElement.addEventListener("click", () => {
          this.storyStore.setMediaIndex(index);
        });

        const marker = new mapboxgl.Marker(markerElement);
        const coord = new mapboxgl.LngLat(
          media.exif.GPS.longitude,
          media.exif.GPS.latitude
        );
        marker.setLngLat(coord);
        marker.addTo(this.map);

        this.mediaMarkers[storyIndex].push({
          marker: marker,
          element: markerElement,
          index: index,
        });
      });
      this.createStoryPath(storyIndex);
    },
    showMediaMarkers() {
      this.mediaMarkers.forEach((markers, index) => {
        if (index === this.currentStoryIndex) {
          markers?.forEach((marker) => {
            marker.element.classList.remove("hide");
          });
        } else {
          markers?.forEach((marker) => {
            marker.element.classList.add("hide");
          });
        }
      });
    },
    hideMediaMarkers() {
      this.mediaMarkers.forEach((markers) => {
        markers?.forEach((marker) => {
          marker.element.classList.add("hide");
        });
      });
    },
    setMediaMarkerActive(mediaIndex) {
      this.mediaMarkers[this.currentStoryIndex]?.forEach((marker) => {
        if (marker.index !== mediaIndex) {
          marker.element.classList.remove("active");
        } else {
          marker.element.classList.add("active");
        }
      });
    },
    // ------------------------------------------------------------
    // Paths management
    // ------------------------------------------------------------
    createStoryPath(storyIndex) {
      const story = this.storiesData[storyIndex];
      const stats = story.stats;

      this.boundsPaths[storyIndex] = new mapboxgl.LngLatBounds();

      // Add path to map
      if (stats.length > 0) {
        this.storyPaths[storyIndex] = new Array(stats.length).fill();

        stats.forEach((stat, statIndex) => {
          const segments = stat.path.tracks[0].segments[0];
          const coordinates = segments.map((segment) => [
            segment.lon,
            segment.lat,
          ]);

          // Add the line source
          this.map.addSource(`path-${storyIndex}-${statIndex}`, {
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
            id: `path-${storyIndex}-${statIndex}`,
            type: "line",
            source: `path-${storyIndex}-${statIndex}`,
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#667eea",
              "line-width": 3,
              "line-opacity": 0,
              "line-dasharray": [2, 2],
            },
          });

          this.map.setLayoutProperty(
            `path-${storyIndex}-${statIndex}`,
            "visibility",
            "none"
          );

          this.storyPaths[storyIndex][statIndex] = {
            id: `path-${storyIndex}-${statIndex}`,
            index: statIndex,
            storyIndex: storyIndex,
          };

          const step = Math.max(Math.floor(coordinates.length / 2), 1);
          for (let i = 0; i < coordinates.length; i += step) {
            this.boundsPaths[storyIndex].extend(coordinates[i]);
          }
        });
      }
    },
    showStoryPath() {
      this.storyPaths.forEach((paths, index) => {
        if (index === this.currentStoryIndex) {
          paths?.forEach((path) => {
            if (this.map.getLayer(path.id)) {
              this.map.setLayoutProperty(path.id, "visibility", "visible");
              this.map.setPaintProperty(path.id, "line-opacity", 1);

              this.map.fitBounds(this.boundsPaths[index], {
                padding: { top: 50, bottom: 50, left: 600, right: 100 }, // hardcoded values for now
                duration: 1000,
                maxZoom: 15,
              });
            }
          });
        } else {
          paths?.forEach((path) => {
            if (this.map.getLayer(path.id)) {
              // this.map.setLayoutProperty(path.id, "visibility", "none");
              this.map.setPaintProperty(path.id, "line-opacity", 0);
            }
          });
        }
      });
    },
    hideStoryPath() {
      this.storyPaths.forEach((paths) => {
        paths?.forEach((path) => {
          if (this.map.getLayer(path.id)) {
            // this.map.setLayoutProperty(path.id, "visibility", "none");
            this.map.setPaintProperty(path.id, "line-opacity", 0);
          }
        });
      });
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

    &:hover {
      .map__marker-circle {
        transform: scale(1.1);
      }
    }

    &.loaded {
      pointer-events: auto;
      cursor: pointer;

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
    pointer-events: auto;
    cursor: pointer;

    &:hover {
      .map__story-marker-circle {
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      }
    }

    &.hide {
      pointer-events: none;
      .map__story-marker-circle {
        opacity: 0;
        transform: scale(0);
      }
    }

    &.active {
      .map__story-marker-circle {
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
        transform: scale(1.2);
        box-shadow: 0 4px 16px rgba(255, 107, 107, 0.4);
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
      transition: all 300ms $easing;
      opacity: 1;
      transform: scale(1);
    }
  }
}

.mapboxgl-control-container {
  display: none !important;
}
</style>
