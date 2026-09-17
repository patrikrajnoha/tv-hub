<script setup lang="ts">
import AppIcon from './AppIcon.vue'
import { useRoute } from 'vue-router'
import { allowActivation } from '../composables/useActivationGuard'
import { rememberActiveRoute, rememberHomeLauncher } from '../composables/useFocusMemory'
import { usePressFeedback } from '../composables/usePressFeedback'
import type { Launcher } from '../types'

const props = defineProps<{
  launcher: Launcher
  visualVariant?: 'channels' | 'categories' | 'utilities'
  selected?: boolean
}>()

const route = useRoute()
const { isPressed, press } = usePressFeedback()
const rememberFocus = () => rememberHomeLauncher(props.launcher.id)
const handlePressKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ' || event.code === 'Space') press()
}
const handleClick = (event: MouseEvent) => {
  if (!allowActivation()) {
    event.preventDefault()
    return
  }

  press()
  rememberFocus()
  rememberActiveRoute(route.fullPath)
}
</script>

<template>
  <RouterLink
    v-if="launcher.type === 'channel' || launcher.type === 'internal'"
    class="launcher-item"
    :class="[
      { 'launcher-item--secondary': launcher.variant === 'secondary' },
      { 'launcher-item--pressed': isPressed },
      { 'launcher-item--selected': selected },
      `launcher-item--${visualVariant ?? 'default'}`,
    ]"
    :style="{ '--accent': launcher.accent }"
    :to="launcher.route"
    :aria-label="`Open ${launcher.label}`"
    :aria-current="selected ? 'true' : undefined"
    @focus="rememberFocus"
    @keydown="handlePressKeydown"
    @click="handleClick"
  >
    <AppIcon v-if="launcher.icon" class="launcher-icon" :name="launcher.icon" :size="34" />
    <span class="launcher-label">{{ launcher.label }}</span>
  </RouterLink>
  <a
    v-else
    class="launcher-item"
    :class="[
      { 'launcher-item--secondary': launcher.variant === 'secondary' },
      { 'launcher-item--pressed': isPressed },
      { 'launcher-item--selected': selected },
      `launcher-item--${visualVariant ?? 'default'}`,
    ]"
    :style="{ '--accent': launcher.accent }"
    :href="launcher.url"
    :aria-label="`Open ${launcher.label}`"
    :aria-current="selected ? 'true' : undefined"
    @focus="rememberFocus"
    @keydown="handlePressKeydown"
    @click="handleClick"
  >
    <AppIcon v-if="launcher.icon" class="launcher-icon" :name="launcher.icon" :size="34" />
    <span class="launcher-label">{{ launcher.label }}</span>
  </a>
</template>
