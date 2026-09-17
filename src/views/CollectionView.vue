<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import CollectionGrid from '../components/CollectionGrid.vue'
import { allowActivation } from '../composables/useActivationGuard'
import { getCollectionScroll, rememberCollectionScroll } from '../composables/useFocusMemory'
import { usePressFeedback } from '../composables/usePressFeedback'
import type { CollectionItem, IconName } from '../types'

const props = defineProps<{
  title: string
  items: CollectionItem[]
  browseItem?: CollectionItem
  accent?: string
  icon?: IconName
}>()

const router = useRouter()
const navigationRefs = ref<HTMLElement[]>([])
const collectionPage = ref<HTMLElement | null>(null)
const { isPressed, press } = usePressFeedback()

const setBackButtonRef = (element: Element | null) => {
  if (element instanceof HTMLButtonElement) {
    navigationRefs.value[0] = element
  }
}

const goHome = () => {
  void router.replace({ name: 'home' })
}

let scrollFrame: number | undefined
const handleScroll = () => {
  if (scrollFrame !== undefined) return
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = undefined
    if (collectionPage.value) rememberCollectionScroll(props.title, collectionPage.value.scrollTop)
  })
}

const handleBackClick = (event: MouseEvent) => {
  if (!allowActivation()) {
    event.preventDefault()
    return
  }
  press()
  goHome()
}

const restoreCollectionScroll = () => {
  if (collectionPage.value) collectionPage.value.scrollTop = getCollectionScroll(props.title)
}

onMounted(() => {
  restoreCollectionScroll()
  collectionPage.value?.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('pageshow', restoreCollectionScroll)
})

onBeforeUnmount(() => {
  if (scrollFrame !== undefined) cancelAnimationFrame(scrollFrame)
  if (collectionPage.value) rememberCollectionScroll(props.title, collectionPage.value.scrollTop)
  collectionPage.value?.removeEventListener('scroll', handleScroll)
  window.removeEventListener('pageshow', restoreCollectionScroll)
})

</script>

<template>
  <main
    ref="collectionPage"
    class="collection-page"
    :style="{ '--collection-accent': props.accent ?? 'var(--color-focus)' }"
  >
    <button
      :ref="setBackButtonRef"
      class="back-control collection-back"
      :class="{ 'back-control--pressed': isPressed }"
      type="button"
      @keydown.enter="press"
      @keydown.space="press"
      @click="handleBackClick"
    >
      <AppIcon name="back" :size="28" />
      <span>Späť</span>
    </button>

    <div class="collection-content">
      <header class="collection-heading">
        <p class="collection-kicker">TV HUB / KNIŽNICA</p>
        <h1 class="collection-title">{{ props.title }}</h1>
      </header>
      <CollectionGrid
        :items="props.items"
        :browse-item="props.browseItem"
        :aria-label="`${props.title} collection`"
        :memory-key="props.title"
        :navigation-refs="navigationRefs"
        :accent="props.accent"
        :icon="props.icon"
      />
    </div>
  </main>
</template>
