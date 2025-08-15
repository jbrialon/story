/* global
Image
*/
const done = {};
export default {
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
        // console.log("preloading", src);
        if (src.includes(".mp4")) {
          return this.loadVideo(src);
        } else {
          return this.loadImage(src);
        }
      })
    );
  },
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
  },
  loadImage(src) {
    return new Promise((resolve) => {
      let image = new Image();
      image.onload = function () {
        resolve();
      };
      image.onerror = function (err) {
        console.error("Could not preload", src, err);
        resolve(); // resolve anyway
      };
      image.src = src;
      done[src] = true;
    });
  },
};
