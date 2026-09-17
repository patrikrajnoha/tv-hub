<script setup lang="ts">
import { useRoute } from 'vue-router'
import { allowActivation } from '../composables/useActivationGuard'
import { rememberActiveRoute } from '../composables/useFocusMemory'
import { usePressFeedback } from '../composables/usePressFeedback'
import AppIcon from './AppIcon.vue'
import type { CollectionItem as CollectionEntry, IconName } from '../types'

const props = defineProps<{
  item: CollectionEntry
  browse?: boolean
  accent?: string
  icon?: IconName
}>()

const route = useRoute()
const { isPressed, press } = usePressFeedback()

const handlePressKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ' || event.code === 'Space') press()
}

const handleClick = (event: MouseEvent) => {
  if (!allowActivation()) {
    event.preventDefault()
    return
  }

  press()
  rememberActiveRoute(route.fullPath)
}
</script>

<template>
  <a
    class="collection-item"
    :class="{ 'collection-item--browse': browse, 'collection-item--pressed': isPressed }"
    :href="item.url"
    :aria-label="browse ? `${item.name} - open` : `Open ${item.name}`"
    @keydown="handlePressKeydown"
    @click="handleClick"
  >
    <span class="collection-art" :class="{ 'collection-art--browse': browse }" aria-hidden="true">
      <AppIcon :name="props.icon ?? (browse ? 'search' : 'film')" :size="48" />
      <span class="collection-art-sheen"></span>
    </span>
    <span class="collection-item-name">{{ item.name }}</span>
  </a>
</template>
