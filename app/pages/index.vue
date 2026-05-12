<template>
  <div class="flex flex-col flex-1 min-h-0">
    <BookGrid @select="openNumpadModal" />

    <NumpadModal />
    <ResultModal />
    <SettingsDrawer />
  </div>
</template>

<script setup lang="ts">
const { openNumpadModal } = useBibleSelection()
</script>
