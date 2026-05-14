<template>
  <USlideover
    v-model:open="isNumpadModalOpen"
    side="bottom"
    :close="false"
    :ui="{
      content: 'rounded-t-2xl max-h-[90dvh] w-full max-w-app mx-auto',
      header: 'py-3 justify-center',
      title: 'text-center w-full text-lg font-semibold',
      body: 'px-4 pt-2 pb-[max(env(safe-area-inset-bottom),16px)]'
    }"
  >
    <template #title>
      <span
        class="block text-center w-full"
        v-text="bookFullLabel"
      />
    </template>

    <template #body>
      <div class="flex flex-col gap-3">
        <div class="relative h-14 flex items-center justify-center rounded-lg bg-elevated px-3 select-none">
          <span class="text-2xl font-mono tabular-nums tracking-wider">
            <template v-if="inputText">
              <span
                class="text-primary"
                v-text="inputText"
              />
              <span
                v-if="inputHint"
                class="text-muted"
                v-text="inputHint"
              />
            </template>
            <span
              v-else
              class="text-muted"
              v-text="'1:1'"
            />
          </span>
          <UButton
            :icon="inputText ? 'i-lucide-delete' : 'i-lucide-x'"
            :aria-label="inputText ? 'Backspace' : $t('numpad_cancel')"
            color="neutral"
            variant="link"
            size="xl"
            class="absolute right-2 top-1/2 -translate-y-1/2"
            @click="inputText ? backspace() : closeNumpadModal()"
          />
        </div>

        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="n in ['7', '8', '9', '4', '5', '6', '1', '2', '3']"
            :key="n"
            type="button"
            :disabled="disabledDigits.has(n)"
            :class="numKeyDigit"
            @click="appendDigit(n)"
            v-text="disabledDigits.has(n) ? '' : n"
          />

          <button
            type="button"
            :disabled="colonDisabled"
            :class="numKeyAlt"
            @click="appendColon"
            v-text="colonDisabled ? '' : ':'"
          />
          <button
            type="button"
            :disabled="disabledDigits.has('0')"
            :class="numKeyDigit"
            @click="appendDigit('0')"
            v-text="disabledDigits.has('0') ? '' : '0'"
          />
          <button
            type="button"
            :disabled="dashDisabled"
            :class="numKeyAlt"
            @click="appendDash"
            v-text="dashDisabled ? '' : '−'"
          />
        </div>

        <div
          class="mt-1"
          :class="quickMode ? 'grid grid-cols-3 gap-2' : ''"
        >
          <template v-if="quickMode">
            <UButton
              icon="i-lucide-share-2"
              :label="$t('result_share')"
              color="primary"
              variant="solid"
              size="lg"
              :disabled="!isQuickActionable"
              block
              class="h-14 justify-center text-lg font-semibold"
              @click="quickShare"
            />
            <UButton
              icon="i-lucide-copy"
              :label="$t('result_copy')"
              color="primary"
              variant="solid"
              size="lg"
              :disabled="!isQuickActionable"
              block
              class="h-14 justify-center text-lg font-semibold"
              @click="quickCopy"
            />
            <UButton
              icon="i-lucide-external-link"
              :label="$t('result_open')"
              color="primary"
              variant="solid"
              size="lg"
              :disabled="!isQuickActionable"
              block
              class="h-14 justify-center text-lg font-semibold"
              @click="quickOpen"
            />
          </template>
          <UButton
            v-else
            icon="i-lucide-corner-down-left"
            :label="$t('numpad_enter')"
            color="primary"
            variant="solid"
            size="lg"
            :disabled="!isQuickActionable"
            block
            class="h-14 justify-center text-lg font-semibold"
            @click="submit"
          />
        </div>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { USFM_KEY } from '~/constants/books'

const {
  activeBook,
  inputText,
  isNumpadModalOpen,
  isResultModalOpen,
  translationId,
  quickMode,
  resultURL,
  resultLabel,
  closeNumpadModal,
  appendDigit,
  appendColon,
  appendDash,
  backspace,
  isInputValid
} = useBibleSelection()

const { buildBibleComURL } = useBibleComURL()
const { chaptersInBook, versesInChapter, validPrefixSet } = useChapterVerses()
const { copyURL, shareURL, openURL } = useVerseActions()
const { record: recordHistory } = useDialHistory()
const { t, te } = useI18n()

const bookFullLabel = computed(() => {
  if (!activeBook.value) return ''
  const key = `book_name_${USFM_KEY[activeBook.value]}`
  return te(key) ? t(key) : activeBook.value
})

