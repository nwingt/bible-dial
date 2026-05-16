<template>
  <USlideover
    v-model:open="isHistoryDrawerOpen"
    side="right"
    :title="$t('history_title')"
    :ui="{
      content: 'max-w-[320px]',
      header: 'relative mt-[max(env(safe-area-inset-top),14px)]',
      title: 'flex items-center gap-1',
      body: '!p-0'
    }"
  >
    <template #title>
      <span
        class="text-lg font-semibold"
        v-text="$t('history_title')"
      />
      <UButton
        v-if="entries.length"
        icon="i-lucide-trash-2"
        :aria-label="$t('history_clear')"
        color="neutral"
        variant="ghost"
        size="sm"
        @click="clear"
      />
    </template>

    <template #body>
      <div
        v-if="!entries.length"
        class="flex flex-col items-center justify-center h-full text-muted px-6 py-12 text-center"
      >
        <UIcon
          name="i-lucide-history"
          class="size-8 mb-2"
        />
        <span
          class="text-sm"
          v-text="$t('history_empty')"
        />
      </div>
      <ul
        v-else
        class="divide-y divide-default"
      >
        <li
          v-for="entry in entries"
          :key="entry.id"
          class="flex items-center gap-2 sm:px-6 p-4 active:bg-elevated cursor-pointer"
          @click="openEntry(entry)"
        >
          <div class="flex-1 min-w-0 flex flex-col gap-0.5">
            <span
              class="text-base font-medium text-default truncate"
              v-text="entry.label"
            />
            <span
              v-if="translationLabel(entry.translationId)"
              class="text-xs text-muted truncate"
              v-text="translationLabel(entry.translationId)"
            />
          </div>
          <UButton
            class="-mr-1"
            icon="i-lucide-trash-2"
            :aria-label="$t('history_remove')"
            color="neutral"
            variant="ghost"
            size="xs"
            @click.stop="remove(entry.id)"
          />
        </li>
      </ul>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { TRANSLATIONS } from '~/constants/translations'
import type { DialHistoryEntry } from '~/composables/use-dial-history'

const {
  isHistoryDrawerOpen,
  isResultModalOpen,
  resultURL,
  resultLabel,
  bulkResultEntries
} = useAppState()
const { entries, remove, clear } = useDialHistory()

function translationLabel(id: number) {
  const tr = TRANSLATIONS.find(x => x.id === id)
  return tr ? getTranslationLabel(tr) : ''
}

function openEntry(entry: DialHistoryEntry) {
  bulkResultEntries.value = []
  resultURL.value = entry.url
  resultLabel.value = entry.label
  isHistoryDrawerOpen.value = false
  isResultModalOpen.value = true
}
</script>
