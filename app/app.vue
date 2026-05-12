<template>
  <UApp>
    <div class="min-h-dvh bg-default text-default flex flex-col">
      <AppHeader />
      <main class="flex-1 flex flex-col w-full max-w-app mx-auto px-3 min-h-0">
        <NuxtPage />
      </main>
    </div>
  </UApp>
</template>

<script setup lang="ts">
const { locale, t: $t } = useI18n()

useHead({
  htmlAttrs: { lang: locale }
})

useSeoMeta({
  title: () => $t('app_title'),
  description: () => $t('app_description')
})
</script>
