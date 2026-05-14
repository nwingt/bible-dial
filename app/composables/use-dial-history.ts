export interface DialHistoryEntry {
  id: string
  url: string
  label: string
  translationId: number
  ts: number
}

const STORAGE_KEY = 'bible_dial_history'
const MAX_ENTRIES = 50

function readFromStorage(): DialHistoryEntry[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((x): x is DialHistoryEntry => (
      !!x
      && (typeof x.id === 'string')
      && (typeof x.url === 'string')
      && (typeof x.label === 'string')
      && (typeof x.translationId === 'number')
      && (typeof x.ts === 'number')
    ))
  } catch {
    return []
  }
}

function writeToStorage(entries: DialHistoryEntry[]) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // quota or serialization failure — silently drop
  }
}

export function useDialHistory() {
  const entries = useState<DialHistoryEntry[]>('bible_dial_history', () => [])
  const hydrated = useState<boolean>('bible_dial_history_hydrated', () => false)

  onMounted(() => {
    if (hydrated.value) return
    entries.value = readFromStorage()
    hydrated.value = true
  })

  function record(entry: Omit<DialHistoryEntry, 'id' | 'ts'>) {
    const next = entries.value.filter(e => e.url !== entry.url)
    next.unshift({
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ts: Date.now()
    })
    entries.value = next.slice(0, MAX_ENTRIES)
    writeToStorage(entries.value)
  }

  function remove(id: string) {
    entries.value = entries.value.filter(e => e.id !== id)
    writeToStorage(entries.value)
  }

  function clear() {
    entries.value = []
    writeToStorage(entries.value)
  }

  return { entries, record, remove, clear }
}
