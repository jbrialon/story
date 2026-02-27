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
    this.batches = {};
  }

  load(assets, batch) {
    if (!Array.isArray(assets)) {
      return Promise.reject(
        "Preloader.load(assets) - assets should be an array"
      );
    }
    if (batch) {
      this.batches[batch] = { total: assets.length, loaded: 0 };
    }
    return Promise.all(
      assets.map((src) => {
        if (done[src]) {
          if (batch) {
            this.batches[batch].loaded++;
          }
          return Promise.resolve();
        }
        if (src.includes(".mp4")) {
          return this.loadVideo(src, batch);
        } else {
          return this.loadImage(src, batch);
        }
      })
    );
  }

  getEventDetail(src, type, batch) {
    const detail = { src, type };
    if (batch && this.batches[batch]) {
      this.batches[batch].loaded++;
      detail.batch = batch;
      detail.loaded = this.batches[batch].loaded;
      detail.total = this.batches[batch].total;
    }
    return detail;
  }

  loadVideo(src, batch) {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = () => {
        video.currentTime = 0.1;
      };

      video.oncanplay = () => {
        if (done[src]) return;
        done[src] = true;
        this.dispatchEvent(
          new CustomEvent("loaded", {
            detail: this.getEventDetail(src, "video", batch),
          })
        );
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

  loadImage(src, batch) {
    return new Promise((resolve) => {
      let image = new Image();
      image.onload = () => {
        done[src] = true;
        this.dispatchEvent(
          new CustomEvent("loaded", {
            detail: this.getEventDetail(src, "photo", batch),
          })
        );
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
}

const preloader = new Preloader();
export default preloader;
