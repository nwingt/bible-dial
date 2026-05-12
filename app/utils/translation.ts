import type { Translation } from '~/constants/translations'

export function getTranslationLabel(tr: Translation): string {
  return `${tr.label} (${tr.code})`
}
