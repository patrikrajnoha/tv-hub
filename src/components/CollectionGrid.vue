<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import CollectionItem from './CollectionItem.vue'
import { useSpatialNavigation } from '../composables/useSpatialNavigation'
import { getCollectionFocusIndex, rememberCollectionItem } from '../composables/useFocusMemory'
import type { CollectionItem as CollectionEntry } from '../types'

const props = defineProps<{
  items: CollectionEntry[]
  browseItem?: CollectionEntry
  ariaLabel: string
  memoryKey: string
  navigationRefs: HTMLElement[]
}>()

const itemRefs = ref(props.navigationRefs)
const entries = computed(() => (props.browseItem ? [props.browseItem, ...props.items] : props.items))

const setItemRef = (element: Element | null, index: number) => {
  if (element instanceof HTMLElement) itemRefs.value[index + 1] = element
}

const initialFocusIndex = computed(() => getCollectionFocusIndex(props.memoryKey, entries.value.map((item) => item.id)) + 1)

const { focusItem } = useSpatialNavigation({
  itemRefs,
  initialIndex: initialFocusIndex.value,
  scrollBehavior: 'smooth',
})

const focusEntry = (index: number) => {
  const entry = entries.value[index]
  if (entry) rememberCollectionItem(props.memoryKey, entry.id)
  void nextTick(() => focusItem(index + 1))
}

onMounted(() => {
  requestAnimationFrame(() => focusItem(initialFocusIndex.value))
})
</script>

<template>
  <nav class="collection-grid" :aria-label="props.ariaLabel">
    <CollectionItem
      v-for="(item, index) in entries"
      :key="item.id"
      :ref="(element) => setItemRef(element?.$el ?? element, index)"
      :item="item"
      :browse="props.browseItem?.id === item.id"
      @focus="focusEntry(index)"
    />
  </nav>
</template>
