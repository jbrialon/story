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
      storyMarkers: [],
    };
  },
  methods: {
    getMediaUrl(story) {
      return getMediaUrl(story.id, story.cover);
    },
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
        story: story,
      });

      this.mapOptions.bounds.extend([
        story.location.longitude,
        story.location.latitude,
      ]);

      return marker;
    },
    hideStoryMarkers() {
      this.storyMarkers.forEach((marker) => {
        marker.element.classList.add("hide");
      });
    },
    showStoryMarkers() {
      this.storyMarkers.forEach((marker) => {
        marker.element.classList.remove("hide");
      });
      this.fitBounds();
    },
    fitBounds() {
      if (this.storyMarkers.length === 0) return;

      this.map.fitBounds(this.mapOptions.bounds, {
        padding: { top: 50, bottom: 50, left: 600, right: 100 }, // hardcoded values for now
        duration: 1000,
        maxZoom: 15,
      });
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
          this.fitBounds();
        }
      },
      immediate: true,
    },
    "storyStore.storyData": {
      handler(storyData) {
        if (storyData && storyData.length > 0) {
          storyData.forEach((story, index) => {
            if (story && story.medias && story.medias.length > 0) {
              story.medias.forEach((media) => {
                if (media.exif && media.exif.GPS) {
                  console.log(
                    media.exif.GPS.latitude,
                    media.exif.GPS.longitude
                  );
                }
              });
            }
          });
        }
      },
      deep: true,
      immediate: true,
    },
    "storyStore.activePhoto": {
      handler(newPhotoData) {
        if (newPhotoData && this.map) {
          this.hideStoryMarkers();
          this.map.flyTo({
            center: [newPhotoData.longitude, newPhotoData.latitude],
            zoom: 12,
            duration: 2000,
          });
        } else if (this.storyMarkers && this.map) {
          this.showStoryMarkers();
        }
      },
      immediate: true,
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
    cursor: pointer;
    transition: opacity 300ms $easing;

    &.hide {
      opacity: 0;
      transform: scale(0.8);
      pointer-events: none;
    }

    &-circle {
      position: relative;
      border-radius: 50%;
      padding: 6px;
      transition: all 300ms $easing;
      background-image: linear-gradient(
        to right top,
        #ffc600 20%,
        #ff0040,
        #e600cc 80%
      );
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

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
}

.mapboxgl-control-container {
  display: none !important;
}
</style>
