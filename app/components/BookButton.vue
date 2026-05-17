<template>
  <button
    type="button"
    class="book-btn h-11 flex items-center justify-center rounded-lg font-semibold text-base select-none transition-transform active:scale-95"
    :class="colorClass"
    v-text="label"
  />
</template>

<script setup lang="ts">
import { getCategory, USFM_KEY, type CategoryId } from '~/constants/books'

const props = defineProps<{
  code: string
}>()

const { t, te } = useI18n()

const label = computed(() => {
  const key = `book_name_abbv_${USFM_KEY[props.code]}`
  return te(key) ? t(key) : props.code
})

// OT: solid fills. NT: UButton-style `subtle` variant (faint fill + inset ring).
const CATEGORY_CLASS: Record<CategoryId, string> = {
  law: 'bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:hover:bg-amber-500/25',
  otHistory: 'bg-orange-100 text-orange-900 hover:bg-orange-200 dark:bg-orange-500/15 dark:text-orange-200 dark:hover:bg-orange-500/25',
  wisdom: 'bg-rose-100 text-rose-900 hover:bg-rose-200 dark:bg-rose-500/15 dark:text-rose-200 dark:hover:bg-rose-500/25',
  majorProphets: 'bg-red-100 text-red-900 hover:bg-red-200 dark:bg-red-500/15 dark:text-red-200 dark:hover:bg-red-500/25',
  minorProphets: 'bg-lime-100 text-lime-900 hover:bg-lime-200 dark:bg-lime-500/15 dark:text-lime-200 dark:hover:bg-lime-500/25',
  gospels: 'bg-sky-500/10 text-sky-700 ring ring-inset ring-sky-500/25 hover:bg-sky-500/15 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/25 dark:hover:bg-sky-400/15',
  ntHistory: 'bg-cyan-500/10 text-cyan-700 ring ring-inset ring-cyan-500/25 hover:bg-cyan-500/15 dark:bg-cyan-400/10 dark:text-cyan-300 dark:ring-cyan-400/25 dark:hover:bg-cyan-400/15',
  pauline: 'bg-indigo-500/10 text-indigo-700 ring ring-inset ring-indigo-500/25 hover:bg-indigo-500/15 dark:bg-indigo-400/10 dark:text-indigo-300 dark:ring-indigo-400/25 dark:hover:bg-indigo-400/15',
  general: 'bg-violet-500/10 text-violet-700 ring ring-inset ring-violet-500/25 hover:bg-violet-500/15 dark:bg-violet-400/10 dark:text-violet-300 dark:ring-violet-400/25 dark:hover:bg-violet-400/15',
  prophecy: 'bg-emerald-500/10 text-emerald-700 ring ring-inset ring-emerald-500/25 hover:bg-emerald-500/15 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/25 dark:hover:bg-emerald-400/15'
}

const colorClass = computed(() => {
  const cat = getCategory(props.code)
  return cat ? CATEGORY_CLASS[cat] : 'bg-elevated text-default'
})
</script>

<style scoped>
.book-btn {
  min-width: 0;
  padding: 2px;
  line-height: 1;
  word-break: keep-all;
}
</style>
