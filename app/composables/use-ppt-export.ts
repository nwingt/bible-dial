export interface PPTExportEntry {
  label: string
  text: string
}

export interface PPTBackground {
  type: 'none' | 'upload'
  src?: string
}

export interface PPTExportOptions {
  background: PPTBackground
  textColor: string
  fileName?: string
}

interface ParsedLabel {
  book: string
  chapter: number
  startVerse: number | null
  endVerse: number | null
  raw: string
}

const REF_PATTERN = /^(.+?)\s+(\d{1,3})(?::(\d{1,3})(?:-(\d{1,3}))?)?$/

const SLIDE_BODY_LINES = 4
const APPROX_CHARS_PER_LINE = 25
const MAX_CHARS_PER_SLIDE = (SLIDE_BODY_LINES * APPROX_CHARS_PER_LINE) - 10
const ELLIPSIS = '...'

function parseLabel(label: string): ParsedLabel {
  const m = label.match(REF_PATTERN)
  if (!m) return { book: label, chapter: 0, startVerse: null, endVerse: null, raw: label }
  return {
    book: m[1]!.trim(),
    chapter: parseInt(m[2]!, 10),
    startVerse: m[3] ? parseInt(m[3], 10) : null,
    endVerse: m[4] ? parseInt(m[4], 10) : (m[3] ? parseInt(m[3], 10) : null),
    raw: label
  }
}

function estimateLines(text: string): number {
  if (!text) return 1
  const explicitBreaks = text.split('\n')
  let total = 0
  for (const segment of explicitBreaks) {
    total += Math.max(1, Math.ceil(segment.length / APPROX_CHARS_PER_LINE))
  }
  return total
}

function chunkLongText(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text]
  const chunks: string[] = []
  let remaining = text
  while (remaining.length > maxChars) {
    let cut = maxChars
    const minCut = Math.floor(maxChars * 0.7)
    for (let i = maxChars; i > minCut; i--) {
      if (/\s/.test(remaining.charAt(i))) {
        cut = i
        break
      }
    }
    chunks.push(remaining.slice(0, cut).trimEnd())
    remaining = remaining.slice(cut).trimStart()
  }
  if (remaining.length > 0) chunks.push(remaining)
  return chunks
}

function splitByVerseMarker(text: string): string[] {
  const segments: string[] = []
  const regex = /\s(?=\d{1,3}\s)/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = regex.exec(text)) !== null) {
    const piece = text.slice(last, m.index).trim()
    if (piece) segments.push(piece)
    last = m.index + m[0].length
  }
  const tail = text.slice(last).trim()
  if (tail) segments.push(tail)
  return segments
}

function packSegments(segments: string[], maxChars: number): string[] {
  const chunks: string[] = []
  let current = ''
  for (const seg of segments) {
    const next = current ? `${current} ${seg}` : seg
    if ((next.length > maxChars) && current) {
      chunks.push(current)
      current = seg
    } else {
      current = next
    }
  }
  if (current) chunks.push(current)
  return chunks
}

function splitOversizedEntry(entry: PPTExportEntry): PPTExportEntry[] {
  const segments = splitByVerseMarker(entry.text)
  const canSplitByVerse = (
    (segments.length > 1)
    && segments.every(s => s.length <= MAX_CHARS_PER_SLIDE)
  )
  if (canSplitByVerse) {
    const chunks = packSegments(segments, MAX_CHARS_PER_SLIDE)
    return chunks.map(text => ({ label: entry.label, text }))
  }

  const chunks = chunkLongText(entry.text, MAX_CHARS_PER_SLIDE)
  if (chunks.length <= 1) return [entry]
  return chunks.map((chunk, i) => {
    const isFirst = i === 0
    const isLast = i === chunks.length - 1
    const prefix = isFirst ? '' : `${ELLIPSIS} `
    const suffix = isLast ? '' : ` ${ELLIPSIS}`
    return { label: entry.label, text: `${prefix}${chunk}${suffix}` }
  })
}

