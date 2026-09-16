<script setup lang="ts">
import AppIcon from './AppIcon.vue'
import { rememberHomeLauncher } from '../composables/useFocusMemory'
import type { Launcher } from '../types'

const props = defineProps<{
  launcher: Launcher
}>()

const rememberFocus = () => rememberHomeLauncher(props.launcher.id)
</script>

<template>
  <RouterLink
    v-if="launcher.type === 'channel' || launcher.type === 'internal'"
    class="launcher-item"
    :class="[
      { 'launcher-item--secondary': launcher.variant === 'secondary' },
      `launcher-item--${launcher.id}`,
    ]"
    :to="launcher.route"
    :aria-label="`Open ${launcher.label}`"
    :style="{ '--accent': launcher.accent }"
    @focus="rememberFocus"
    @click="rememberFocus"
  >
    <AppIcon v-if="launcher.icon" class="launcher-icon" :name="launcher.icon" :size="34" />
    <span class="launcher-label">{{ launcher.label }}</span>
  </RouterLink>
  <a
    v-else
    class="launcher-item"
    :class="[
      { 'launcher-item--secondary': launcher.variant === 'secondary' },
      `launcher-item--${launcher.id}`,
    ]"
    :href="launcher.url"
    :aria-label="`Open ${launcher.label}`"
    :style="{ '--accent': launcher.accent }"
    @focus="rememberFocus"
    @click="rememberFocus"
  >
    <AppIcon v-if="launcher.icon" class="launcher-icon" :name="launcher.icon" :size="34" />
    <span class="launcher-label">{{ launcher.label }}</span>
  </a>
</template>
