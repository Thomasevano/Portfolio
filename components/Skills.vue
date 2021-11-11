<template>
  <section id="skills" class="section skills">
    <h2 class="section__title">
      Skills
    </h2>
    <ul class="skills__list">
      <li v-for="skill in skills" :key="skill.id" class="skills__list-item btn btn--plain">
        {{ skill.name }}
      </li>
    </ul>
  </section>
</template>

<script setup>
const props = defineProps({
  skills: Array,
})
</script>

<style>
.skills__list {
  max-width: 450px;
  width: 95%;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.skills__list-item {
  margin: 0.5em;
}

</style>
