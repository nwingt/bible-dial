import { CHAPTER_VERSES } from '~/constants/chapter-verses'

export function useChapterVerses() {
  function chaptersInBook(book: string | null): number {
    return book ? (CHAPTER_VERSES[book]?.length ?? 0) : 0
  }

  function versesInChapter(book: string | null, chapter: number): number {
    if (!book || !Number.isFinite(chapter) || chapter < 1) return 0
    return CHAPTER_VERSES[book]?.[chapter - 1] ?? 0
  }

  function validPrefixSet(min: number, max: number): Set<string> {
    const set = new Set<string>()
    if (min < 1 || max < min) return set
    for (let n = min; n <= max; n++) {
      const s = String(n)
      for (let i = 1; i <= s.length; i++) set.add(s.slice(0, i))
    }
    return set
  }

  return { chaptersInBook, versesInChapter, validPrefixSet }
}
