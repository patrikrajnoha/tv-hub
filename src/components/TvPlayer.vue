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
const controlRefs = ref<HTMLButtonElement[]>([])
const isPlaying = ref(false)
const hasError = ref(false)
const embedFailed = ref(false)
const embedLoaded = ref(false)
let hls: Hls | null = null
let embedLoadTimeout: number | undefined

const setControlRef = (element: Element | null, index: number) => {
  if (element instanceof HTMLButtonElement) controlRefs.value[index] = element
}

const setPlayButtonRef = (element: Element | null) => {
  if (element instanceof HTMLButtonElement) {
    playButtonRef.value = element
    setControlRef(element, 0)
  }
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

  const nextIndex = currentIndex + offset
  if (nextIndex < 0) {
    emit('navigate-back')
  } else if (nextIndex < controlRefs.value.length) {
    controlRefs.value[nextIndex]?.focus({ preventScroll: true })
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
  if (embedLoadTimeout !== undefined) window.clearTimeout(embedLoadTimeout)
}

const logPlaybackError = () => {
  const mediaError = videoRef.value?.error
  console.error('[TvPlayer] Playback error', {
    code: mediaError?.code,
    message: mediaError?.message,
  })
  hasError.value = true
}

const setupStream = async () => {
  if (props.playerType !== 'hls') return
  const video = videoRef.value
  if (!video || !props.streamUrl) return

  hasError.value = false
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    console.info('[TvPlayer] Using native HLS')
    video.src = props.streamUrl
    return
  }

  try {
    const HlsConstructor = (await import('hls.js')).default
    if (!HlsConstructor.isSupported()) {
      console.error('[TvPlayer] HLS is not supported by this browser')
      hasError.value = true
      return
    }

    console.info('[TvPlayer] Using hls.js fallback')
    hls = new HlsConstructor()
    hls.loadSource(props.streamUrl)
    hls.attachMedia(video)
    hls.on(HlsConstructor.Events.MANIFEST_PARSED, () => {
      console.info('[TvPlayer] Manifest loaded (hls.js)')
    })
    hls.on(HlsConstructor.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        console.error('[TvPlayer] Fatal hls.js error', {
          type: data.type,
          details: data.details,
        })
        hasError.value = true
      }
    })
  } catch (error) {
    console.error('[TvPlayer] hls.js setup error', error)
    hasError.value = true
  }
}

onMounted(() => {
  if (isEmbed.value) {
    embedLoadTimeout = window.setTimeout(() => {
      if (!embedLoaded.value) embedFailed.value = true
    }, 15000)
    return
  }

  const video = videoRef.value
  video?.addEventListener('play', () => (isPlaying.value = true))
  video?.addEventListener('pause', () => (isPlaying.value = false))
  video?.addEventListener('loadedmetadata', () => {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      console.info('[TvPlayer] Manifest loaded (native HLS)')
    }
  })
  video?.addEventListener('error', logPlaybackError)
  void setupStream()
})

onBeforeUnmount(() => {
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
        <p>Stream sa nepodarilo načítať.</p>
      </div>
      <div v-else-if="isEmbed && embedFailed" class="player-message">
        <span class="player-message-icon" aria-hidden="true">!</span>
        <p>Oficiálny player sa nepodarilo načítať.</p>
        <small>Skontrolujte dostupnosť Markíza playera a skúste to znova.</small>
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
    </div>
  </section>
</template>
