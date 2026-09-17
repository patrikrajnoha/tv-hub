import { onBeforeUnmount, onMounted, type Ref } from 'vue'

export type SpatialDirection = 'up' | 'down' | 'left' | 'right'

type Direction = SpatialDirection

interface SpatialNavigationOptions {
  itemRefs: Ref<HTMLElement[]>
  initialIndex?: number
  autoFocus?: boolean
  scrollBehavior?: ScrollBehavior
  getNextIndex?: (currentIndex: number, direction: Direction) => number
}

const directionKeys: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  // Some TV WebViews expose the Android key names instead of Arrow*.
  DPAD_UP: 'up',
  DPAD_DOWN: 'down',
  DPAD_LEFT: 'left',
  DPAD_RIGHT: 'right',
}

const legacyDirectionKeyCodes: Record<number, Direction> = {
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
}

interface LayoutItem {
  element: HTMLElement
  index: number
  rect: DOMRect
}

interface LayoutRow {
  top: number
  items: LayoutItem[]
}

/**
 * Moves focus one logical step at a time through either a caller-provided
 * navigation graph or the rendered rows.
 *
 * The DOM order is stable, while the number of columns in collection grids
 * changes with the viewport. Grouping by the actual rendered top/left
 * positions keeps collection navigation aligned with responsive CSS without
 * using Euclidean nearest-neighbor jumps. Home supplies an explicit graph.
 */
export function useSpatialNavigation({
  itemRefs,
  initialIndex = 0,
  autoFocus = true,
  scrollBehavior = 'auto',
  getNextIndex,
}: SpatialNavigationOptions) {
  const focusItem = (index: number) => {
    const item = itemRefs.value[index]
    if (!item) return

    item.focus({ preventScroll: true })
    const rect = item.getBoundingClientRect()
    const isOutsideViewport =
      rect.top < 0 || rect.left < 0 || rect.bottom > window.innerHeight || rect.right > window.innerWidth
    if (!isOutsideViewport) return

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    item.scrollIntoView({
      behavior: reducedMotion ? 'auto' : scrollBehavior,
      block: 'nearest',
      inline: 'nearest',
    })
  }

  const getLayoutRows = () => {
    const layoutItems: LayoutItem[] = itemRefs.value
      .map((element, index) => ({ element, index, rect: element.getBoundingClientRect() }))
      .filter(({ rect }) => rect.width > 0 && rect.height > 0)
      .sort((a, b) => a.rect.top - b.rect.top || a.rect.left - b.rect.left)

    const rows: LayoutRow[] = []
    for (const item of layoutItems) {
      const row = rows.find((candidate) => Math.abs(candidate.top - item.rect.top) <= 4)
      if (row) {
        row.items.push(item)
      } else {
        rows.push({ top: item.rect.top, items: [item] })
      }
    }

    return rows.map((row) => ({
      ...row,
      items: row.items.sort((a, b) => a.rect.left - b.rect.left),
    }))
  }

  const findNextIndex = (direction: Direction) => {
    const activeElement = document.activeElement as HTMLElement | null
    const currentIndex = itemRefs.value.findIndex((item) => item === activeElement)
    if (currentIndex < 0) return initialIndex

    if (getNextIndex) return getNextIndex(currentIndex, direction)

    const rows = getLayoutRows()
    const currentRowIndex = rows.findIndex((row) => row.items.some((item) => item.index === currentIndex))
    if (currentRowIndex < 0) return currentIndex

    const currentRow = rows[currentRowIndex]
    const currentColumn = currentRow.items.findIndex((item) => item.index === currentIndex)
    if (currentColumn < 0) return currentIndex

    if (direction === 'left' || direction === 'right') {
      const nextColumn = currentColumn + (direction === 'left' ? -1 : 1)
      return currentRow.items[nextColumn]?.index ?? currentIndex
    }

    const nextRowIndex = currentRowIndex + (direction === 'up' ? -1 : 1)
    const nextRow = rows[nextRowIndex]
    if (!nextRow) return currentIndex

    // Preserve the column when possible; on a shorter row use its nearest edge.
    const nextColumn = Math.min(currentColumn, nextRow.items.length - 1)
    return nextRow.items[nextColumn]?.index ?? currentIndex
  }

  const handleKeydown = (event: KeyboardEvent) => {
    const direction = directionKeys[event.key] ?? directionKeys[event.code] ?? legacyDirectionKeyCodes[event.keyCode]
    if (direction) {
      // Only claim directional input while this navigation surface owns focus.
      // This keeps inputs and cross-origin players/browser UI untouched.
      const activeElement = document.activeElement as HTMLElement | null
      if (!activeElement || !itemRefs.value.includes(activeElement)) return

      event.preventDefault()
      event.stopPropagation()
      focusItem(findNextIndex(direction))
      return
    }

    // Space is an optional Enter equivalent for remotes and keyboards.
    if (event.key === ' ' || event.code === 'Space' || event.key === 'Enter' || event.key === 'NumpadEnter') {
      const activeElement = document.activeElement as HTMLElement | null
      if (activeElement && itemRefs.value.includes(activeElement)) {
        event.preventDefault()
        event.stopPropagation()
        activeElement.click()
      }
      return
    }

    // Escape and browser Back are intentionally left to the browser so its
    // normal history behavior remains available after opening a website.
  }

  onMounted(() => {
    // Capture makes the shell's D-pad decision before browser scrolling,
    // while the active-element guard prevents global key hijacking.
    window.addEventListener('keydown', handleKeydown, true)
    if (autoFocus) requestAnimationFrame(() => focusItem(initialIndex))
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown, true)
  })

  return { focusItem }
}
