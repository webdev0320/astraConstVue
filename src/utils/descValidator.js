// src/utils/descValidator.js
import { computed, unref } from 'vue'

export const useWordLimit = (textRef, maxWords = 1000) => {
  const wordCount = computed(() => {
    const text = unref(textRef) || '' // safely unwrap ref or value
    return text.trim().split(/\s+/).filter(Boolean).length
  })

  const wordLimitRule = (v) => {
    const count = (v || '').trim().split(/\s+/).filter(Boolean).length
    return count <= maxWords || `Maximum ${maxWords} words allowed (currently ${count})`
  }

  return { wordCount, wordLimitRule }
}
