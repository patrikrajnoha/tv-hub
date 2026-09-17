<script setup lang="ts">
import InputDiagnostics from './components/InputDiagnostics.vue'
import { installInputDiagnostics } from './composables/useInputDiagnostics'

installInputDiagnostics()
</script>

<template>
  <InputDiagnostics />
  <RouterView v-slot="{ Component, route }">
    <Transition name="page" mode="out-in">
      <component :is="Component" :key="route.fullPath" />
    </Transition>
  </RouterView>
</template>
