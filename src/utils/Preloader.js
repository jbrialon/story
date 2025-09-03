/* global
Image
*/
const done = {};

class Preloader extends EventTarget {
  constructor() {
    if (Preloader.instance) {
      return Preloader.instance;
    }
    super();
    Preloader.instance = this;
  }

  load(assets) {
    if (!Array.isArray(assets)) {
      return Promise.reject(
        "Preloader.load(assets) - assets should be an array"
      );
    }
    return Promise.all(
      assets.map((src) => {
        if (done[src]) {
          return Promise.resolve();
        }
        if (src.includes(".mp4")) {
          return this.loadVideo(src);
        } else {
          return this.loadImage(src);
        }
      })
    );
  }

  loadVideo(src) {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = () => {
        video.currentTime = 0.1;
      };

      video.oncanplay = () => {
        done[src] = true;
        this.dispatchEvent(new CustomEvent("loaded", { detail: {src} }));
        resolve();
        video.remove();
      };

      video.onerror = (err) => {
        console.error("Could not preload video", src, err);
        done[src] = true;
        resolve(); // resolve anyway
        video.remove();
      };

      video.src = src;
    });
  }

  loadImage(src) {
    return new Promise((resolve) => {
      let image = new Image();
      image.onload = () => {
        done[src] = true;
        this.dispatchEvent(new CustomEvent("loaded", { detail: {src} }));
        resolve();
      };
      image.onerror = (err) => {
        console.error("Could not preload", src, err);
        done[src] = true;
        resolve(); // resolve anyway
      };
      image.src = src;
    });
  }

  on(eventName, callback) {
    this.addEventListener(eventName, callback);
  }

  off(eventName, callback) {
    this.removeEventListener(eventName, callback);
  }
};

const preloader = new Preloader();
export default preloader;