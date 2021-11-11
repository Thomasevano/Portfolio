<template>
  <div class="project">
    <h3>{{ project.name }}</h3>

    <p class="project__description">
      {{ project.description }}
    </p>
    <ul class="project__stack">
      <li v-for="skill in project.skills" :key="skill" class="project__stack-item">
        {{ skill.name }}
      </li>
    </ul>

    <a
      :href="project.sourceCodeLink"
      aria-label="source code"
      class="link link--icon"
    >
      <div class="icon i-mdi-github"></div>

    </a>

    <a
      :href="project.liveViewLink"
      aria-label="live preview"
      class="link link--icon"
    >
      <div class="icon i-mdi-launch"></div>
    </a>
  </div>
</template>

<script setup>

const props = defineProps({
  project: Object,
})
</script>

<style>
.project {
  padding: 2em;
  margin: 0 auto;
  text-align: center;
  box-shadow: var(--shadow);
  transition: transform 0.2s linear;
}

.project:hover {
  transform: translateY(-7px);
}

.project__description {
  margin-top: 1em;
}

.project__stack {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin: 1.2em 0;
}

.project__stack-item {
  margin: 0.5em;
  font-weight: 500;
  font-size: 0.8rem;
  color: var(--clr-fg-alt);
}

.project .link--icon {
  margin-left: 0.5em;
}

</style>
