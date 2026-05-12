import { TRANSLATIONS } from '~/constants/translations'

export function useBibleComURL() {
  function buildBibleComURL(
    book: string,
    input: string,
    translationId: number
  ): string | null {
    const t = TRANSLATIONS.find(x => x.id === translationId)
    if (!t) return null
    if (!/^\d{1,3}(:\d{1,3}(-\d{1,3})?)?$/.test(input)) return null
    const path = input.replace(':', '.')
    return `https://www.bible.com/bible/${t.id}/${book}.${path}`
  }

  return { buildBibleComURL }
}
