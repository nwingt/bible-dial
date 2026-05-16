<template>
  <header
    class="flex items-center justify-between w-full min-h-10 px-3 pb-2 border-b border-default"
    :style="{ paddingTop: 'max(env(safe-area-inset-top), 8px)' }"
  >
    <NuxtLink
      to="/"
      class="text-base font-semibold text-default"
    >
      {{ $t('app_title') }}
    </NuxtLink>
    <div class="flex items-center gap-1">
      <UButton
        v-if="getRouteBaseName(route) === 'index'"
        icon="i-lucide-history"
        color="neutral"
        variant="ghost"
        size="lg"
        :aria-label="$t('history_title')"
        @click="isHistoryDrawerOpen = true"
      />
      <UDropdownMenu
        :items="menuItems"
        :ui="{ content: 'min-w-[180px]' }"
      >
        <UButton
          icon="i-lucide-menu"
          color="neutral"
          variant="ghost"
          size="lg"
          :aria-label="$t('menu_open')"
        />
      </UDropdownMenu>
    </div>
  </header>
</template>

<script setup lang="ts">
const { isSettingsDrawerOpen, isHistoryDrawerOpen } = useAppState()
const { t: $t } = useI18n()
const route = useRoute()
const getRouteBaseName = useRouteBaseName()

const menuItems = computed(() => [
  {
    label: $t('index_title'),
    icon: 'i-lucide-book-open',
    to: '/'
  },
  {
    label: $t('bulk_title'),
    icon: 'i-lucide-list',
    to: '/bulk'
  },
  {
    label: $t('settings_title'),
    icon: 'i-lucide-settings',
    onSelect: () => { isSettingsDrawerOpen.value = true }
  }
])
</script>
