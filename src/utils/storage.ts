type StorageKind = 'local' | 'session'

function getStorage(kind: StorageKind): Storage | null {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage
  } catch {
    return null
  }
}

export function readStoredValue(key: string, kind: StorageKind) {
  try {
    return getStorage(kind)?.getItem(key) ?? null
  } catch {
    return null
  }
}

export function writeStoredValue(key: string, value: string, kind: StorageKind) {
  try {
    getStorage(kind)?.setItem(key, value)
  } catch {
    // Storage is optional on some TV browsers and private contexts.
  }
}

export function readStoredJson<T>(key: string, kind: StorageKind, fallback: T): T {
  const value = readStoredValue(key, kind)
  if (!value) return fallback

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export function writeStoredJson<T>(key: string, value: T, kind: StorageKind) {
  try {
    writeStoredValue(key, JSON.stringify(value), kind)
  } catch {
    // Ignore serialization/storage failures and keep the app usable.
  }
}
