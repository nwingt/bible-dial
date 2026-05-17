export function useVerseActions() {
  const { t } = useI18n()
  const toast = useToast()

  async function copyURL(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      toast.add({
        title: t('result_copied'),
        color: 'success',
        icon: 'i-lucide-check'
      })
    } catch {
      toast.add({
        title: t('result_copy_failed'),
        color: 'error',
        icon: 'i-lucide-x'
      })
    }
  }

  async function shareURL(url: string, title: string, text?: string) {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        const data: ShareData = { title, text }
        if (url) data.url = url
        await navigator.share(data)
      } catch {
        // user cancelled — ignore
      }
    } else {
      await copyURL(text ?? url)
    }
  }

  function openURL(url: string) {
    window.open(url, '_blank', 'noopener')
  }

  return { copyURL, shareURL, openURL }
}
