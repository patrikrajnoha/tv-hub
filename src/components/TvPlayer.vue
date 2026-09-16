<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import type Hls from 'hls.js'
import type { Channel } from '../types'

type TvPlayerProps = Pick<Channel, 'id' | 'name' | 'playerType'> & {
  streamUrl?: string | null
  embedUrl?: string
  allow?: string
}

const props = withDefaults(defineProps<TvPlayerProps>(), {
  streamUrl: null,
  embedUrl: '',
  allow: 'autoplay; fullscreen; encrypted-media; clipboard-read; clipboard-write',
})

const emit = defineEmits<{
  (event: 'navigate-back'): void
}>()

const isEmbed = computed(() => props.playerType === 'embed')
const embedUrl = computed(() => (props.playerType === 'embed' ? props.embedUrl : ''))
const embedAllow = computed(() =>
  props.playerType === 'embed'
    ? (props.allow ?? 'autoplay; fullscreen; encrypted-media; clipboard-read; clipboard-write')
    : '',
)

const videoRef = ref<HTMLVideoElement | null>(null)
const playButtonRef = ref<HTMLButtonElement | null>(null)
const controlRefs = ref<(HTMLButtonElement | null)[]>([])
const isPlaying = ref(false)
const isLoading = ref(false)
const hasError = ref(false)
const embedFailed = ref(false)
const embedLoaded = ref(false)
let hls: Hls | null = null
let embedLoadTimeout: number | undefined
let nativeManifestLogged = false

const setControlRef = (element: Element | null, index: number) => {
  controlRefs.value[index] = element instanceof HTMLButtonElement ? element : null
}

const setPlayButtonRef = (element: Element | null) => {
  playButtonRef.value = element instanceof HTMLButtonElement ? element : null
  setControlRef(element, 0)
}

const seek = (seconds: number) => {
  if (props.playerType !== 'hls' || !videoRef.value || !props.streamUrl) return
  videoRef.value.currentTime = Math.max(0, videoRef.value.currentTime + seconds)
}

const togglePlayback = async () => {
  if (props.playerType !== 'hls' || !videoRef.value || !props.streamUrl) return
  if (videoRef.value.paused) {
    await videoRef.value.play().catch(() => (hasError.value = true))
  } else {
    videoRef.value.pause()
  }
}

const focusPlayControl = () => {
  if (isEmbed.value) return
  void nextTick(() => playButtonRef.value?.focus({ preventScroll: true }))
}

const moveControl = (offset: number) => {
  const currentIndex = controlRefs.value.findIndex((control) => control === document.activeElement)
  if (currentIndex < 0) return

  const availableIndexes = controlRefs.value
    .map((control, index) => (control ? index : -1))
    .filter((index) => index >= 0)
  const currentPosition = availableIndexes.indexOf(currentIndex)
  const nextPosition = currentPosition + offset

  if (nextPosition < 0) {
    emit('navigate-back')
  } else if (nextPosition < availableIndexes.length) {
    controlRefs.value[availableIndexes[nextPosition]]?.focus({ preventScroll: true })
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  // Let the cross-origin official player receive all keyboard input itself.
  if (isEmbed.value) return

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    moveControl(-1)
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    moveControl(1)
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault()
    seek(-10)
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    seek(10)
  }
}

const handleEmbedLoad = () => {
  embedLoaded.value = true
  embedFailed.value = false
  isLoading.value = false
  if (embedLoadTimeout !== undefined) window.clearTimeout(embedLoadTimeout)
}

const logPlaybackError = () => {
  const mediaError = videoRef.value?.error
  console.error('[TvPlayer] Playback error', {
    code: mediaError?.code,
    message: mediaError?.message,
  })
  hasError.value = true
  isLoading.value = false
}

const handleVideoPlay = () => (isPlaying.value = true)
const handleVideoPause = () => (isPlaying.value = false)
const handleVideoReady = () => {
  isLoading.value = false
  if (videoRef.value?.canPlayType('application/vnd.apple.mpegurl') && !nativeManifestLogged) {
    nativeManifestLogged = true
    console.info('[TvPlayer] Manifest loaded (native HLS)')
  }
}

const handleVideoCanPlay = () => {
  isLoading.value = false
}

