<template>
  <div class="goo-container">
    <div class="controls">
      <button @click="playAnimations" :disabled="isPlaying">Play</button>
      <button @click="pauseAnimations" :disabled="!isPlaying">Pause</button>
    </div>

    <svg
      ref="svgRef"
      id="organic-blob"
      width="300"
      height="300"
      xmlns="http://www.w3.org/2000/svg"
      filter="url(#goo)"
      fill="royalblue"
    >
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
      </defs>
      <g>
        <circle r="100" cy="145" cx="150">
          <animateTransform
            ref="anim1"
            attributeType="xml"
            attributeName="transform"
            type="rotate"
            from="0 145 150"
            to="360 145 150"
            dur="1s"
            repeatCount="indefinite"
            begin="0s"
          />
          <animateTransform
            ref="move1"
            attributeType="xml"
            attributeName="transform"
            type="translate"
            from="0 0"
            to="0 0"
            dur="0.8s"
            begin="indefinite"
            fill="freeze"
            additive="sum"
          />
        </circle>
        <circle r="100" cy="155" cx="150">
          <animateTransform
            ref="anim2"
            attributeType="xml"
            attributeName="transform"
            type="rotate"
            from="360 155 150"
            to="0 155 150"
            dur="2s"
            repeatCount="indefinite"
            begin="0s"
          />
          <animateTransform
            ref="move2"
            attributeType="xml"
            attributeName="transform"
            type="translate"
            from="0 0"
            to="0 0"
            dur="0.8s"
            begin="indefinite"
            fill="freeze"
            additive="sum"
          />
        </circle>
        <circle r="100" cy="150" cx="145">
          <animateTransform
            ref="anim3"
            attributeType="xml"
            attributeName="transform"
            type="rotate"
            from="0 150 145"
            to="360 150 145"
            dur="3s"
            repeatCount="indefinite"
            begin="0s"
          />
          <animateTransform
            ref="move3"
            attributeType="xml"
            attributeName="transform"
            type="translate"
            from="0 0"
            to="0 0"
            dur="0.8s"
            begin="indefinite"
            fill="freeze"
            additive="sum"
          />
        </circle>
        <circle r="100" cy="150" cx="155">
          <animateTransform
            ref="anim4"
            attributeType="xml"
            attributeName="transform"
            type="rotate"
            from="360 150 155"
            to="0 150 155"
            dur="2.5s"
            repeatCount="indefinite"
            begin="0s"
          />
          <animateTransform
            ref="move4"
            attributeType="xml"
            attributeName="transform"
            type="translate"
            from="0 0"
            to="0 0"
            dur="0.8s"
            begin="indefinite"
            fill="freeze"
            additive="sum"
          />
        </circle>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const svgRef = ref(null);
const isPlaying = ref(true);

// Get all animation elements
const getRotations = () => {
  if (!svgRef.value) return [];
  return svgRef.value.querySelectorAll('animateTransform[type="rotate"]');
};

const getMoves = () => {
  if (!svgRef.value) return [];
  return svgRef.value.querySelectorAll('animateTransform[type="translate"]');
};

const playAnimations = () => {
  const rotations = getRotations();
  const moves = getMoves();

  // Start rotation animations
  rotations.forEach((anim) => {
    anim.beginElement();
  });

  // Animate circles back to their original positions
  moves.forEach((move, index) => {
    const circle = move.parentElement;
    const originalCx = parseFloat(circle.getAttribute("cx"));
    const originalCy = parseFloat(circle.getAttribute("cy"));
    const centerX = 150;
    const centerY = 150;

    // Calculate the offset from center
    const offsetX = originalCx - centerX;
    const offsetY = originalCy - centerY;

    // Animate back to original position
    move.setAttribute("from", `${-offsetX} ${-offsetY}`);
    move.setAttribute("to", "0 0");
    move.beginElement();
  });

  isPlaying.value = true;
};

const pauseAnimations = () => {
  const rotations = getRotations();
  const moves = getMoves();

  // Stop rotation animations
  rotations.forEach((anim) => {
    anim.endElement();
  });

  // Animate circles to center
  moves.forEach((move, index) => {
    const circle = move.parentElement;
    const originalCx = parseFloat(circle.getAttribute("cx"));
    const originalCy = parseFloat(circle.getAttribute("cy"));
    const centerX = 150;
    const centerY = 150;

    // Calculate the offset to center
    const offsetX = centerX - originalCx;
    const offsetY = centerY - originalCy;

    // Animate to center
    move.setAttribute("from", "0 0");
    move.setAttribute("to", `${offsetX} ${offsetY}`);
    move.beginElement();
  });

  isPlaying.value = false;
};

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
