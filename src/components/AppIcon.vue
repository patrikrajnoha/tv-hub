<script setup lang="ts">
import type { IconName } from '../types'

withDefaults(
  defineProps<{
    name: IconName
    size?: number
  }>(),
  { size: 32 },
)
</script>

<template>
  <svg
    class="app-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="name === 'tv'">
      <rect x="2.5" y="4.5" width="19" height="14" rx="2" />
      <path d="m8 2.5 4 2 4-2" />
      <path d="M8 21.5h8" />
    </template>
    <template v-else-if="name === 'search'">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 5 5" />
    </template>
    <template v-else-if="name === 'film'">
      <rect x="3" y="4.5" width="18" height="15" rx="2" />
      <path d="M3 9h18M3 15h18M8 4.5v15M16 4.5v15" />
    </template>
    <template v-else-if="name === 'series'">
      <rect x="3" y="4" width="7" height="16" rx="1.5" />
      <rect x="14" y="4" width="7" height="16" rx="1.5" />
      <path d="M10 8h4M10 12h4M10 16h4" />
    </template>
    <template v-else-if="name === 'shows'">
      <rect x="3" y="4.5" width="18" height="13" rx="2" />
      <path d="m9 21 3-3.5 3 3.5M8 4.5 10 2M16 4.5 14 2" />
    </template>
    <template v-else-if="name === 'play'">
      <circle cx="12" cy="12" r="9" />
      <path d="m10 8 6 4-6 4z" />
    </template>
    <template v-else-if="name === 'hockey'">
      <path d="m7 4 7 14" />
      <path d="m17 4-7 14" />
      <path d="M5 18h5M14 18h5" />
      <circle cx="12" cy="20" r="1" />
    </template>
    <template v-else-if="name === 'bookmark'">
      <path d="M6 3.5h12v17l-6-3.5-6 3.5z" />
    </template>
    <template v-else>
      <path d="m15 18-6-6 6-6" />
      <path d="M9 12h12" />
    </template>
  </svg>
</template>
