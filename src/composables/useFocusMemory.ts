import type { Launcher } from '../types'

let lastHomeLauncherId: string | null = null
const lastCollectionItemIds = new Map<string, string>()

export function rememberHomeLauncher(launcherId: string) {
  lastHomeLauncherId = launcherId
}

export function getHomeFocusIndex(launchers: Launcher[]) {
  if (!lastHomeLauncherId) return 0

  const rememberedIndex = launchers.findIndex((launcher) => launcher.id === lastHomeLauncherId)
  return rememberedIndex >= 0 ? rememberedIndex : 0
}

export function rememberCollectionItem(collectionKey: string, itemId: string) {
  lastCollectionItemIds.set(collectionKey, itemId)
}

export function getCollectionFocusIndex(collectionKey: string, itemIds: string[]) {
  const rememberedId = lastCollectionItemIds.get(collectionKey)
  if (!rememberedId) return 0

  const rememberedIndex = itemIds.indexOf(rememberedId)
  return rememberedIndex >= 0 ? rememberedIndex : 0
}
