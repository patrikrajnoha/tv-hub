<script setup lang="ts">
import { inputDebugEnabled, inputDebugLatest, inputDebugLatestPointer } from '../composables/useInputDiagnostics'
</script>

<template>
  <aside v-if="inputDebugEnabled" class="input-debug-panel" aria-live="polite">
    <strong>Input debug</strong>
    <code v-if="inputDebugLatest">
      {{ inputDebugLatest.type }} {{ inputDebugLatest.key || '(no key)' }} / {{ inputDebugLatest.code || '(no code)' }}
      · keyCode {{ inputDebugLatest.keyCode }} / which {{ inputDebugLatest.which }} · repeat {{ inputDebugLatest.repeat }}
      · target {{ inputDebugLatest.target }} · active {{ inputDebugLatest.activeElement }} · {{ inputDebugLatest.timestamp }}
    </code>
    <code v-else>Waiting for keyboard input…</code>
    <small v-if="inputDebugLatestPointer">Last focus/pointer: {{ inputDebugLatestPointer.type }} → {{ inputDebugLatestPointer.target }}</small>
  </aside>
</template>
