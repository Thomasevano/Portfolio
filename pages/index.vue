<template>
  <div id="top" class="app">
    <Header />

    <main>
      <About :about="abouts" />
      <Projects :projects="projects" />
      <Skills :skills="skills" />
      <Contact :mail="abouts.social.mail" />
    </main>
    <ScrollToTop />
    <Footer />
  </div>
</template>

<script setup>
import axios from 'axios'

const config = useRuntimeConfig()
const abouts = await fetchData('abouts')
const projects = await fetchData('projects')
const skills = await fetchData('skills')

async function fetchData(dataName) {
  let response = await axios.get(`${config.BASE_URL}/${dataName}`)
  if (dataName === 'abouts')
    response = response.data[0]
  else
    response = response.data

  return response
}

</script>
