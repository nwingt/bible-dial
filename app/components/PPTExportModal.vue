<template>
  <USlideover
    v-model:open="isPPTModalOpen"
    side="bottom"
    :ui="{
      content: 'rounded-t-2xl max-h-[90dvh] w-full max-w-app mx-auto',
      header: 'py-3',
      title: 'text-lg font-semibold',
      body: 'px-4 pt-2 flex flex-col gap-5',
      footer: 'grid grid-cols-1 gap-2 pb-[max(env(safe-area-inset-bottom),16px)]'
    }"
  >
    <template #title>
      <span v-text="$t('ppt_title')" />
    </template>

    <template #body>
      <section class="flex flex-col gap-2">
        <span
          class="text-sm font-semibold text-default"
          v-text="$t('ppt_background')"
        />
        <div class="flex gap-2 -mx-4 px-4 pb-1">
          <button
            type="button"
            :class="bgTileClass('none')"
            :aria-label="$t('ppt_no_background')"
            @click="selectNone"
          >
            <span class="absolute inset-0 flex items-center justify-center text-xs font-medium text-muted">
              {{ $t('ppt_no_background') }}
            </span>
          </button>
          <button
            type="button"
            :class="bgTileClass('upload')"
            :aria-label="$t('ppt_upload')"
            @click="triggerUpload"
          >
            <img
              v-if="uploadedSrc"
              :src="uploadedSrc"
              alt=""
              class="absolute inset-0 w-full h-full object-cover"
            >
            <span
              v-else
              class="absolute inset-0 flex flex-col items-center justify-center gap-1 text-muted"
            >
              <UIcon
                name="i-lucide-upload"
                class="size-5"
              />
              <span
                class="text-[10px] font-medium"
                v-text="$t('ppt_upload')"
              />
            </span>
          </button>
        </div>
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          class="hidden"
          @change="onFileChange"
        >
      </section>

      <section class="flex flex-col gap-2">
        <span
          class="text-sm font-semibold text-default"
          v-text="$t('ppt_text_color')"
        />
        <UPopover :content="{ align: 'start', side: 'top' }">
          <UButton
            color="neutral"
            variant="outline"
            size="lg"
            class="justify-start gap-3 h-12"
          >
            <span
              class="size-6 rounded-md border border-default shrink-0"
              :style="{ backgroundColor: textColor }"
            />
            <span
              class="font-mono text-sm uppercase"
              v-text="textColor"
            />
          </UButton>
          <template #content>
            <div class="p-3">
              <UColorPicker
                v-model="textColor"
                format="hex"
              />
            </div>
          </template>
        </UPopover>
      </section>
    </template>

    <template #footer>
      <UButton
        icon="i-lucide-download"
        :label="generating ? $t('ppt_generating') : $t('ppt_generate')"
        color="primary"
        variant="solid"
        size="lg"
        :disabled="generating || !hasReadyEntries"
        :loading="generating"
        block
        class="h-14 justify-center text-lg font-semibold"
        @click="onGenerate"
      />
    </template>
  </USlideover>
</template>

<script setup lang="ts">
type BgType = 'none' | 'upload'

const { isPPTModalOpen, bulkEntryStates } = useAppState()
const { generate } = usePPTExport()
const { t: $t } = useI18n()
const toast = useToast()

const selectedType = ref<BgType>('none')
const uploadedSrc = ref<string>('')
const textColor = ref<string>('#FFFFFF')
const generating = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

const hasReadyEntries = computed(() => bulkEntryStates.value.some(e => !e.loading && e.text))

function bgTileClass(type: BgType) {
  const base = 'relative shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-elevated border border-default transition-all'
  return type === selectedType.value
    ? `${base} ring-2 ring-primary ring-offset-2 ring-offset-default`
    : base
}

function selectNone() {
  selectedType.value = 'none'
}

function triggerUpload() {
  if (uploadedSrc.value) {
    selectedType.value = 'upload'
    return
  }
  fileInputRef.value?.click()
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onloadend = () => {
    uploadedSrc.value = reader.result as string
    selectedType.value = 'upload'
  }
  reader.readAsDataURL(file)
  input.value = ''
}

async function onGenerate() {
  if (generating.value) return
  const entries = bulkEntryStates.value
    .filter(e => !e.loading && e.text)
    .map(e => ({ label: e.label, text: e.text }))
  if (entries.length === 0) return

  const src = ((selectedType.value === 'upload') && uploadedSrc.value)
    ? uploadedSrc.value
    : undefined

  generating.value = true
  try {
    await generate(entries, {
      background: { type: selectedType.value, src },
      textColor: textColor.value,
      fileName: $t('ppt_default_filename')
    })
    isPPTModalOpen.value = false
  } catch (err) {
    console.error(err)
    toast.add({ title: $t('ppt_failed'), color: 'error' })
  } finally {
    generating.value = false
  }
}
</script>
