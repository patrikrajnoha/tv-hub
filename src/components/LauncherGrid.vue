<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import LauncherItem from './LauncherItem.vue'
import { useSpatialNavigation } from '../composables/useSpatialNavigation'
import { getHomeFocusIndex, rememberHomeLauncher } from '../composables/useFocusMemory'
import type { Launcher } from '../types'

const props = defineProps<{
  launchers: Launcher[]
}>()

const itemRefs = ref<HTMLElement[]>([])
const setItemRef = (element: Element | null, index: number) => {
  if (element instanceof HTMLElement) itemRefs.value[index] = element
}

const visibleLaunchers = computed(() => props.launchers.filter((launcher) => launcher.visible !== false))
const initialFocusIndex = computed(() => getHomeFocusIndex(visibleLaunchers.value))

const { focusItem } = useSpatialNavigation({ itemRefs, autoFocus: false })

const launcherRows = computed(() =>
  Array.from({ length: Math.ceil(visibleLaunchers.value.length / 4) }, (_, rowIndex) => {
    const start = rowIndex * 4
    return visibleLaunchers.value.slice(start, start + 4).map((launcher, offset) => ({
      launcher,
      index: start + offset,
    }))
  }),
)

const focusLauncher = (index: number) => {
  const launcher = visibleLaunchers.value[index]
  if (launcher) rememberHomeLauncher(launcher.id)
  void nextTick(() => focusItem(index))
}

const restoreHomeFocus = () => {
  requestAnimationFrame(() => focusItem(initialFocusIndex.value))
}

onMounted(() => {
  restoreHomeFocus()
  window.addEventListener('pageshow', restoreHomeFocus)
})

onBeforeUnmount(() => {
  window.removeEventListener('pageshow', restoreHomeFocus)
})
</script>

<template>
  <nav class="launcher-grid" aria-label="TV Hub launchers">
    <div
      v-for="(row, rowIndex) in launcherRows"
      :key="rowIndex"
      class="launcher-row"
      :class="{ 'launcher-row--media': rowIndex === 2 }"
    >
      <LauncherItem
        v-for="item in row"
        :key="item.launcher.id"
        :ref="(element) => setItemRef(element?.$el ?? element, item.index)"
        :launcher="item.launcher"
        @focus="focusLauncher(item.index)"
      />
    </div>
  </nav>
</template>
