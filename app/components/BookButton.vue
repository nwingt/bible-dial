<template>
  <button
    type="button"
    class="book-btn h-10 flex items-center justify-center rounded-lg font-semibold text-base select-none transition-transform active:scale-95"
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

const CATEGORY_CLASS: Record<CategoryId, string> = {
  law: 'bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:hover:bg-amber-500/25',
  otHistory: 'bg-orange-100 text-orange-900 hover:bg-orange-200 dark:bg-orange-500/15 dark:text-orange-200 dark:hover:bg-orange-500/25',
  wisdom: 'bg-rose-100 text-rose-900 hover:bg-rose-200 dark:bg-rose-500/15 dark:text-rose-200 dark:hover:bg-rose-500/25',
  majorProphets: 'bg-red-100 text-red-900 hover:bg-red-200 dark:bg-red-500/15 dark:text-red-200 dark:hover:bg-red-500/25',
  minorProphets: 'bg-lime-100 text-lime-900 hover:bg-lime-200 dark:bg-lime-500/15 dark:text-lime-200 dark:hover:bg-lime-500/25',
  gospels: 'bg-sky-100 text-sky-900 hover:bg-sky-200 dark:bg-sky-500/15 dark:text-sky-200 dark:hover:bg-sky-500/25',
  ntHistory: 'bg-cyan-100 text-cyan-900 hover:bg-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-200 dark:hover:bg-cyan-500/25',
  pauline: 'bg-indigo-100 text-indigo-900 hover:bg-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-200 dark:hover:bg-indigo-500/25',
  general: 'bg-violet-100 text-violet-900 hover:bg-violet-200 dark:bg-violet-500/15 dark:text-violet-200 dark:hover:bg-violet-500/25',
  prophecy: 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:hover:bg-emerald-500/25'
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
