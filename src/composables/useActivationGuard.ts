const ACTIVATION_GUARD_MS = 400
let lastActivationAt = 0

/** Allows the first activation immediately and filters an accidental duplicate. */
export function allowActivation() {
  const now = Date.now()
  if (now - lastActivationAt < ACTIVATION_GUARD_MS) return false

  lastActivationAt = now
  return true
}
