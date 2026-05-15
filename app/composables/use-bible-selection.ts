import { DEFAULT_TRANSLATION_ID } from '~/constants/translations'
import { CHAPTER_VERSES } from '~/constants/chapter-verses'

const VALID_INPUT = /^\d{1,3}(:(\d{1,3}(-\d{1,3})?)?)?$/
const SEGMENT_SEPARATORS = [':', '-']
const DIGITS = '0123456789'

export function useBibleSelection() {
  const { chaptersInBook, versesInChapter, validPrefixSet } = useChapterVerses()

  const activeBook = useState<string | null>('bible_dial_book', () => null)
  const inputSegments = useState<string[]>('bible_dial_input_segments', () => [])
  const isSettingsDrawerOpen = useState<boolean>('bible_dial_settings_drawer_open', () => false)
  const isHistoryDrawerOpen = useState<boolean>('bible_dial_history_drawer_open', () => false)
  const isNumpadModalOpen = useState<boolean>('bible_dial_numpad_modal_open', () => false)
  const isResultModalOpen = useState<boolean>('bible_dial_result_modal_open', () => false)
  const resultURL = useState<string | null>('bible_dial_result_url', () => null)
  const resultLabel = useState<string | null>('bible_dial_result_label', () => null)
  const bulkResultEntries = useState<Array<{ url: string, label: string }>>(
    'bible_dial_bulk_result_entries',
    () => []
  )

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

  const showVerseNumbers = useCookie<boolean>('bible_dial_verse_numbers', {
    default: () => false,
    watch: true,
    sameSite: 'lax'
  })

  const inputText = computed(() =>
    inputSegments.value
      .map((seg, i) => (i === 0 ? seg : SEGMENT_SEPARATORS[i - 1] + seg))
      .join('')
  )

  function openNumpadModal(book: string) {
    activeBook.value = book
    inputSegments.value = CHAPTER_VERSES[book]?.length === 1 ? ['1', ''] : []
    isNumpadModalOpen.value = true
  }

  function closeNumpadModal() {
    isNumpadModalOpen.value = false
  }

  function segmentRange(segs: string[]): { min: number, max: number } | null {
    const book = activeBook.value
    if (!book) return null
    if (segs.length === 1) {
      return { min: 1, max: chaptersInBook(book) }
    }
    if (segs.length === 2) {
      const chapter = parseInt(segs[0]!, 10)
      if (!chapter) return null
      return { min: 1, max: versesInChapter(book, chapter) }
    }
    const chapter = parseInt(segs[0]!, 10)
    const startVerse = parseInt(segs[1]!, 10)
    if (!chapter || !startVerse) return null
    const max = versesInChapter(book, chapter)
    const min = startVerse + 1
    return min > max ? null : { min, max }
  }

  function canExtendLastSegment(segs: string[]): boolean {
    if (segs.length === 0) return false
    const last = segs[segs.length - 1]!
    if (last.length >= 3) return false
    const range = segmentRange(segs)
    if (!range) return false
    const valid = validPrefixSet(range.min, range.max)
    for (const d of DIGITS) {
      if (valid.has(last + d)) return true
    }
    return false
  }

  function appendDigit(d: string) {
    const segs = [...inputSegments.value]
    if (segs.length === 0) segs.push('')
    const lastIdx = segs.length - 1
    if (segs[lastIdx]!.length >= 3) return
    segs[lastIdx] = segs[lastIdx]! + d

    // Auto-advance: when the chapter segment can no longer accept any digit,
    // pre-open the verse segment so the user doesn't have to press ':'.
    if (segs.length === 1 && !canExtendLastSegment(segs)) {
      segs.push('')
    }
    inputSegments.value = segs
  }

  function appendColon() {
    const segs = inputSegments.value
    if (segs.length !== 1 || segs[0] === '') return
    inputSegments.value = [...segs, '']
  }

  function appendDash() {
    const segs = inputSegments.value
    if (segs.length !== 2 || segs[1] === '') return
    inputSegments.value = [...segs, '']
  }

  function backspace() {
    const segs = inputSegments.value
    if (segs.length === 0) return
    const newSegs = [...segs]
    const lastIdx = newSegs.length - 1
    const last = newSegs[lastIdx]!

    if (last !== '') {
      newSegs[lastIdx] = last.slice(0, -1)
      inputSegments.value = newSegs
      return
    }

    // Trailing segment is empty — drop it, which also removes the separator.
    newSegs.pop()

    // The ':' was auto-paired with the chapter digit that finished it. Drop
    // that digit too, otherwise auto-advance would immediately re-add the ':'.
    if (lastIdx === 1 && newSegs.length > 0) {
      const prevIdx = newSegs.length - 1
      newSegs[prevIdx] = newSegs[prevIdx]!.slice(0, -1)
      if (newSegs[prevIdx] === '') newSegs.pop()
    }
    inputSegments.value = newSegs
  }

  const isInputValid = computed(() => {
    const v = inputText.value
    if (!VALID_INPUT.test(v)) return false
    if (v.endsWith(':')) return false

    const book = activeBook.value
    if (!book) return false

    const [chapterPart = '', verseRange] = v.split(':')
    const chapter = parseInt(chapterPart, 10)
    if (!chapter || (chapter > chaptersInBook(book))) return false

    if (verseRange === undefined) return true

    const [startStr = '', endStr = ''] = verseRange.split('-')
    const startVerse = parseInt(startStr, 10)
    const maxVerse = versesInChapter(book, chapter)
    if (!startVerse || (startVerse > maxVerse)) return false

    if (endStr === '') return true

    const endVerse = parseInt(endStr, 10)
    return ((endVerse >= (startVerse + 1)) && (endVerse <= maxVerse))
  })

  return {
    activeBook,
    inputText,
    isSettingsDrawerOpen,
    isHistoryDrawerOpen,
    isNumpadModalOpen,
    isResultModalOpen,
    resultURL,
    resultLabel,
    bulkResultEntries,
    translationId,
    quickMode,
    showVerseNumbers,
    openNumpadModal,
    closeNumpadModal,
    appendDigit,
    appendColon,
    appendDash,
    backspace,
    isInputValid
  }
}
