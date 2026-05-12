# AGENTS.md

Guidance for AI coding assistants working in this repo. Human contributors are welcome to follow it too.

## Project

**BibleDial** — a mobile-first Bible verse picker that builds `bible.com` deep links. Desktop renders the same mobile-width layout centered.

**Stack:** Nuxt 4 · Nuxt UI 3 · Tailwind CSS v4 · `@nuxtjs/i18n` v10 (locales: `en`, `zh-Hant`, `th`).

**Package manager:** npm only. Do not introduce `pnpm-lock.yaml` or `yarn.lock`.

## Commands

```bash
npm run dev        # http://localhost:3000
npm run build      # production build
npm run preview    # preview production build
npm run lint       # eslint .
npm run typecheck  # nuxt typecheck (vue-tsc)
```

## Layout

```
app/
  app.vue, app.config.ts
  pages/index.vue
  components/      # AppHeader, BookGrid, BookButton, NumpadModal, ResultModal, SettingsDrawer
  composables/     # use-bible-selection, use-bible-com-url, use-chapter-verses, use-verse-actions
  constants/       # books, translations, chapter-verses  — pure data only, no functions
  utils/           # translation  — pure helper functions, auto-imported like composables
i18n/locales/      # en.json, zh-Hant.json, th.json
```

State that crosses components lives in `useBibleSelection` via `useState` / `useCookie` (SSR-safe — no `localStorage`).

## Code Conventions

### Naming

#### Variables
- **Acronyms** (multi-word initialisms) stay uppercase: `bookURL`, `isPDF`.
- **Abbreviations** (shortened single words) follow normal camelCase: `bookId`, `maxLen`.
- First word is always lowercase: `url`, `id`, `pdf`.
- **Booleans** — prefix with `is` / `has` / `should` / `must`: `isDeleted` not `deleted`, `hasLoggedIn` not `loggedIn`. Applies to `ref`s and `computed`s too.

#### Functions
- Always start with a verb: `handleClick` not `onClick`.
- `fetch*` — async, calls an API, requires `await`.
- `get*` — synchronous getter, no `await`.
- **Prefer `function` declarations over arrow functions for named functions** — both top-level (`export function useFoo() {...}`) and inner helpers (`function handleClick() {...}`). Reserve arrow functions for inline anonymous callbacks: `computed(() => ...)`, `computed({ get: () => ..., set: (v) => ... })`, `.map(x => x.id)`, `useState('k', () => initial)`.

#### Filenames
- **Composables & non-component `.ts`** — kebab-case: `use-bible-com-url.ts`, `chapter-verses.ts`. Nuxt auto-imports composables by exported function name, so the file rename is decoupled from the symbol name (`useBibleComURL`).
- **Vue components** — PascalCase: `BookButton.vue`, `NumpadModal.vue`.

#### Storage keys (state, cookies, localStorage)
- **Lowercase snake_case with `bible_dial_` prefix** — e.g., `bible_dial_translation`, `bible_dial_quick_mode`, `bible_dial_result_url`. Applies to `useState` keys, `useCookie` names, and the i18n locale cookie. Keys are user-visible (in cookies) and survive across renames of the underlying JS variable, so they don't follow the JS variable casing rules above.