const parsed = computed(() => {
  const v = inputText.value
  const [chapterPart = '', verseRange] = v.split(':')
  const [startStr = '', endStr = ''] = (verseRange ?? '').split('-')
  return {
    raw: v,
    hasColon: v.includes(':'),
    hasDash: v.includes('-'),
    chapter: chapterPart ? parseInt(chapterPart, 10) : NaN,
    startVerse: startStr ? parseInt(startStr, 10) : NaN,
    endSeg: endStr,
    verseSeg: startStr,
    chapterSeg: chapterPart
  }
})

const ALL_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const

const disabledDigits = computed(() => {
  const book = activeBook.value
  const p = parsed.value
  if (!book) return new Set<string>(ALL_DIGITS)

  let min: number, max: number, seg: string

  if (!p.hasColon) {
    min = 1
    max = chaptersInBook(book)
    seg = p.chapterSeg
  } else if (!p.hasDash) {
    if (!p.chapter) return new Set<string>(ALL_DIGITS)
    min = 1
    max = versesInChapter(book, p.chapter)
    seg = p.verseSeg
  } else {
    if (!p.chapter || !p.startVerse) return new Set<string>(ALL_DIGITS)
    min = p.startVerse + 1
    max = versesInChapter(book, p.chapter)
    if (min > max) return new Set<string>(ALL_DIGITS)
    seg = p.endSeg
  }

  const valid = validPrefixSet(min, max)
  const disabled = new Set<string>()
  for (const d of ALL_DIGITS) {
    if (!valid.has(seg + d)) disabled.add(d)
  }
  return disabled
})

const colonDisabled = computed(() => {
  const p = parsed.value
  if (!p.raw || p.hasColon || p.hasDash) return true
  return !p.chapter
})

const dashDisabled = computed(() => {
  const p = parsed.value
  if (!p.hasColon || p.hasDash || p.raw.endsWith(':')) return true
  if (!p.chapter || !p.startVerse) return true
  return p.startVerse >= versesInChapter(activeBook.value, p.chapter)
})

const numKeyBase = 'h-14 rounded-xl text-2xl font-semibold transition-colors disabled:opacity-40 select-none flex items-center justify-center'
const numKeyDigit = `${numKeyBase} bg-primary-100 text-primary-900 active:bg-primary-200 dark:bg-primary-500/15 dark:text-primary-200 dark:active:bg-primary-500/25`
const numKeyAlt = `${numKeyBase} bg-amber-100 text-amber-900 active:bg-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:active:bg-amber-500/25`

const inputHint = computed(() => {
  const v = inputText.value
  if (!v) return ''
  if (v.endsWith(':')) return '1'
  if (v.endsWith('-')) {
    const start = parsed.value.startVerse
    return start ? String(start + 1) : ''
  }
  return parsed.value.hasColon ? '' : ':1'
})

const isQuickActionable = computed(() => (
  !inputText.value
  || !!inputHint.value
  || isInputValid.value
))

const isTerminalInput = computed(() => (
  isQuickActionable.value
  && (disabledDigits.value.size === 10)
  && colonDisabled.value
  && dashDisabled.value
))

watch(
  () => (isNumpadModalOpen.value && !quickMode.value && isTerminalInput.value),
  (terminal) => {
    if (terminal) submit()
  }
)

function buildResult(input: string) {
  if (!activeBook.value) return null
  const normalized = input.replace(/:$/, '')
  const url = buildBibleComURL(activeBook.value, normalized, translationId.value)
  if (!url) return null
  return { url, title: `${bookFullLabel.value} ${normalized}` }
}

function buildResolved() {
  if (!isQuickActionable.value) return null
  const v = inputText.value || '1:1'
  return buildResult(v + inputHint.value)
}

function commitHistory(r: { url: string, title: string }) {
  recordHistory({
    url: r.url,
    label: r.title,
    translationId: translationId.value
  })
}

function submit() {
  const r = buildResolved()
  if (!r) return
  commitHistory(r)
  resultURL.value = r.url
  resultLabel.value = r.title
  closeNumpadModal()
  isResultModalOpen.value = true
}

async function quickShare() {
  const r = buildResolved()
  if (!r) return
  commitHistory(r)
  await shareURL(r.url, r.title)
  closeNumpadModal()
}

async function quickCopy() {
  const r = buildResolved()
  if (!r) return
  commitHistory(r)
  await copyURL(r.url)
  closeNumpadModal()
}

function quickOpen() {
  const r = buildResolved()
  if (!r) return
  commitHistory(r)
  openURL(r.url)
  closeNumpadModal()
}
</script>
