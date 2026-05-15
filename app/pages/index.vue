<template>
  <div class="flex flex-col flex-1 min-h-0">
    <BookGrid @select="openNumpadModal" />
  </div>
</template>

<script setup lang="ts">
const { openNumpadModal } = useBibleSelection()
</script>
