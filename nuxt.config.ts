export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/i18n'
  ],

  devtools: {
    enabled: true
  },

  app: {
    head: {
      title: 'BibleDial',
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
      meta: [
        { name: 'theme-color', content: '#0a0a0a' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  i18n: {
    defaultLocale: 'en',
    strategy: 'no_prefix',
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'zh-Hant', name: '繁體中文', file: 'zh-Hant.json' },
      { code: 'th', name: 'ไทย', file: 'th.json' }
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'bible_dial_locale',
      redirectOn: 'root'
    }
  }
})
