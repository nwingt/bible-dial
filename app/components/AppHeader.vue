<template>
  <header
    class="w-full flex items-center justify-between h-10 px-3"
    :style="{ paddingTop: 'max(env(safe-area-inset-top), 8px)' }"
  >
    <h1
      class="text-base font-semibold text-default"
      v-text="$t('app_title')"
    />
    <UButton
      icon="i-lucide-settings"
      color="neutral"
      variant="ghost"
      size="md"
      :aria-label="$t('settings_title')"
      @click="isSettingsDrawerOpen = true"
    />
  </header>
</template>

<script setup lang="ts">
const { isSettingsDrawerOpen } = useBibleSelection()
</script>
