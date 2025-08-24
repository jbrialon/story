<template>
  <div class="pagination">
    <div class="pagination__bullet" v-for="index in medias.length" :key="index">
      <div class="pagination__bullet-progress" ref="progress"></div>
    </div>
  </div>
</template>

<script>
import { useStoryStore } from "../stores/storyStore.js";

export default {
  name: "Pagination",
  setup() {
    const storyStore = useStoryStore();
    return { storyStore };
  },
  props: {
    medias: {
      type: Array,
      required: true,
    },
    currentMediaIndex: {
      type: Number,
      required: true,
    },
    tl: {
      type: Object,
      required: true,
    },
  },
  mounted() {
    // this.tl.clear();
    this.medias.forEach((media, index) => {
      const duration = media.type === "video" ? media.duration : 5;
      this.tl
        .to(this.$refs.progress[index], {
          width: "100%",
          duration,
          ease: "linear",
          onComplete: () => {
            this.storyStore.nextMedia();
            if (index === this.medias.length - 1) {
              console.log("we are on the last media, pausing");
              this.tl.pause();
            }
          },
        })
        .addLabel(`bullet-${index}`);
    });
  },
};
</script>

<style lang="scss" scoped>
@use "../scss/vars" as *;
@use "../scss/mixins" as *;

.pagination {
  position: absolute;
  left: 0px;
  right: 0px;
  top: 10px;
  bottom: unset;
  max-width: calc(100% - 10px);
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  z-index: $z-pagination;

  &__bullet {
    width: 100%;
    flex-shrink: 10;
    border-radius: 999px;
    height: 3px;
    background: rgba(255, 255, 255, 0.35);
    position: relative;
    overflow: hidden;
    box-shadow: 0 0 1px #00000059;
    opacity: 1;
    margin: 0 4px;

    &:first-child {
      .pagination__bullet-progress {
        width: 100%;
      }
    }
  }

  &__bullet-progress {
    position: absolute;
    background: #fff;
    left: 0;
    top: 0;
    height: 100%;
    width: 0;

    &.viewed {
      background: #000;
    }
  }
}
</style>
