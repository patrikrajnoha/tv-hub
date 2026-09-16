<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import TvPlayer from '../components/TvPlayer.vue'
import { allowActivation } from '../composables/useActivationGuard'
import { usePressFeedback } from '../composables/usePressFeedback'
import { findChannel } from '../data/channels'

const route = useRoute()
const router = useRouter()
const backButtonRef = ref<HTMLButtonElement | null>(null)
const playerRef = ref<InstanceType<typeof TvPlayer> | null>(null)
const { isPressed, press } = usePressFeedback()

const channel = computed(() => findChannel(String(route.params.channelId)))

const goHome = () => {
  void router.replace({ name: 'home' })
}

const handleBackClick = (event: MouseEvent) => {
  if (!allowActivation()) {
    event.preventDefault()
    return
  }
  press()
  goHome()
}

const handlePageKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    event.preventDefault()
    goHome()
  }
}

const handleBackKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ' || event.code === 'Space') press()
  if (event.key === 'ArrowDown' && channel.value?.playerType === 'hls') {
    event.preventDefault()
    playerRef.value?.focusPlayControl()
  }
}

const focusBackButton = () => {
  void nextTick(() => backButtonRef.value?.focus({ preventScroll: true }))
}

onMounted(focusBackButton)
</script>

<template>
  <main class="player-page" @keydown="handlePageKeydown">
    <button
      ref="backButtonRef"
      type="button"
      class="back-control"
      :class="{ 'back-control--pressed': isPressed }"
      aria-label="Back to TV Hub"
      @click="handleBackClick"
      @keydown="handleBackKeydown"
    >
      <AppIcon name="back" :size="28" />
      <span>Späť</span>
    </button>

    <div v-if="channel" class="player-content">
      <header class="player-header">
        <h1>{{ channel.name }}</h1>
      </header>
      <TvPlayer
        v-if="channel.playerType === 'embed'"
        ref="playerRef"
        :id="channel.id"
        :name="channel.name"
        player-type="embed"
        :embed-url="channel.embedUrl"
        :allow="channel.allow"
        @navigate-back="focusBackButton"
      />
      <TvPlayer
        v-else
        ref="playerRef"
        :id="channel.id"
        :name="channel.name"
        player-type="hls"
        :stream-url="channel.streamUrl"
        @navigate-back="focusBackButton"
      />
    </div>

    <div v-else class="player-content player-not-found">
      <header class="player-header">
        <h1>Channel not found</h1>
        <p>This channel is not configured in the TV Hub data.</p>
      </header>
    </div>
  </main>
</template>
