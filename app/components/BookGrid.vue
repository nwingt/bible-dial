<template>
  <div class="flex flex-col gap-2 flex-1 min-h-0 justify-center">
    <div class="grid grid-cols-6 gap-1.5">
      <BookButton
        v-for="code in OT_BOOKS"
        :key="code"
        :code="code"
        @click="$emit('select', code)"
      />
    </div>

    <div class="grid grid-cols-6 gap-1.5">
      <BookButton
        v-for="code in NT_BOOKS"
        :key="code"
        :code="code"
        @click="$emit('select', code)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { OT_BOOKS, NT_BOOKS } from '~/constants/books'

defineEmits<{
  (e: 'select', code: string): void
}>()
</script>
