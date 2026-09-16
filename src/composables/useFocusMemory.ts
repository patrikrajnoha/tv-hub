import type { Launcher } from '../types'
import { readStoredJson, readStoredValue, writeStoredJson, writeStoredValue } from '../utils/storage'

const HOME_FOCUS_KEY = 'tv-hub.home-focus'
const NAVIGATION_STATE_KEY = 'tv-hub.navigation-state'

interface CollectionState {
  itemId?: string
  scrollTop?: number
}

interface NavigationState {
  route?: string
  homeLauncherId?: string
  collections?: Record<string, CollectionState>
}

const initialNavigationState = readStoredJson<NavigationState>(NAVIGATION_STATE_KEY, 'session', {})
let lastHomeLauncherId: string | null = readStoredValue(HOME_FOCUS_KEY, 'local')
  ?? initialNavigationState.homeLauncherId
const lastCollectionItemIds = new Map<string, string>()

for (const [collectionKey, state] of Object.entries(initialNavigationState.collections ?? {})) {
  if (state.itemId) lastCollectionItemIds.set(collectionKey, state.itemId)
}

function updateNavigationState(update: Partial<NavigationState>) {
  const current = readStoredJson<NavigationState>(NAVIGATION_STATE_KEY, 'session', initialNavigationState)
  writeStoredJson(NAVIGATION_STATE_KEY, { ...current, ...update }, 'session')
}

export function rememberHomeLauncher(launcherId: string) {
  lastHomeLauncherId = launcherId
  writeStoredValue(HOME_FOCUS_KEY, launcherId, 'local')
  updateNavigationState({ homeLauncherId: launcherId })
}

export function getHomeFocusIndex(launchers: Launcher[]) {
  if (!lastHomeLauncherId) return 0

  const rememberedIndex = launchers.findIndex((launcher) => launcher.id === lastHomeLauncherId)
  return rememberedIndex >= 0 ? rememberedIndex : 0
}

export function rememberCollectionItem(collectionKey: string, itemId: string) {
  lastCollectionItemIds.set(collectionKey, itemId)
  const state = readStoredJson<NavigationState>(NAVIGATION_STATE_KEY, 'session', initialNavigationState)
  writeStoredJson(
    NAVIGATION_STATE_KEY,
    {
      ...state,
      collections: {
        ...state.collections,
        [collectionKey]: { ...state.collections?.[collectionKey], itemId },
      },
    },
    'session',
  )
}

export function getCollectionFocusIndex(collectionKey: string, itemIds: string[]) {
  const rememberedId = lastCollectionItemIds.get(collectionKey)
  if (!rememberedId) return 0

  const rememberedIndex = itemIds.indexOf(rememberedId)
  return rememberedIndex >= 0 ? rememberedIndex : 0
}

export function rememberCollectionScroll(collectionKey: string, scrollTop: number) {
  const state = readStoredJson<NavigationState>(NAVIGATION_STATE_KEY, 'session', initialNavigationState)
  writeStoredJson(
    NAVIGATION_STATE_KEY,
    {
      ...state,
      collections: {
        ...state.collections,
        [collectionKey]: { ...state.collections?.[collectionKey], scrollTop },
      },
    },
    'session',
  )
}

export function getCollectionScroll(collectionKey: string) {
  const state = readStoredJson<NavigationState>(NAVIGATION_STATE_KEY, 'session', initialNavigationState)
  return state.collections?.[collectionKey]?.scrollTop ?? 0
}

export function rememberActiveRoute(route: string) {
  updateNavigationState({ route })
}
