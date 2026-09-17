import { readonly, ref } from 'vue'

export interface InputDiagnosticSnapshot {
  type: string
  key: string
  code: string
  keyCode: number
  which: number
  repeat: boolean
  target: string
  activeElement: string
  timestamp: string
}

const enabled =
  import.meta.env.DEV &&
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('debugInput') === '1'

const latestInput = ref<InputDiagnosticSnapshot | null>(null)
const latestPointer = ref<InputDiagnosticSnapshot | null>(null)

const describeElement = (element: Element | null) => {
  if (!element) return 'none'
  const id = element.id ? `#${element.id}` : ''
  const className = typeof element.className === 'string' && element.className ? `.${element.className.split(/\s+/).join('.')}` : ''
  return `${element.tagName.toLowerCase()}${id}${className}`
}

const toSnapshot = (event: Event): InputDiagnosticSnapshot => {
  const keyboardEvent = event as KeyboardEvent
  return {
    type: event.type,
    key: keyboardEvent.key ?? '',
    code: keyboardEvent.code ?? '',
    keyCode: keyboardEvent.keyCode ?? 0,
    which: keyboardEvent.which ?? 0,
    repeat: keyboardEvent.repeat ?? false,
    target: describeElement(event.target as Element | null),
    activeElement: describeElement(document.activeElement),
    timestamp: new Date().toISOString().slice(11, 23),
  }
}

export const inputDebugEnabled = enabled
export const inputDebugLatest = readonly(latestInput)
export const inputDebugLatestPointer = readonly(latestPointer)

export function installInputDiagnostics() {
  if (!enabled) return () => undefined

  let lastPointerLogAt = 0
  const logKeyboard = (event: Event) => {
    const snapshot = toSnapshot(event)
    latestInput.value = snapshot
    console.info('[TV Hub input]', snapshot)
  }
  const logFocus = (event: Event) => {
    const snapshot = toSnapshot(event)
    latestPointer.value = snapshot
    console.info('[TV Hub focus]', snapshot)
  }
  const logPointer = (event: Event) => {
    const now = performance.now()
    if (now - lastPointerLogAt < 250) return
    lastPointerLogAt = now
    const snapshot = toSnapshot(event)
    latestPointer.value = snapshot
    console.info('[TV Hub pointer]', snapshot)
  }

  window.addEventListener('keydown', logKeyboard, true)
  window.addEventListener('keyup', logKeyboard, true)
  window.addEventListener('keypress', logKeyboard, true)
  window.addEventListener('focusin', logFocus, true)
  window.addEventListener('focusout', logFocus, true)
  window.addEventListener('pointermove', logPointer, true)
  window.addEventListener('mousemove', logPointer, true)

  return () => {
    window.removeEventListener('keydown', logKeyboard, true)
    window.removeEventListener('keyup', logKeyboard, true)
    window.removeEventListener('keypress', logKeyboard, true)
    window.removeEventListener('focusin', logFocus, true)
    window.removeEventListener('focusout', logFocus, true)
    window.removeEventListener('pointermove', logPointer, true)
    window.removeEventListener('mousemove', logPointer, true)
  }
}
