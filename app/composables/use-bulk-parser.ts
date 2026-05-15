import { USFM_KEY } from '~/constants/books'
import { LOCALIZED_BOOK_NAMES } from '~/constants/book-names'
import { CHAPTER_VERSES } from '~/constants/chapter-verses'

export interface BulkRef {
  url: string
  label: string
  raw: string
}

const SEGMENT_SPLIT = /[,，;；]/
const VERSE_PATTERN = /^(\d{1,3}(?::\d{1,3}(?:-\d{1,3})?)?)$/

function normalizeInput(s: string): string {
  return s
    .replace(/：/g, ':')
    .replace(/[－—–]/g, '-')
    .replace(/[０-９]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
}

interface BookName {
  name: string
  usfm: string
}

let BOOK_NAME_INDEX: BookName[] | null = null

function buildIndex(): BookName[] {
  const entries: BookName[] = []
  const seen = new Set<string>()
  for (const [usfm, names] of Object.entries(LOCALIZED_BOOK_NAMES)) {
    for (const name of names) {
      const norm = name.toLowerCase().trim()
      if (!norm) continue
      const dedupKey = `${norm}|${usfm}`
      if (seen.has(dedupKey)) continue
      seen.add(dedupKey)
      entries.push({ name: norm, usfm })
    }
  }
  entries.sort((a, b) => b.name.length - a.name.length)
  return entries
}

function getIndex(): BookName[] {
  if (!BOOK_NAME_INDEX) BOOK_NAME_INDEX = buildIndex()
  return BOOK_NAME_INDEX
}

function extractBook(segment: string): { usfm: string, rest: string } | null {
  const norm = segment.toLowerCase()
  for (const entry of getIndex()) {
    if (norm.startsWith(entry.name)) {
      return {
        usfm: entry.usfm,
        rest: segment.slice(entry.name.length).trimStart()
      }
    }
  }
  return null
}

function isValidRef(usfm: string, input: string): boolean {
  const [chPart = '', verseRange] = input.split(':')
  const chapter = parseInt(chPart, 10)
  if (!chapter) return false
  const chapters = CHAPTER_VERSES[usfm]
  if (!chapters || chapter > chapters.length) return false
  if (verseRange === undefined) return true
  const [startStr = '', endStr = ''] = verseRange.split('-')
  const start = parseInt(startStr, 10)
  const maxVerse = chapters[chapter - 1] ?? 0
  if (!start || start > maxVerse) return false
  if (endStr === '') return true
  const end = parseInt(endStr, 10)
  return ((end > start) && (end <= maxVerse))
}

export function useBulkParser() {
  const { buildBibleComURL } = useBibleComURL()
  const { t, te } = useI18n()

  function bookLabel(usfm: string) {
    const key = `book_name_${USFM_KEY[usfm]}`
    return te(key) ? t(key) : usfm
  }

  function parse(input: string, translationId: number): BulkRef[] {
    const results: BulkRef[] = []
    for (const line of normalizeInput(input).split(/\r?\n/)) {
      const segments = line.split(SEGMENT_SPLIT).map(s => s.trim()).filter(Boolean)
      let currentBook: string | null = null
      for (const raw of segments) {
        let ref = raw
        const matched = extractBook(ref)
        if (matched) {
          currentBook = matched.usfm
          ref = matched.rest
        }
        if (!currentBook || !ref) continue
        const m = ref.match(VERSE_PATTERN)
        if (!m) continue
        const refText = m[1]!
        if (!isValidRef(currentBook, refText)) continue
        const url = buildBibleComURL(currentBook, refText, translationId)
        if (!url) continue
        results.push({
          url,
          label: `${bookLabel(currentBook)} ${refText}`,
          raw
        })
      }
    }
    return results
  }

  return { parse }
}
