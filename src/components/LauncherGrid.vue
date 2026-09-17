<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import LauncherItem from './LauncherItem.vue'
import { useSpatialNavigation } from '../composables/useSpatialNavigation'
import { getHomeFocusIndex, rememberHomeLauncher } from '../composables/useFocusMemory'
import { homeLauncherGroups, homeNavigation } from '../data/homeLayout'
import type { Launcher } from '../types'

const props = defineProps<{
  launchers: Launcher[]
}>()

const itemRefs = ref<HTMLElement[]>([])
const setItemRef = (element: Element | null, index: number) => {
  if (element instanceof HTMLElement) itemRefs.value[index] = element
}

const visibleLaunchers = computed(() =>
  homeLauncherGroups.flatMap((group) =>
    group.launcherIds
      .map((id) => props.launchers.find((launcher) => launcher.id === id))
      .filter((launcher): launcher is Launcher => Boolean(launcher && launcher.visible !== false)),
  ),
)
const initialFocusIndex = computed(() => getHomeFocusIndex(visibleLaunchers.value))
const activeLauncherId = ref<string | null>(null)

const launcherGroups = computed(() =>
  homeLauncherGroups.map((group) => ({
    ...group,
    launchers: group.launcherIds
      .map((id) => visibleLaunchers.value.find((launcher) => launcher.id === id))
      .filter((launcher): launcher is Launcher => Boolean(launcher)),
  })),
)

const getHomeNextIndex = (currentIndex: number, direction: 'up' | 'down' | 'left' | 'right') => {
  const currentLauncher = visibleLaunchers.value[currentIndex]
  const nextId = currentLauncher ? homeNavigation[currentLauncher.id]?.[direction] : undefined
  const nextIndex = nextId ? visibleLaunchers.value.findIndex((launcher) => launcher.id === nextId) : -1
  return nextIndex >= 0 ? nextIndex : currentIndex
}

const { focusItem } = useSpatialNavigation({ itemRefs, autoFocus: false, getNextIndex: getHomeNextIndex })

const focusLauncher = (index: number) => {
  const launcher = visibleLaunchers.value[index]
  if (launcher) {
    activeLauncherId.value = launcher.id
    rememberHomeLauncher(launcher.id)
  }
  void nextTick(() => focusItem(index))
}

const restoreHomeFocus = () => {
  requestAnimationFrame(() => focusLauncher(initialFocusIndex.value))
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
    <section
      v-for="group in launcherGroups"
      :key="group.id"
      class="launcher-section"
      :class="`launcher-section--${group.variant}`"
    >
      <h2 class="launcher-section-title">{{ group.title }}</h2>
      <div class="launcher-row">
        <LauncherItem
          v-for="launcher in group.launchers"
          :key="launcher.id"
          :ref="(element) => setItemRef(element?.$el ?? element, visibleLaunchers.indexOf(launcher))"
          :launcher="launcher"
          :visual-variant="group.variant"
          :selected="activeLauncherId === launcher.id"
          @focus="focusLauncher(visibleLaunchers.indexOf(launcher))"
        />
      </div>
    </section>
  </nav>
</template>
