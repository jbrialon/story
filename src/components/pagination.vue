<template>
  <div class="pagination" :style="margin">
    <div class="pagination__bullet" v-for="index in medias.length" :key="index">
      <div class="pagination__bullet-progress" ref="progress"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Pagination",
  props: {
    medias: {
      type: Array,
      required: true,
    },
    tl: {
      type: Object,
      required: true,
    },
    nextMedia: {
      type: Function,
      required: true,
    },
  },
  computed: {
    margin() {
      const value = this.medias.length;
      const margin = Math.max(
        4,
        Math.min(8, value < 20 ? 8 : value < 30 ? 6 : 4)
      );
      return `--bullet-margin: ${margin}px`;
    },
  },
  mounted() {
    this.medias.forEach((media, index) => {
      let duration = media.type === "video" ? media.duration : 5;

      // Proportionally increase duration for long descriptions for photos
      if (media.type !== "video") {
        const descriptionLength = media.exif.description?.length || 0;
        if (descriptionLength > 100) {
          const extraSeconds = Math.ceil((descriptionLength - 100) / 50); // +1s for every 50 chars above 100
          duration += extraSeconds;
        }
      }
      const label = `bullet-${index}`;
      this.tl.addLabel(label).to(this.$refs.progress[index], {
        width: "100%",
        duration,
        ease: "linear",
        onComplete: () => this.nextMedia(),
      });
    });
  },
  beforeUnmount() {
    this.tl.clear();
    this.tl.kill();
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
  max-width: calc(100% - (10px + var(--bullet-margin)));
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  z-index: $z-pagination;
  gap: var(--bullet-margin);

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

    margin: 0;

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
