import "normalize.css";
import "mapbox-gl/dist/mapbox-gl.css";

import { createApp } from "vue";
import App from "./App.vue";

createApp(App).mount("#app");

const viewportWidth = window.innerWidth;
const viewportHeight = window.innerHeight;

// Set the value in a custom property to be used in CSS
document.documentElement.style.setProperty("--vw", `${viewportWidth}px`);
document.documentElement.style.setProperty("--vh", `${viewportHeight}px`);
