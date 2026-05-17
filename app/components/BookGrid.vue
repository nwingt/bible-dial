<template>
  <div class="flex flex-col flex-1 min-h-0 justify-center">
    <div class="grid grid-cols-6 gap-1.5">
      <BookButton
        v-for="code in BOOKS"
        :key="code"
        :code="code"
        @click="$emit('select', code)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { BOOKS } from '~/constants/books'

defineEmits<{
  (e: 'select', code: string): void
}>()
</script>
