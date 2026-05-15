const META_DESCRIPTION = /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i

const URL_PATTERN = /^https:\/\/www\.bible\.com\/bible\/(\d+)\/([A-Z0-9]+)\.(\d+)(?:\.(\d+)(?:-(\d+))?)?$/

const VERSE_OPEN = /<span\b[^>]*\bdata-usfm="([^"]+)"[^>]*\bclass="[^"]*__verse"[^>]*>/g
const SPAN_TAG = /<\/?span\b[^>]*>/g
const ANY_TAG = /<\/?(\w+)\b([^>]*)>/g

const SKIP_CLASS_SUFFIXES = ['__label', '__note']

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&quot;': '"',
  '&#39;': '\'',
  '&apos;': '\'',
  '&lt;': '<',
  '&gt;': '>',
  '&nbsp;': ' '
}

function decodeEntities(s: string) {
  return s.replace(/&(?:amp|quot|#39|apos|lt|gt|nbsp);/g, m => ENTITIES[m] ?? m)
}

interface ParsedURL {
  trId: string
  book: string
  chapter: number
  start: number | null
  end: number | null
}

function parseURL(url: string): ParsedURL | null {
  const m = url.match(URL_PATTERN)
  if (!m) return null
  return {
    trId: m[1]!,
    book: m[2]!,
    chapter: parseInt(m[3]!, 10),
    start: m[4] ? parseInt(m[4], 10) : null,
    end: m[5] ? parseInt(m[5], 10) : null
  }
}

async function fetchHTML(url: string): Promise<string | null> {
  try {
    return await $fetch<string>(url, {
      responseType: 'text',
      headers: { 'User-Agent': 'Mozilla/5.0 (BibleDial)' }
    })
  } catch {
    return null
  }
}

function findVerseInnerRange(html: string, openEnd: number): number {
  let depth = 1
  const re = new RegExp(SPAN_TAG.source, 'g')
  re.lastIndex = openEnd
  let t: RegExpExecArray | null
  while ((t = re.exec(html)) !== null) {
    if (t[0].startsWith('</')) {
      depth--
      if (depth === 0) return t.index
    } else {
      depth++
    }
  }
  return -1
}

function extractVerseText(html: string, innerStart: number, innerEnd: number): string {
  const re = new RegExp(ANY_TAG.source, 'g')
  re.lastIndex = innerStart
  let skipDepth = 0
  let cursor = innerStart
  const parts: string[] = []

  let t: RegExpExecArray | null
  while ((t = re.exec(html)) !== null) {
    if (t.index >= innerEnd) break
    if (cursor < t.index && skipDepth === 0) {
      parts.push(html.slice(cursor, t.index))
    }
    cursor = t.index + t[0].length

    if (t[1] !== 'span') continue
    const isClose = t[0].startsWith('</')
    if (isClose) {
      if (skipDepth > 0) skipDepth--
      continue
    }
    if (skipDepth > 0) {
      skipDepth++
      continue
    }
    const classMatch = t[2]!.match(/\bclass="([^"]*)"/)
    const classes = classMatch?.[1] ?? ''
    if (SKIP_CLASS_SUFFIXES.some(suf => classes.endsWith(suf))) {
      skipDepth = 1
    }
  }
  if (cursor < innerEnd && skipDepth === 0) {
    parts.push(html.slice(cursor, innerEnd))
  }

  return decodeEntities(parts.join('')).replace(/\s+/g, ' ').trim()
}

function extractChapterVerses(html: string): Map<string, string[]> {
  const result = new Map<string, string[]>()
  const re = new RegExp(VERSE_OPEN.source, 'g')
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    const usfm = m[1]!
    const innerStart = m.index + m[0].length
    const innerEnd = findVerseInnerRange(html, innerStart)
    if (innerEnd < 0) continue
    re.lastIndex = innerEnd
    const text = extractVerseText(html, innerStart, innerEnd)
    if (!text) continue
    const arr = result.get(usfm) ?? []
    arr.push(text)
    result.set(usfm, arr)
  }
  return result
}

function assembleVerses(
  verses: Map<string, string[]>,
  prefix: string,
  range: { start: number, end: number } | null
): string {
  const items: Array<{ n: number, texts: string[] }> = []
  for (const [usfm, texts] of verses) {
    if (!usfm.startsWith(prefix + '.')) continue
    const tail = usfm.slice(prefix.length + 1)
    if (!/^\d+$/.test(tail)) continue
    const n = parseInt(tail, 10)
    if (range && ((n < range.start) || (n > range.end))) continue
    items.push({ n, texts })
  }
  items.sort((a, b) => a.n - b.n)
  return items.map(({ n, texts }) => `${n} ${texts.join(' ')}`).join(' ')
}

async function fetchVerses(url: string): Promise<string | null> {
  const p = parseURL(url)
  if (!p) return null
  const chapterURL = `https://www.bible.com/bible/${p.trId}/${p.book}.${p.chapter}`
  const html = await fetchHTML(chapterURL)
  if (!html) return null
  const prefix = `${p.book}.${p.chapter}`
  const range = p.start
    ? { start: p.start, end: p.end ?? p.start }
    : null
  const text = assembleVerses(extractChapterVerses(html), prefix, range)
  return text || null
}

async function fetchMeta(url: string): Promise<string | null> {
  const html = await fetchHTML(url)
  if (!html) return null
  const m = html.match(META_DESCRIPTION)
  return m ? decodeEntities(m[1]!) : null
}

export default defineEventHandler(async (event) => {
  const { url, mode } = getQuery(event)
  if ((typeof url !== 'string') || !url.startsWith('https://www.bible.com/')) {
    return { description: null }
  }
  const description = mode === 'verses'
    ? await fetchVerses(url)
    : await fetchMeta(url)
  return { description }
})
