import "normalize.css";
import "mapbox-gl/dist/mapbox-gl.css";

import { createApp } from "vue";
import App from "./App.vue";
import { initializeViewport } from "./utils/sizeUtils.js";

createApp(App).mount("#app");

// Initialize viewport dimensions
initializeViewport();
