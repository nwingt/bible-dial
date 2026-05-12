<template>
  <USlideover
    v-model:open="isResultModalOpen"
    side="bottom"
    :ui="{
      content: 'rounded-t-2xl max-h-[90dvh] w-full max-w-app mx-auto',
      header: 'py-3',
      footer: 'grid grid-cols-3 gap-2 pb-[max(env(safe-area-inset-bottom),16px)]'
    }"
  >
    <template #title>
      <div class="flex flex-col gap-0.5">
        <span v-text="resultLabel" />
        <span
          v-if="translationLabel"
          class="text-xs font-normal text-muted"
          v-text="translationLabel"
        />
      </div>
    </template>

    <template #body>
      <div class="flex flex-col gap-3">
        <div
          v-if="isScriptureLoading"
          class="flex flex-col gap-2"
        >
          <USkeleton class="h-5 w-full" />
          <USkeleton class="h-5 w-full" />
          <USkeleton class="h-5 w-3/4" />
        </div>
        <p
          v-else-if="scripture"
          class="text-base text-default leading-relaxed whitespace-pre-line"
          v-text="scripture"
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
        block
        class="h-14 justify-center text-lg font-semibold"
        @click="share"
      />
      <UButton
        icon="i-lucide-copy"
        :label="$t('result_copy')"
        color="primary"
        variant="solid"
        size="lg"
        block
        class="h-14 justify-center text-lg font-semibold"
        @click="copy"
      />
      <UButton
        icon="i-lucide-external-link"
        :label="$t('result_open')"
        color="primary"
        variant="solid"
        size="lg"
        block
        class="h-14 justify-center text-lg font-semibold"
        @click="open"
      />
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { TRANSLATIONS } from '~/constants/translations'

const {
  isResultModalOpen,
  resultURL,
  resultLabel,
  translationId
} = useBibleSelection()

const { copyURL, shareURL, openURL } = useVerseActions()

const translationLabel = computed(() => {
  const tr = TRANSLATIONS.find(x => x.id === translationId.value)
  return tr ? getTranslationLabel(tr) : ''
})

const scripture = ref('')
const isScriptureLoading = ref(false)
let activeFetchToken = 0

watch(
  () => [isResultModalOpen.value, resultURL.value] as const,
  async ([open, url]) => {
    const token = ++activeFetchToken
    scripture.value = ''
    isScriptureLoading.value = false
    if (!open || !url) return
    isScriptureLoading.value = true
    try {
      const data = await $fetch<{ description: string | null }>('/api/scripture', {
        query: { url }
      })
      if (token === activeFetchToken) {
        scripture.value = data.description ?? ''
      }
    } catch {
      // silent fallback to URL-only
    } finally {
      if (token === activeFetchToken) isScriptureLoading.value = false
    }
  }
)

function selectAll(e: FocusEvent) {
  (e.target as HTMLInputElement).select()
}

async function copyURLOnly() {
  if (resultURL.value) await copyURL(resultURL.value)
}

function buildShareText() {
  if (!resultURL.value) return ''
  const parts: string[] = []
  if (resultLabel.value) parts.push(resultLabel.value)
  if (scripture.value) parts.push(scripture.value)
  parts.push(resultURL.value)
  return parts.join('\n')
}

async function share() {
  if (!resultURL.value) return
  await shareURL(resultURL.value, resultLabel.value ?? '', buildShareText())
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
</script>
