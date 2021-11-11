<template>
  <div class="about center">
    <h1 v-if="about.name">
      Hi, I am <span class="about__name">{{ about.name }}.</span>
    </h1>

    <h2 v-if="about.role" class="about__role">
      A {{ about.role }}.
    </h2>
    <p class="about__desc">
      {{ about.description }}
    </p>

    <div class="about__contact center">
      <a v-if="about.resumeLink" :href="about.resumeLink">
        <span type="button" class="btn btn--outline">
          Resume
        </span>
      </a>

      <a
        v-if="about.social.github"
        :href="about.social.github"
        aria-label="github"
        class="link link--icon"
      >
        <div class="icon i-mdi-github"></div>
      </a>
      <a
        v-if="about.social.linkedin"
        :href="about.social.linkedin"
        aria-label="linkedin"
        class="link link--icon"
      >
        <div class="icon i-mdi-linkedin"></div>
      </a>
      <a
        v-if="about.social.twitter"
        :href="about.social.twitter"
        aria-label="twitter"
        class="link link--icon"
      >
        <div class="icon i-mdi-twitter"></div>
      </a>
      <a
        v-if="about.social.twitch"
        :href="about.social.twitch"
        aria-label="twitch"
        class="link link--icon"
      >
        <div class="icon i-mdi-twitch"></div>
      </a>
      <a
        v-if="about.social.youtube"
        :href="about.social.youtube"
        aria-label="youtube"
        class="link link--icon"
      >
        <div class="icon i-mdi-youtube"></div>
      </a>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  about: Object,
})
</script>

<style>

.about {
  flex-direction: column;
  margin-top: 3em;
}

.about__name {
  color: var(--clr-primary);
}

.about__role {
  margin-top: 1.2em;
}

.about__desc {
  font-size: 1rem;
  max-width: 600px;
}

.about__desc,
.about__contact {
  margin-top: 2.4em;
}

.about .link--icon {
  margin-right: 0.8em;
}

.about .btn--outline {
  margin-right: 1em;
}

@media (max-width: 600px) {
  .app .about {
    align-items: flex-start;
    margin-top: 2em;
  }
  .about__contact {
    margin: 2.4em auto;
  }
}
</style>
