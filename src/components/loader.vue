<template>
  <div class="loader">
    <template v-for="(picture, index) in medias" :key="index">
      <img
        class="loader__picture"
        :src="picture"
        :style="{
          '--random-rotation': Math.floor(Math.random() * 61) - 30 + 'deg',
          '--random-scale': 0.8 + Math.random() * 0.4,
        }"
      />
    </template>
  </div>
</template>

<script>
import preloader from "../utils/Preloader.js";

export default {
  name: "Loader",
  data() {
    return {
      medias: [],
    };
  },
  mounted() {
    preloader.on("loaded", (e) => {
      const src = e.detail.src;
      if (src.includes(".jpg") && Math.random() >= 0.5) {
        this.medias.push(e.detail.src);
      }
    });
  },
  unmounted() {
    preloader.off("loaded");
  },
};
</script>

<style scoped lang="scss">
@use "../scss/mixins" as *;

.loader {
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: white;
  z-index: 100;

  @include small-only {
    width: var(--vw);
    height: var(--vh);
  }

  &:after {
    position: absolute;
    content: "";
    display: block;
    height: rem-calc(30px);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    aspect-ratio: 6;
    --c: #0000 64%, #e5e5e5 66% 98%, #0000 101%;
    background: radial-gradient(35% 146% at 50% 159%, var(--c)) 0 0,
      radial-gradient(35% 146% at 50% -59%, var(--c)) 25% 100%;
    background-size: calc(100% / 3) 50%;
    background-repeat: repeat-x;
    animation: l1 1s infinite linear;

    @keyframes l1 {
      to {
        background-position: 50% 0, 75% 100%;
      }
    }
  }

  &__picture {
    position: absolute;
    width: 170px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(var(--random-rotation, 15deg))
      scale(var(--random-scale, 1));
    border-radius: 10px;
  }
}
</style>
