<template>
  <p class="text-base text-default leading-relaxed">
    <template
      v-for="verse in verses"
      :key="verse.number"
    >
      <sub
        v-if="showNumbers"
        class="mr-0.5 font-semibold text-muted"
      >{{ verse.number }}</sub>{{ verse.text + ' ' }}
    </template>
  </p>
</template>

<script setup lang="ts">
const props = defineProps<{ verses: Verse[] }>()

const { isVerseNumbersShown } = useSettings()

const showNumbers = computed(() => (
  isVerseNumbersShown.value && (props.verses.length > 1)
))
</script>
