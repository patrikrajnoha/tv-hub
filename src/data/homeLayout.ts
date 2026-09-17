import type { SpatialDirection } from '../composables/useSpatialNavigation'

export type HomeLauncherGroupVariant = 'channels' | 'categories' | 'utilities'

export interface HomeLauncherGroup {
  id: string
  title: string
  variant: HomeLauncherGroupVariant
  launcherIds: string[]
}

/**
 * Home is intentionally structured as a few stable rows instead of an
 * auto-flowing grid. The order here is the visual order and the graph below
 * is the only source of truth for D-pad movement.
 */
export const homeLauncherGroups: HomeLauncherGroup[] = [
  {
    id: 'tv',
    title: 'TV',
    variant: 'channels',
    launcherIds: ['markiza', 'joj', 'jednotka', 'stvr-24', 'dajto', 'joj-plus', 'dvojka', 'stvr-sport'],
  },
  {
    id: 'discover',
    title: 'Objavovať',
    variant: 'categories',
    launcherIds: ['filmy', 'series', 'shows', 'hokej'],
  },
  {
    id: 'library',
    title: 'Aplikácie a knižnica',
    variant: 'utilities',
    launcherIds: ['joj-play', 'youtube', 'search', 'watchlist'],
  },
]

type HomeNavigation = Partial<Record<SpatialDirection, string>>

/**
 * Explicit Home graph matching the three rendered rows. Edges stop at the
 * dashboard boundary; there is no accidental wrap or geometry guessing.
 */
export const homeNavigation: Record<string, HomeNavigation> = {
  markiza: { right: 'joj', down: 'filmy' },
  joj: { left: 'markiza', right: 'jednotka', down: 'series' },
  jednotka: { left: 'joj', right: 'stvr-24', down: 'shows' },
  'stvr-24': { left: 'jednotka', right: 'dajto', down: 'hokej' },
  dajto: { left: 'stvr-24', right: 'joj-plus' },
  'joj-plus': { left: 'dajto', right: 'dvojka' },
  dvojka: { left: 'joj-plus', right: 'stvr-sport' },
  'stvr-sport': { left: 'dvojka' },
  filmy: { up: 'markiza', right: 'series', down: 'joj-play' },
  series: { up: 'joj', left: 'filmy', right: 'shows', down: 'youtube' },
  shows: { up: 'jednotka', left: 'series', right: 'hokej', down: 'search' },
  hokej: { up: 'stvr-24', left: 'shows', down: 'watchlist' },
  'joj-play': { up: 'filmy', right: 'youtube' },
  youtube: { up: 'series', left: 'joj-play', right: 'search' },
  search: { up: 'shows', left: 'youtube', right: 'watchlist' },
  watchlist: { up: 'hokej', left: 'search' },
}
