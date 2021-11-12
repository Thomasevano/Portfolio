<template>
  <div class="about center">
    <div class="ml11">
      <h1 v-if="about.name" class="title about__name">
        Hi, I am {{ about.name }}.
      </h1>

      <h2 v-if="about.role" class="about__role subtitle">
        A {{ about.role }}.
      </h2>
    </div>
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
import anime from 'animejs/lib/anime.es.js'

const props = defineProps({
  about: Object,
})

onMounted(() => {
  const title = document.querySelector('.ml11 .title')
  const subtitle = document.querySelector('.ml11 .subtitle')

  formatTextToAnimate(title)
  formatTextToAnimate(subtitle)
  animateText()
})

function formatTextToAnimate(text) {
  return text.innerHTML = text.textContent.replace(
    // eslint-disable-next-line no-control-regex
    /([^\x00-\x80]|\w|\W)/g,
    '<span class=\'letter\'>$&</span>',
  )
}

function animateText() {
  anime
    .timeline()
    .add({
      targets: '.ml11 .line',
      translateX: [
        0,
        document.querySelector('.ml11').getBoundingClientRect().width
        + 10,
      ],
      easing: 'easeOutExpo',
      duration: 700,
      delay: 100,
    })
    .add({
      targets: '.ml11 .letter',
      opacity: [0, 1],
      easing: 'easeOutExpo',
      duration: 600,
      offset: '-=775',
      delay(el, i) {
        return 34 * (i + 1)
      },
    })
    .add({
      targets: '.ml11',
      /* opacity: 0, */
      duration: 500,
      easing: 'easeOutExpo',
    })
}
</script>

<style>

.about {
  flex-direction: column;
  margin-top: 3em;
}

.about__name > .letter:nth-child(1n+11) {
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