### Style & Tooling
- **Commit messages** — [Gitmoji](https://github.com/carloscuesta/gitmoji) prefix (e.g., 💬, 🚸, 📈, 👔).
- **License headers** — none; the repo is GPL-3.0-or-later, covered by [LICENSE](LICENSE).

### Vue Templates
- **Template first, then `<script>`** — keep markup at the top of single-file components.
- **Text rendering** — prefer the `v-text` directive over mustache interpolation for text-only children:
  ```vue
  <span v-text="label" />       <!-- preferred -->
  <span>{{ label }}</span>      <!-- avoid -->
  ```
  Mustaches are fine when content is mixed (`Hello {{ name }}!`).
- **Attribute order** on an element:
  1. Structural directives: `v-for`, `v-if` / `v-else-if` / `v-else`, `v-show`
  2. `ref`, `key`
  3. `v-model` (incl. `v-model:open` etc.)
  4. Component props — both static (`size="lg"`) and bound (`:disabled="…"`), in their existing semantic order; don't split static from bound
  5. Boolean shortcuts (`block`, etc.)
  6. `class` / `style` (both static and bound)
  7. `@event` handlers
  8. `v-text` / `v-html`

  In particular, keep `:disabled` with the other component props (not next to `block`), and `class` goes after boolean shortcuts but before `@click`.

### Nuxt UI
- **Colors** — use Nuxt UI semantic classes (`text-muted`, `text-default`, `bg-elevated`, `bg-default`) instead of hardcoded palette classes (`text-gray-500`, `bg-white`). Semantic classes track light/dark and theme changes automatically.
- **Icons** — use [Material Symbols](https://github.com/google/material-design-icons) via `i-material-symbols-*-rounded` (e.g., `i-material-symbols-search-rounded`). Existing components still use `i-lucide-*`; migrate opportunistically when touching them, and add `@iconify-json/material-symbols` to `dependencies` on first use.
- **UModal** — for standard dialogs, prefer the built-in `title` / `description` props with `#body` / `#footer` slots. Use `#content` only when the modal needs full layout control (custom chrome, fullscreen, non-dialog layouts). Customize slot classes via the `:ui` prop (e.g., `:ui="{ footer: 'grid grid-cols-3 gap-2' }"`) rather than wrapping in extra `<div>`s.

### i18n
- **In templates, use `$t(...)` directly** — the vue-i18n global injection is always available, so there's no need to destructure `t` from `useI18n()` just for template use.
- **In `<script>` and composables, use `const { t } = useI18n()`** since `$t` isn't available there. Same for `te(...)` (existence check).
- **Keys are flat, snake_case, sorted alphabetically** — no nesting. Prefix by area: `app_title`, `settings_quick_mode`, `numpad_enter`, `result_copy_failed`, `book_name_abbv_gen` (short abbrev), `book_name_gen` (full name).
- USFM codes in book keys are **lowercased**. Build keys via the `USFM_KEY` map in [app/constants/books.ts](app/constants/books.ts) — never hand-write `code.toLowerCase()` at call sites.
- The repo preserves the **non-standard** USFM codes `1JO` / `2JO` / `3JO` (rather than `1JN` / `2JN` / `3JN`) because `bible.com` accepts them and existing data is keyed that way. Don't rename without checking `chapterVerses.ts` and every locale.
- Use `te(key)` to test for existence and fall back to the USFM code when an abbreviation is missing.

## Numpad Behavior

The numpad input is stored as `inputSegments: string[]` in `useBibleSelection`, joined by `:` and `-` into the read-only `inputText` computed. Each segment maps to one of: chapter, start verse, end verse.

**Auto-`:`** — after typing a chapter digit, if no further digit can extend the chapter to a valid value, a `:` is auto-appended (an empty verse segment is pushed). Only fires on the chapter; `-` is never auto-added.

**Backspace pairing** — backspacing the empty post-`:` slot also strips the last chapter digit, otherwise auto-`:` would immediately re-fire.

**Hint completion** — when the input is at a transient state, a dimmed (`text-muted`) suffix is rendered after the committed text (`text-primary`):

| Input | Display | Hint |
|---|---|---|
| (empty) | *1:1* | — (placeholder) |
| `3` | 3 *:1* | `:1` |
| `3:` | 3: *1* | `1` |
| `3:16` | 3:16 | — |
| `3:16-` | 3:16- *17* | `17` (= startVerse + 1) |
| `3:16-20` | 3:16-20 | — |

**Action buttons** — both Enter (non-quick mode) and Share / Copy / Open (quick mode) share the same enable rule and URL resolution: enabled when input is empty, a hint exists, or the input is fully valid. `buildResolved` appends `inputHint` (falling back to `1:1` for empty input), so the resolved URL always matches what the user sees.

| Input | Buttons | Resolved URL |
|---|---|---|
| (empty) | enabled | `1:1` |
| `3` | enabled | `3:1` |
| `3:` | enabled | `3:1` |
| `3:16` | enabled | `3:16` |
| `3:16-` | enabled | `3:16-17` |
| `3:16-20` | enabled | `3:16-20` |
| `2:5-2` (end < start+1) | **disabled** | — |

**Auto-submit** — in non-quick mode, when every digit / `:` / `−` button is disabled and Enter is enabled, a watcher submits automatically.

## Things to Avoid

- Don't reintroduce `pnpm` or `yarn`.
- Don't add `localStorage`-backed state — it causes SSR hydration flashes. Use `useCookie`.
- Don't use `<input>` in the numpad — it triggers the mobile system keyboard. The display element must be a `<div>` / `<span>`.
- Don't add responsive `md:` / `lg:` breakpoints to the main layout. Desktop intentionally renders the mobile-width layout.
