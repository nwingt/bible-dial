export interface BulkEntryState {
  label: string
  text: string
  loading: boolean
}

export function useAppState() {
  const isSettingsDrawerOpen = useState<boolean>('bible_dial_settings_drawer_open', () => false)
  const isHistoryDrawerOpen = useState<boolean>('bible_dial_history_drawer_open', () => false)
  const isResultModalOpen = useState<boolean>('bible_dial_result_modal_open', () => false)
  const isPPTModalOpen = useState<boolean>('bible_dial_ppt_modal_open', () => false)
  const resultURL = useState<string | null>('bible_dial_result_url', () => null)
  const resultLabel = useState<string | null>('bible_dial_result_label', () => null)
  const bulkResultEntries = useState<Array<{ url: string, label: string }>>(
    'bible_dial_bulk_result_entries',
    () => []
  )
  const bulkEntryStates = useState<BulkEntryState[]>(
    'bible_dial_bulk_entry_states',
    () => []
  )

  return {
    isSettingsDrawerOpen,
    isHistoryDrawerOpen,
    isResultModalOpen,
    isPPTModalOpen,
    resultURL,
    resultLabel,
    bulkResultEntries,
    bulkEntryStates
  }
}