export function packEntries(entries: PPTExportEntry[]): PPTExportEntry[][] {
  const groups: PPTExportEntry[][] = []
  let current: PPTExportEntry[] = []
  let usedLines = 0
  let currentBook = ''

  const flush = () => {
    if (current.length === 0) return
    groups.push(current)
    current = []
    usedLines = 0
  }

  for (const entry of entries) {
    const book = parseLabel(entry.label).book
    const baseLines = estimateLines(entry.text)

    if (baseLines > SLIDE_BODY_LINES) {
      flush()
      for (const part of splitOversizedEntry(entry)) {
        groups.push([part])
      }
      currentBook = book
      continue
    }

    const verseLines = baseLines + (current.length > 0 ? 1 : 0)
    const bookChanged = (current.length > 0) && (book !== currentBook)
    const overflow = (current.length > 0) && (usedLines + verseLines > SLIDE_BODY_LINES)
    if (bookChanged || overflow) flush()
    current.push(entry)
    currentBook = book
    usedLines += baseLines + (current.length > 1 ? 1 : 0)
  }
  flush()
  return groups
}

function formatRef(p: ParsedLabel): string {
  if (p.startVerse === null) return String(p.chapter)
  if ((p.endVerse !== null) && (p.endVerse !== p.startVerse)) {
    return `${p.chapter}:${p.startVerse}-${p.endVerse}`
  }
  return `${p.chapter}:${p.startVerse}`
}

export function buildSlideTitle(group: PPTExportEntry[]): string {
  if (group.length === 0) return ''
  if (group.length === 1) return group[0]!.label

  const parsed = group.map(e => parseLabel(e.label))
  const first = parsed[0]!
  const sameChapter = parsed.every(p => (
    (p.chapter === first.chapter)
    && (p.startVerse !== null)
  ))

  if (sameChapter) {
    let contiguous = true
    let expected = (first.endVerse ?? first.startVerse)!
    for (let i = 1; i < parsed.length; i++) {
      const p = parsed[i]!
      if (p.startVerse !== expected + 1) {
        contiguous = false
        break
      }
      expected = (p.endVerse ?? p.startVerse)!
    }
    if (contiguous) {
      const last = parsed[parsed.length - 1]!
      const endVerse = last.endVerse ?? last.startVerse!
      return `${first.book} ${first.chapter}:${first.startVerse}-${endVerse}`
    }
  }

  const refs = parsed.map(formatRef).join(', ')
  return `${first.book} ${refs}`
}

async function blobToDataUri(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

function stripDataPrefix(dataUri: string): string {
  return dataUri.startsWith('data:') ? dataUri.slice(5) : dataUri
}

async function resolveBackgroundData(bg: PPTBackground): Promise<string | null> {
  if ((bg.type === 'none') || !bg.src) return null
  if (bg.src.startsWith('data:')) return stripDataPrefix(bg.src)
  const res = await fetch(bg.src)
  if (!res.ok) return null
  const blob = await res.blob()
  const dataUri = await blobToDataUri(blob)
  return stripDataPrefix(dataUri)
}

const MASTER_NAME = 'VERSE_MASTER'

export function usePPTExport() {
  async function generate(entries: PPTExportEntry[], opts: PPTExportOptions) {
    const usable = entries.filter(e => e.text)
    if (usable.length === 0) return

    const PptxGenJS = (await import('pptxgenjs')).default
    const pptx = new PptxGenJS()
    pptx.layout = 'LAYOUT_WIDE'

    const bgData = await resolveBackgroundData(opts.background)
    const color = opts.textColor.replace('#', '').toUpperCase()

    pptx.defineSlideMaster({
      title: MASTER_NAME,
      background: bgData ? { data: bgData } : { color: '000000' },
      objects: [
        {
          placeholder: {
            options: {
              name: 'title',
              type: 'title',
              x: 0.5, y: 0.3, w: 12.33, h: 1.2,
              fontSize: 50, bold: true, color,
              align: 'left', valign: 'middle', fontFace: 'Calibri'
            },
            text: ''
          }
        },
        {
          placeholder: {
            options: {
              name: 'body',
              type: 'body',
              x: 0.5, y: 1.6, w: 12.33, h: 5.6,
              fontSize: 50, color,
              align: 'left', valign: 'top', fontFace: 'Calibri'
            },
            text: ''
          }
        }
      ]
    })

    const groups = packEntries(usable)

    for (const group of groups) {
      const slide = pptx.addSlide({ masterName: MASTER_NAME })
      slide.addText(buildSlideTitle(group), { placeholder: 'title' })
      slide.addText(group.map(e => e.text).join('\n\n'), { placeholder: 'body' })
    }

    const fileName = (opts.fileName ?? 'bible-verses').replace(/\.pptx$/i, '')
    await pptx.writeFile({ fileName: `${fileName}.pptx` })
  }

  return { generate }
}
