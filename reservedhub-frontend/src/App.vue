<template>
  <div id="app">
    <Navbar />
    <main class="page-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import Navbar from './components/Navbar.vue';
</script>

<style>
#app {
  min-height: 100vh;
  background: #f3f4f6;
}

.page-content {
  padding: 1.5rem;
}
</style>