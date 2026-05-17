import { DEFAULT_TRANSLATION_ID } from '~/constants/translations'

export function useSettings() {
  const translationId = useCookie<number>('bible_dial_translation', {
    default: () => DEFAULT_TRANSLATION_ID,
    watch: true,
    sameSite: 'lax'
  })

  const quickMode = useCookie<boolean>('bible_dial_quick_mode', {
    default: () => false,
    watch: true,
    sameSite: 'lax'
  })

  const isVerseNumbersShown = useCookie<boolean>('bible_dial_verse_numbers', {
    default: () => false,
    watch: true,
    sameSite: 'lax'
  })

  return {
    translationId,
    quickMode,
    isVerseNumbersShown
  }
}
