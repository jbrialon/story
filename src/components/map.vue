<script>
import mapboxgl from "mapbox-gl";
import { useStoryStore } from "../stores/storyStore.js";

export default {
  name: "Map",
  props: {
    stories: {
      type: Array,
      required: true,
    },
  },
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
        center: [100.9925, 15.87],
        zoom: 3,
      },
      markers: [],
    };
  },

  methods: {
    createCustomMarker(story) {
      const markerElement = document.createElement("div");
      markerElement.className = "map__marker";
      markerElement.innerHTML = `
        <div class="map__marker-circle">
          <span class="map__marker-number">${story.id || "•"}</span>
        </div>
      `;

      markerElement.addEventListener("click", () => {
        this.$emit("story-selected", story);
        this.markers.forEach((marker) => {
          const circle = marker.element.querySelector(".map__marker-circle");
          if (circle) {
            circle.classList.toggle(
              "map__marker-circle--active",
              marker.story.id === story.id
            );
          }
        });
      });

      const marker = new mapboxgl.Marker(markerElement);
      const coord = new mapboxgl.LngLat(
        story.location.longitude,
        story.location.latitude
      );
      marker.setLngLat(coord);
      marker.addTo(this.map);

      this.markers.push({
        marker: marker,
        element: markerElement,
        story: story,
      });

      return marker;
    },
    clearMarkers() {
      this.markers.forEach(({ marker }) => {
        marker.remove();
      });
      this.markers = [];
    },
  },
  watch: {
    stories(value) {
      if (value) {
        this.clearMarkers();

        value.forEach((story) => {
          if (story.location) {
            this.createCustomMarker(story);
          }
        });
      }
    },
    "storyStore.activePhoto": {
      handler(newPhotoData) {
        if (newPhotoData && this.map) {
          this.map.flyTo({
            center: [newPhotoData.longitude, newPhotoData.latitude],
            zoom: 12,
            duration: 2000,
          });
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
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      }

      &--active {
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
        transform: scale(1.2);
        box-shadow: 0 4px 16px rgba(255, 107, 107, 0.4);
      }
    }

    &-number {
      display: none;
      color: white;
      font-weight: bold;
      font-size: 12px;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }
  }
}

.mapboxgl-control-container {
  display: none !important;
}
</style>
