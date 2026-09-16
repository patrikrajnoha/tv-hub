<script setup lang="ts">
import type { CollectionItem as CollectionEntry } from '../types'

defineProps<{
  item: CollectionEntry
  browse?: boolean
}>()
</script>

<template>
  <a
    class="collection-item"
    :class="{ 'collection-item--browse': browse }"
    :href="item.url"
    :aria-label="browse ? `${item.name} - open` : `Open ${item.name}`"
  >
    <span class="collection-item-name">{{ item.name }}</span>
  </a>
</template>
