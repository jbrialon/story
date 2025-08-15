<template>
  <div class="goo-container">
    <div class="controls">
      <button @click="playAnimations" :disabled="isPlaying">Play</button>
      <button @click="pauseAnimations" :disabled="!isPlaying">Pause</button>
    </div>

    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="800">
      <defs>
        <filter id="goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
        <filter id="goo-no-comp">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
            result="goo"
          />
        </filter>
      </defs>
    </svg>
  </div>
</template>

<script setup>
onMounted(() => {
  // Start with animations playing
});
</script>

<style lang="scss" scoped>
.goo-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 1000;
}

.controls {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: auto;
  display: flex;
  gap: 10px;

  button {
    padding: 8px 16px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;

    &:hover:not(:disabled) {
      background: #0056b3;
    }

    &:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }
  }
}

#organic-blob {
  pointer-events: none;
}
</style>
