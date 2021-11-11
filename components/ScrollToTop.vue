<template>
  <div v-if="isVisible" className="scroll-top">
    <a href="#top">
      <div class="icon i-mdi-arrow-up" font-size="large" />
    </a>
  </div>
</template>

<script setup>
const isVisible = useState('isVisible', false)

const toggleVisibility = () => window.pageYOffset > 500 ? isVisible.value = true : isVisible.value = false

onMounted(() => {
  window.addEventListener('scroll', toggleVisibility)
})

onUnmounted(() => {
  window.removeEventListener('scroll', toggleVisibility)
})

</script>

<style>
.scroll-top {
  position: fixed;
  bottom: 2em;
  right: 4em;
  background-color: transparent;
}

.i-mdi-arrow-up {
  width: 35px;
  height: 35px;
}

@media (max-width: 900px) {
  .scroll-top {
    display: none;
  }
}

</style>
