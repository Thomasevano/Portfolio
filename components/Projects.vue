<template>
  <section id="projects" class="section projects">
    <h2 class="section__title">
      Projects
    </h2>
    <div class="projects__grid">
      <ProjectContainer v-for="project in projects" :key="project.id" :project="project" />
    </div>
  </section>
</template>

<script setup>
const prop = defineProps({
  projects: Array,
})
</script>

<style>
.projects__grid {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(18em, 1fr));
  grid-gap: 2em;
}

</style>
