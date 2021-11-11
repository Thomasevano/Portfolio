<template>
  <section id="contact" class="section contact center">
    <h2 class="section__title">
      Contact
    </h2>
    <a :href="`mailto:${mail}`">
      <span type="button" class="btn btn--outline">
        Email me
      </span>
    </a>
  </section>
</template>

<script setup>
const props = defineProps({
  mail: String,
})

</script>

<style>
.contact {
  flex-direction: column;
}
</style>
