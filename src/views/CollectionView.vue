<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import CollectionGrid from '../components/CollectionGrid.vue'
import type { CollectionItem } from '../types'

const props = defineProps<{
  title: string
  items: CollectionItem[]
  browseItem?: CollectionItem
}>()

const router = useRouter()
const navigationRefs = ref<HTMLElement[]>([])

const setBackButtonRef = (element: Element | null) => {
  if (element instanceof HTMLButtonElement) {
    navigationRefs.value[0] = element
  }
}

const goHome = () => {
  void router.push({ name: 'home' })
}

</script>

<template>
  <main class="collection-page">
    <button :ref="setBackButtonRef" class="back-control collection-back" type="button" @click="goHome">
      <AppIcon name="back" :size="28" />
      <span>Späť</span>
    </button>

    <div class="collection-content">
      <h1 class="collection-title">{{ props.title }}</h1>
      <CollectionGrid
        :items="props.items"
        :browse-item="props.browseItem"
        :aria-label="`${props.title} collection`"
        :memory-key="props.title"
        :navigation-refs="navigationRefs"
      />
    </div>
  </main>
</template>
