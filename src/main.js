import "normalize.css";
import "mapbox-gl/dist/mapbox-gl.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { initializeViewport } from "./utils/sizeUtils.js";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.mount("#app");

// Initialize viewport dimensions
initializeViewport();
