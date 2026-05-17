<template>
  <USlideover
    v-model:open="isResultModalOpen"
    side="bottom"
    :ui="{
      content: 'rounded-t-2xl max-h-[90dvh] w-full max-w-app mx-auto',
      header: 'py-3',
      footer: footerClass
    }"
  >
    <template #title>
      <div class="flex flex-col gap-0.5">
        <span v-text="displayTitle" />
        <span
          v-if="translationLabel"
          class="text-xs font-normal text-muted"
          v-text="translationLabel"
        />
      </div>
    </template>

    <template #body>
      <div
        v-if="isBulkMode"
        class="flex flex-col gap-4"
      >
        <div
          v-for="(entry, i) in bulkEntryStates"
          :key="i"
          class="flex flex-col gap-1"
        >
          <span
            class="text-sm font-semibold text-default"
            v-text="entry.label"
          />
          <div
            v-if="entry.loading"
            class="flex flex-col gap-1.5"
          >
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-3/4" />
          </div>
          <VerseText
            v-else-if="entry.verses.length"
            :verses="entry.verses"
          />
        </div>
      </div>
      <div
        v-else
        class="flex flex-col gap-3"
      >
        <div
          v-if="isScriptureLoading"
          class="flex flex-col gap-2"
        >
          <USkeleton class="h-5 w-full" />
          <USkeleton class="h-5 w-full" />
          <USkeleton class="h-5 w-3/4" />
        </div>
        <VerseText
          v-else-if="verses.length"
          :verses="verses"
        />
        <UInput
          :model-value="resultURL ?? ''"
          size="sm"
          :ui="{ base: 'text-xs font-mono pr-10' }"
          readonly
          class="w-full"
          @focus="selectAll"
        >
          <template #trailing>
            <UButton
              icon="i-lucide-copy"
              :aria-label="$t('result_copy')"
              color="neutral"
              variant="link"
              size="xs"
              @click="copyURLOnly"
            />
          </template>
        </UInput>
      </div>
    </template>

    <template #footer>
      <UButton
        icon="i-lucide-share-2"
        :label="$t('result_share')"
        color="primary"
        variant="solid"
        size="lg"
        :disabled="isAnyLoading"
        class="flex-1 min-w-0 h-14 justify-center text-lg font-semibold"
        @click="share"
      />
      <UButton
        icon="i-lucide-copy"
        :label="$t('result_copy')"
        color="primary"
        variant="solid"
        size="lg"
        :disabled="isAnyLoading"
        class="flex-1 min-w-0 h-14 justify-center text-lg font-semibold"
        @click="copy"
      />
      <UButton
        v-if="isBulkMode"
        icon="i-lucide-presentation"
        :label="$t('result_ppt')"
        color="primary"
        variant="solid"
        size="lg"
        :disabled="isAnyLoading"
        class="flex-1 min-w-0 h-14 justify-center text-lg font-semibold"
        @click="openPPT"
      />
      <UButton
        v-else
        icon="i-lucide-external-link"
        :label="$t('result_open')"
        color="primary"
        variant="solid"
        size="lg"
        :disabled="isAnyLoading"
        class="flex-1 min-w-0 h-14 justify-center text-lg font-semibold"
        @click="open"
      />
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { TRANSLATIONS } from '~/constants/translations'

const {
  isResultModalOpen,
  isPPTModalOpen,
  resultURL,
  resultLabel,
  bulkResultEntries,
  bulkEntryStates
} = useAppState()
const { translationId, isVerseNumbersShown } = useSettings()

const { copyURL, shareURL, openURL } = useVerseActions()
const { t: $t } = useI18n()

const isBulkMode = computed(() => bulkResultEntries.value.length > 0)

const translationLabel = computed(() => {
  const tr = TRANSLATIONS.find(x => x.id === translationId.value)
  return tr ? getTranslationLabel(tr) : ''
})

const displayTitle = computed(() => (
  isBulkMode.value
    ? $t('bulk_result_title', { count: bulkResultEntries.value.length })
    : (resultLabel.value ?? '')
))

const footerClass = 'flex gap-2 pb-[max(env(safe-area-inset-bottom),16px)]'

const verses = ref<Verse[]>([])
const isScriptureLoading = ref(false)
let activeFetchToken = 0

const scripture = computed(() => formatVerses(verses.value, isVerseNumbersShown.value))

const isAnyLoading = computed(() => (
  isScriptureLoading.value
  || bulkEntryStates.value.some(e => e.loading)
))

async function fetchEntry(url: string): Promise<Verse[]> {
  try {
    const data = await $fetch<{ verses: Verse[] }>('/api/scripture', {
      query: { url }
    })
    return data.verses ?? []
  } catch {
    return []
  }
}

watch(
  () => [
    isResultModalOpen.value,
    resultURL.value,
    bulkResultEntries.value
  ] as const,
  ([open, url, bulk]) => {
    const token = ++activeFetchToken
    verses.value = []
    isScriptureLoading.value = false
    bulkEntryStates.value = []
    if (!open) return

    if (bulk.length > 0) {
      bulkEntryStates.value = bulk.map(b => ({ label: b.label, verses: [], loading: true }))
      bulk.forEach((entry, i) => {
        fetchEntry(entry.url).then((fetched) => {
          if (token !== activeFetchToken) return
          const state = bulkEntryStates.value[i]
          if (!state) return
          state.verses = fetched
          state.loading = false
        })
      })
      return
    }

    if (!url) return
    isScriptureLoading.value = true
    fetchEntry(url)
      .then((fetched) => {
        if (token === activeFetchToken) verses.value = fetched
      })
      .finally(() => {
        if (token === activeFetchToken) isScriptureLoading.value = false
      })
  }
)

function selectAll(e: FocusEvent) {
  (e.target as HTMLInputElement).select()
}

async function copyURLOnly() {
  if (resultURL.value) await copyURL(resultURL.value)
}

function buildShareText() {
  if (isBulkMode.value) {
    return bulkEntryStates.value
      .map((e) => {
        const text = formatVerses(e.verses, isVerseNumbersShown.value)
        return text ? `${e.label}\n${text}` : e.label
      })
      .join('\n\n')
  }
  if (!resultURL.value) return ''
  const parts: string[] = []
  if (resultLabel.value) parts.push(resultLabel.value)
  if (scripture.value) parts.push(scripture.value)
  parts.push(resultURL.value)
  return parts.join('\n')
}

async function share() {
  const text = buildShareText()
  if (!text) return
  const url = isBulkMode.value ? '' : (resultURL.value ?? '')
  const title = isBulkMode.value ? displayTitle.value : (resultLabel.value ?? '')
  await shareURL(url, title, text)
}
async function copy() {
  const text = buildShareText()
  if (text) await copyURL(text)
}
function open() {
  if (!resultURL.value) return
  openURL(resultURL.value)
  isResultModalOpen.value = false
}
function openPPT() {
  isPPTModalOpen.value = true
}
</script>
