<script setup lang="ts">
const color = useColorMode()

function toggleDark() {
  color.preference = color.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <button class="!outline-none" @click="toggleDark">
    <div class="dark:i-carbon-moon i-carbon-sun" />
    <!-- <script setup lang='ts'>
const isDark = useDark({
  valueDark: 'dark',
  valueLight: 'light',
})
const toggleDark = useToggle(isDark)
</script>

<template>
  <button class="btn btn--icon nav__theme" @click="toggleDark()">
    <div v-if="isDark" class="icon i-mdi-brightness-2" />
    <div v-else class="icon i-mdi-white-balance-sunny" /> -->
  </button>
</template>
