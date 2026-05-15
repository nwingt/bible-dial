<template>
  <div class="flex flex-col flex-1 min-h-0 gap-3 py-3">
    <div class="flex items-center justify-between gap-2">
      <h2
        class="text-lg font-semibold text-default"
        v-text="$t('bulk_title')"
      />
      <UButton
        icon="i-lucide-corner-down-left"
        :label="$t('bulk_confirm')"
        color="primary"
        variant="solid"
        size="lg"
        :disabled="!text.trim()"
        @click="submit"
      />
    </div>
    <UTextarea
      v-model="text"
      :placeholder="$t('bulk_placeholder')"
      variant="ghost"
      autofocus
      :autofocus-delay="200"
      autoresize
      :rows="6"
      :maxrows="0"
      class="w-full"
      :ui="{ base: 'font-mono text-sm leading-relaxed p-0 hover:bg-transparent focus:bg-transparent' }"
    />
  </div>
</template>

<script setup lang="ts">
const {
  bulkResultEntries,
  isResultModalOpen,
  resultURL,
  resultLabel,
  translationId
} = useBibleSelection()
const { parse } = useBulkParser()
const toast = useToast()
const { t } = useI18n()

const text = useState<string>('bible_dial_bulk_input', () => '')

function submit() {
  const entries = parse(text.value, translationId.value)
  if (entries.length === 0) {
    toast.add({
      title: t('bulk_empty'),
      color: 'error',
      icon: 'i-lucide-x'
    })
    return
  }
  resultURL.value = null
  resultLabel.value = null
  bulkResultEntries.value = entries.map(e => ({ url: e.url, label: e.label }))
  isResultModalOpen.value = true
}
</script>
