import { onBeforeUnmount, onMounted, type Ref } from 'vue'

type Direction = 'up' | 'down' | 'left' | 'right'

interface SpatialNavigationOptions {
  itemRefs: Ref<HTMLElement[]>
  initialIndex?: number
  autoFocus?: boolean
  scrollBehavior?: ScrollBehavior
}

const directionKeys: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
}

/** Moves focus to the nearest launcher in the requested direction. */
export function useSpatialNavigation({
  itemRefs,
  initialIndex = 0,
  autoFocus = true,
  scrollBehavior = 'auto',
}: SpatialNavigationOptions) {
  const focusItem = (index: number) => {
    const item = itemRefs.value[index]
    if (!item) return

    item.focus({ preventScroll: true })
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    item.scrollIntoView({
      behavior: reducedMotion ? 'auto' : scrollBehavior,
      block: 'nearest',
      inline: 'nearest',
    })
  }

  const getCenter = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  }

  const findNextIndex = (direction: Direction) => {
    const activeElement = document.activeElement as HTMLElement | null
    const currentIndex = itemRefs.value.findIndex((item) => item === activeElement)
    if (currentIndex < 0) return initialIndex

    const currentCenter = getCenter(itemRefs.value[currentIndex])
    const candidates = itemRefs.value
      .map((element, index) => ({ element, index, center: getCenter(element) }))
      .filter(({ index, center }) => {
        if (index === currentIndex) return false
        if (direction === 'up') return center.y < currentCenter.y - 1
        if (direction === 'down') return center.y > currentCenter.y + 1
        if (direction === 'left') return center.x < currentCenter.x - 1
        return center.x > currentCenter.x + 1
      })

    if (!candidates.length) return currentIndex

    return candidates.reduce((best, candidate) => {
      const bestDistance = Math.hypot(
        best.center.x - currentCenter.x,
        best.center.y - currentCenter.y,
      )
      const candidateDistance = Math.hypot(
        candidate.center.x - currentCenter.x,
        candidate.center.y - currentCenter.y,
      )
      return candidateDistance < bestDistance ? candidate : best
    }).index
  }

  const handleKeydown = (event: KeyboardEvent) => {
    const direction = directionKeys[event.key]
    if (direction) {
      event.preventDefault()
      focusItem(findNextIndex(direction))
      return
    }

    // Space is an optional Enter equivalent for remotes and keyboards.
    if (event.key === ' ' || event.code === 'Space') {
      const activeElement = document.activeElement as HTMLElement | null
      if (activeElement && itemRefs.value.includes(activeElement)) {
        event.preventDefault()
        activeElement.click()
      }
      return
    }

    // Escape and browser Back are intentionally left to the browser so its
    // normal history behavior remains available after opening a website.
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
    if (autoFocus) requestAnimationFrame(() => focusItem(initialIndex))
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown)
  })

  return { focusItem }
}
