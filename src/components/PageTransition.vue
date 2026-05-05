<template>
  <transition :name="transitionName" mode="out-in">
    <slot></slot>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  name?: 'fade' | 'slide' | 'slide-up' | 'slide-down' | 'zoom' | 'flip' | 'bounce'
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  name: 'fade',
  duration: 300
})

const transitionName = computed(() => `page-${props.name}`)
</script>

<style>
/* Fade 过渡 */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.3s ease;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}

/* Slide 左右滑动 */
.page-slide-enter-active,
.page-slide-leave-active {
  transition: all 0.3s ease-out;
}

.page-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.page-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Slide Up 向上滑动 */
.page-slide-up-enter-active,
.page-slide-up-leave-active {
  transition: all 0.3s ease-out;
}

.page-slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.page-slide-up-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

/* Slide Down 向下滑动 */
.page-slide-down-enter-active,
.page-slide-down-leave-active {
  transition: all 0.3s ease-out;
}

.page-slide-down-enter-from {
  opacity: 0;
  transform: translateY(-30px);
}

.page-slide-down-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* Zoom 缩放 */
.page-zoom-enter-active,
.page-zoom-leave-active {
  transition: all 0.3s ease;
}

.page-zoom-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.page-zoom-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

/* Flip 翻转 */
.page-flip-enter-active,
.page-flip-leave-active {
  transition: all 0.4s ease;
  perspective: 1200px;
}

.page-flip-enter-from {
  opacity: 0;
  transform: rotateY(-90deg);
}

.page-flip-leave-to {
  opacity: 0;
  transform: rotateY(90deg);
}

/* Bounce 弹跳 */
.page-bounce-enter-active {
  animation: bounceIn 0.4s ease;
}

.page-bounce-leave-active {
  animation: bounceOut 0.3s ease;
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes bounceOut {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  25% {
    transform: scale(0.95);
  }
  100% {
    opacity: 0;
    transform: scale(0.3);
  }
}
</style>