const setupStream = async () => {
  if (props.playerType !== 'hls') return
  const video = videoRef.value
  if (!video || !props.streamUrl) return

  hasError.value = false
  isLoading.value = true
  nativeManifestLogged = false
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    console.info('[TvPlayer] Using native HLS')
    video.src = props.streamUrl
    video.load()
    return
  }

  try {
    const HlsConstructor = (await import('hls.js')).default
    if (!HlsConstructor.isSupported()) {
      console.error('[TvPlayer] HLS is not supported by this browser')
      hasError.value = true
      isLoading.value = false
      return
    }

    console.info('[TvPlayer] Using hls.js fallback')
    hls = new HlsConstructor()
    hls.loadSource(props.streamUrl)
    hls.attachMedia(video)
    hls.on(HlsConstructor.Events.MANIFEST_PARSED, () => {
      console.info('[TvPlayer] Manifest loaded (hls.js)')
      isLoading.value = false
    })
    hls.on(HlsConstructor.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        console.error('[TvPlayer] Fatal hls.js error', {
          type: data.type,
          details: data.details,
        })
        hasError.value = true
        isLoading.value = false
      }
    })
  } catch (error) {
    console.error('[TvPlayer] hls.js setup error', error)
    hasError.value = true
    isLoading.value = false
  }
}

const retryPlayback = () => {
  if (props.playerType !== 'hls' || !props.streamUrl) return

  hls?.destroy()
  hls = null
  if (videoRef.value) {
    videoRef.value.pause()
    videoRef.value.removeAttribute('src')
    videoRef.value.load()
  }
  void setupStream()
}

onMounted(() => {
  if (isEmbed.value) {
    isLoading.value = true
    embedLoadTimeout = window.setTimeout(() => {
      if (!embedLoaded.value) {
        embedFailed.value = true
        isLoading.value = false
      }
    }, 15000)
    return
  }

  const video = videoRef.value
  video?.addEventListener('play', handleVideoPlay)
  video?.addEventListener('pause', handleVideoPause)
  video?.addEventListener('loadedmetadata', handleVideoReady)
  video?.addEventListener('canplay', handleVideoCanPlay)
  video?.addEventListener('error', logPlaybackError)
  void setupStream()
})

onBeforeUnmount(() => {
  const video = videoRef.value
  video?.removeEventListener('play', handleVideoPlay)
  video?.removeEventListener('pause', handleVideoPause)
  video?.removeEventListener('loadedmetadata', handleVideoReady)
  video?.removeEventListener('canplay', handleVideoCanPlay)
  video?.removeEventListener('error', logPlaybackError)
  hls?.destroy()
  hls = null
  if (embedLoadTimeout !== undefined) window.clearTimeout(embedLoadTimeout)
})

defineExpose({ focusPlayControl })
</script>

<template>
  <section
    class="tv-player"
    :class="{ 'tv-player--embed': isEmbed }"
    aria-label="Video player"
    @keydown="handleKeydown"
  >
    <div class="video-frame" :class="{ 'video-frame--embed': isEmbed }">
      <iframe
        v-if="isEmbed"
        class="embed-frame"
        :src="embedUrl"
        :title="`${name} official player`"
        :allow="embedAllow"
        allowfullscreen
        @load="handleEmbedLoad"
      />
      <video
        v-else
        ref="videoRef"
        class="video-element"
        tabindex="-1"
        playsinline
        :aria-label="streamUrl ? 'Live channel video' : 'Unconfigured video stream'"
        @ended="isPlaying = false"
      />
      <div v-if="!isEmbed && playerType === 'hls' && !streamUrl" class="player-message">
        <span class="player-message-icon" aria-hidden="true">▶</span>
        <p>Stream nie je nakonfigurovaný.</p>
        <small>Neskôr sem môžete doplniť autorizovaný HLS zdroj.</small>
      </div>
      <div v-else-if="!isEmbed && hasError" class="player-message">
        <span class="player-message-icon" aria-hidden="true">!</span>
        <p>Prehrávanie sa nepodarilo načítať.</p>
      </div>
      <div v-else-if="!isEmbed && isLoading" class="player-message player-message--loading">
        <p>Načítavam…</p>
      </div>
      <div v-else-if="isEmbed && embedFailed" class="player-message">
        <span class="player-message-icon" aria-hidden="true">!</span>
        <p>Oficiálny player sa nepodarilo načítať.</p>
        <small>Skontrolujte dostupnosť Markíza playera a skúste to znova.</small>
      </div>
      <div v-else-if="isEmbed && isLoading" class="player-message player-message--loading">
        <p>Načítavam…</p>
      </div>
    </div>

    <div v-if="!isEmbed" class="player-controls" aria-label="Player controls">
      <button
        :ref="setPlayButtonRef"
        type="button"
        class="player-control"
        @click="togglePlayback"
      >
        {{ isPlaying ? 'Pause' : 'Play' }}
      </button>
      <button
        :ref="(element) => setControlRef(element, 1)"
        type="button"
        class="player-control"
        @click="seek(-10)"
      >
        −10 sec
      </button>
      <button
        :ref="(element) => setControlRef(element, 2)"
        type="button"
        class="player-control"
        @click="seek(10)"
      >
        +10 sec
      </button>
      <button
        v-if="hasError"
        :ref="(element) => setControlRef(element, 3)"
        type="button"
        class="player-control"
        @click="retryPlayback"
      >
        Skúsiť znova
      </button>
    </div>
  </section>
</template>
