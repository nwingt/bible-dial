export interface Verse {
  number: number
  text: string
}

export function formatVerses(verses: Verse[], withNumbers: boolean): string {
  if (verses.length === 0) return ''
  if (!withNumbers || (verses.length === 1)) {
    return verses.map(v => v.text).join(' ')
  }
  return verses.map(v => `${v.number} ${v.text}`).join(' ')
}
