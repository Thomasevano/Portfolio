<template>
  <header class="header center">
    <h3>
      <NuxtLink to="/" class="link">
        TE.
      </NuxtLink>
    </h3>
    <Navbar />
  </header>
</template>

<style>
.header {
  height: 8em;
  max-width: 1100px;
  width: 95%;
  margin: 0 auto;
  justify-content: space-between;
}

@media (max-width: 600px) {
  .header {
    height: 6em;
  }
}
</style>
