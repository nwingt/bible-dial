export interface Translation {
  id: number
  code: string
  label: string
}

export const TRANSLATIONS: readonly Translation[] = [
  { id: 2625, code: '和合本2010 - 神版', label: '和合本修訂版 (神版)' },
  { id: 46, code: 'CUNP-神', label: '新標點和合本, 神版' },
  { id: 111, code: 'NIV', label: 'New International Version' },
  { id: 59, code: 'ESV', label: 'English Standard Version' },
  { id: 1588, code: 'AMP', label: 'Amplified Bible' },
  { id: 416, code: 'GNBDC', label: 'Good News Bible (British) with DC section 2017' },
  { id: 463, code: 'NABRE', label: 'New American Bible, revised edition' },
  { id: 174, code: 'THSV11', label: 'พระคัมภีร์ไทย ฉบับ 1971' }
] as const

export const DEFAULT_TRANSLATION_ID = 2625
