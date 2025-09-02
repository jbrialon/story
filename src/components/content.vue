<template>
  <div class="content">
    <p class="content__title" v-if="exif.title">
      {{ exif.title }}
    </p>
    <p class="content__description" v-if="exif.description">
      {{ exif.description }}
    </p>
  </div>
</template>

<script>
export default {
  props: {
    exif: {
      type: Object,
      required: true,
    },
  },
};
</script>
<style lang="scss" scoped>
@use "../scss/vars" as *;
@use "../scss/mixins" as *;
.content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  &__title,
  &__description {
    position: absolute;
    z-index: $z-content;
    opacity: 1;
    width: fit-content;
    color: #fff;
    font-size: rem-calc(14px);
    font-weight: 700;
    line-height: 1.4;
    padding: rem-calc(10px) rem-calc(12px);
    margin: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(3px);
    border-radius: rem-calc(10px);
  }

  &__title {
    top: rem-calc(85px);
    left: 50%;
    transform: translateX(-50%);
  }

  &__description {
    bottom: rem-calc(45px);
    left: rem-calc(25px);
    right: rem-calc(25px);
  }
}
</style>
