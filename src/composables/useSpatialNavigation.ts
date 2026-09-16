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
 * Moves focus one logical step at a time through the rendered rows.
 *
 * The DOM order is stable, while the number of columns in collection grids
 * changes with the viewport. Grouping by the actual rendered top/left
 * positions keeps navigation aligned with both the Home layout and the
 * responsive collection CSS without using Euclidean nearest-neighbor jumps.
 */
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
