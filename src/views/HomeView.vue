<script setup lang="ts">
import LauncherGrid from '../components/LauncherGrid.vue'
import { launchers } from '../data/launchers'
</script>

<template>
  <main class="tv-hub-shell">
    <h1 class="hub-brand">TV HUB</h1>

    <LauncherGrid :launchers="launchers" />
  </main>
</template>
