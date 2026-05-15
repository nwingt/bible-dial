<template>
  <USlideover
    v-model:open="isSettingsDrawerOpen"
    side="right"
    :title="$t('settings_title')"
    :ui="{ content: 'max-w-[320px]' }"
  >
    <template #body>
      <div class="flex flex-col gap-6 py-2">
        <UFormField
          :label="$t('settings_translation')"
          size="lg"
        >
          <USelectMenu
            v-model="selectedTranslation"
            :items="translationItems"
            value-key="value"
            class="w-full"
          />
        </UFormField>

        <UFormField
          :label="$t('settings_language')"
          size="lg"
        >
          <USelectMenu
            v-model="selectedLocale"
            :items="localeItems"
            value-key="value"
            class="w-full"
          />
        </UFormField>

        <UFormField
          :label="$t('settings_quick_mode')"
          size="lg"
        >
          <USwitch v-model="quickMode" />
        </UFormField>

        <UFormField
          :label="$t('settings_verse_numbers')"
          size="lg"
        >
          <USwitch v-model="showVerseNumbers" />
        </UFormField>

        <UFormField
          :label="$t('settings_color_mode')"
          size="lg"
        >
          <UColorModeButton />
        </UFormField>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { TRANSLATIONS } from '~/constants/translations'

const { isSettingsDrawerOpen, translationId, quickMode, showVerseNumbers } = useBibleSelection()
const { locale, locales, setLocale } = useI18n()

const translationItems = computed(() =>
  TRANSLATIONS.map(tr => ({ label: getTranslationLabel(tr), value: tr.id }))
)

const localeItems = computed(() =>
  (locales.value as Array<{ code: string, name?: string }>).map(l => ({
    label: l.name ?? l.code,
    value: l.code
  }))
)

const selectedTranslation = computed({
  get: () => translationId.value,
  set: (v: number) => { translationId.value = v }
})

const selectedLocale = computed({
  get: () => locale.value,
  set: (v: string) => { setLocale(v as typeof locale.value) }
})
</script>
