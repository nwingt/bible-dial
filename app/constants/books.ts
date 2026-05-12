export const BOOK_CATEGORIES = {
  law: { testament: 'old', books: ['GEN', 'EXO', 'LEV', 'NUM', 'DEU'] },
  otHistory: { testament: 'old', books: ['JOS', 'JDG', 'RUT', '1SA', '2SA', '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST'] },
  wisdom: { testament: 'old', books: ['JOB', 'PSA', 'PRO', 'ECC', 'SNG'] },
  majorProphets: { testament: 'old', books: ['ISA', 'JER', 'LAM', 'EZK', 'DAN'] },
  minorProphets: { testament: 'old', books: ['HOS', 'JOL', 'AMO', 'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL'] },
  gospels: { testament: 'new', books: ['MAT', 'MRK', 'LUK', 'JHN'] },
  ntHistory: { testament: 'new', books: ['ACT'] },
  pauline: { testament: 'new', books: ['ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM'] },
  general: { testament: 'new', books: ['HEB', 'JAS', '1PE', '2PE', '1JO', '2JO', '3JO', 'JUD'] },
  prophecy: { testament: 'new', books: ['REV'] }
} as const

export type CategoryId = keyof typeof BOOK_CATEGORIES
export type Testament = 'old' | 'new'

function getBooksByTestament(testament: Testament) {
  return (Object.values(BOOK_CATEGORIES) as Array<{ testament: Testament, books: readonly string[] }>)
    .filter(c => c.testament === testament)
    .flatMap(c => c.books)
}

export const OT_BOOKS = getBooksByTestament('old')
export const NT_BOOKS = getBooksByTestament('new')
export const BOOKS = [...OT_BOOKS, ...NT_BOOKS] as const

export type USFM = typeof BOOKS[number]

export const USFM_KEY: Record<string, string> = Object.fromEntries(
  BOOKS.map(c => [c, c.toLowerCase()])
)

const BOOK_TO_CATEGORY = new Map<string, CategoryId>()
for (const [cat, info] of Object.entries(BOOK_CATEGORIES)) {
  for (const b of info.books) BOOK_TO_CATEGORY.set(b, cat as CategoryId)
}

export function getCategory(code: string): CategoryId | undefined {
  return BOOK_TO_CATEGORY.get(code)
}

export function getTestament(code: string): Testament | undefined {
  const cat = getCategory(code)
  return cat ? BOOK_CATEGORIES[cat].testament : undefined
}
