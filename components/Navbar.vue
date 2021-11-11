<template>
  <nav class="center nav">
    <ul
      :style="{ display: showNavList ? 'flex' : null }"
      class="nav__list"
    >
      <li class="nav__list-item">
        <a
          href="#projects"
          class="link link--nav"
          @click="toggleNavList"
        >
          Projects
        </a>
      </li>

      <li class="nav__list-item">
        <a
          href="#skills"
          class="link link--nav"
          @click="toggleNavList"
        >
          Skills
        </a>
      </li>

      <li class="nav__list-item">
        <a
          href="#contact"
          class="link link--nav"
          @click="toggleNavList"
        >
          Contact
        </a>
      </li>
    </ul>

    <DarkToggle />

    <button
      type="button"
      class="btn btn--icon nav__hamburger"
      aria-label="toggle navigation"
      @click="toggleNavList"
    >
      <div v-if="showNavList" class="icon i-mdi-close" />
      <div v-else class="icon i-mdi-menu" />
    </button>
  </nav>
</template>

<script setup>
const showNavList = useState('showNavList', false)

const toggleNavList = () => showNavList.value = !showNavList.value

</script>

<style>
.nav__list {
  margin-right: 1.5em;
  display: flex;
}
.nav__list-item {
  margin-left: 1.5em;
}

.app .nav__hamburger {
  display: none;
}

.nav__theme {
  margin-top: 0.4em;
}

@media (max-width: 600px) {
  .nav__list {
    display: none;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
  }

  .nav__list-item {
    margin: 0.5em 0;
  }

  .app .nav__hamburger {
    display: flex;
    z-index: 2;
    margin-left: 0.8em;
  }
}

</style>
