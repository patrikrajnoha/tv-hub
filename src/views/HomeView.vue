<script setup lang="ts">
import LauncherGrid from '../components/LauncherGrid.vue'
import { launchers } from '../data/launchers'
</script>

<template>
  <main class="tv-hub-shell">
    <header class="hub-header">
      <p class="hub-kicker">TV HUB</p>
      <h1 class="hub-title">Čo si dnes pozrieme?</h1>
    </header>

    <div class="home-dashboard">
      <section class="home-hero" aria-label="TV Hub úvod">
        <div class="home-hero-copy">
          <span class="home-hero-eyebrow">ŽIVÉ VYSIELANIE</span>
          <h2>Televízia na jednom mieste</h2>
          <p>Vyber si kanál alebo otvor svoju knižnicu.</p>
        </div>
        <span class="home-hero-mark" aria-hidden="true">TV</span>
      </section>

      <LauncherGrid :launchers="launchers" />
    </div>
  </main>
</template>
