const META_DESCRIPTION = /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&lt;': '<',
  '&gt;': '>',
  '&nbsp;': ' '
}

function decodeEntities(s: string) {
  return s.replace(/&(?:amp|quot|#39|apos|lt|gt|nbsp);/g, m => ENTITIES[m] ?? m)
}

export default defineEventHandler(async (event) => {
  const { url } = getQuery(event)
  if ((typeof url !== 'string') || !url.startsWith('https://www.bible.com/')) {
    return { description: null }
  }

  try {
    const html = await $fetch<string>(url, {
      responseType: 'text',
      headers: { 'User-Agent': 'Mozilla/5.0 (BibleDial)' }
    })
    const match = html.match(META_DESCRIPTION)
    return { description: match ? decodeEntities(match[1]!) : null }
  } catch {
    return { description: null }
  }
})
