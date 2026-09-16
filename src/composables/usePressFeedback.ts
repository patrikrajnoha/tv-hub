import { onBeforeUnmount, ref } from 'vue'

const PRESS_FEEDBACK_MS = 100

export function usePressFeedback() {
  const isPressed = ref(false)
  let timer: number | undefined

  const press = () => {
    isPressed.value = true
    if (timer !== undefined) window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      isPressed.value = false
      timer = undefined
    }, PRESS_FEEDBACK_MS)
  }

  onBeforeUnmount(() => {
    if (timer !== undefined) window.clearTimeout(timer)
  })

  return { isPressed, press }
}
