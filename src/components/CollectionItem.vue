<script setup lang="ts">
import { useRoute } from 'vue-router'
import { allowActivation } from '../composables/useActivationGuard'
import { rememberActiveRoute } from '../composables/useFocusMemory'
import { usePressFeedback } from '../composables/usePressFeedback'
import type { CollectionItem as CollectionEntry } from '../types'

const props = defineProps<{
  item: CollectionEntry
  browse?: boolean
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
    <span class="collection-item-name">{{ item.name }}</span>
  </a>
</template>
