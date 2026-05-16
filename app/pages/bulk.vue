<template>
  <div class="flex flex-col flex-1 min-h-0 gap-3 py-3">
    <h2
      class="text-lg font-semibold text-default"
      v-text="$t('bulk_title')"
    />
    <UTextarea
      v-model="text"
      :placeholder="$t('bulk_placeholder')"
      variant="ghost"
      autofocus
      :autofocus-delay="200"
      autoresize
      :rows="5"
      :maxrows="0"
      class="w-full"
      :ui="{ base: 'font-mono text-xl md:text-2xl leading-relaxed p-0 hover:bg-transparent focus:bg-transparent' }"
    />
    <UButton
      icon="i-lucide-corner-down-left"
      :label="$t('bulk_confirm')"
      color="primary"
      variant="solid"
      size="xl"
      :disabled="!text.trim()"
      block
      class="h-14 justify-center text-lg font-semibold"
      @click="submit"
    />
  </div>
</template>

<script setup lang="ts">
const {
  bulkResultEntries,
  isResultModalOpen,
  resultURL,
  resultLabel
} = useAppState()
const { translationId } = useSettings()
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
