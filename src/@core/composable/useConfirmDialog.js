// src/@core/composables/useConfirmDialog.js
import { ref, reactive } from 'vue'

const showDialog = ref(false)
const state = reactive({
  title: 'Confirm',
  message: 'Are you sure?',
  resolve: null
})

export function openConfirmDialog(msg = 'Are you sure?', dlgTitle = 'Confirm') {
  state.title = dlgTitle
  state.message = msg
  showDialog.value = true
  return new Promise((resolve) => {
    state.resolve = resolve
  })
}

export function useConfirmDialogState() {
  return { showDialog, state }
}

export function confirm() {
  showDialog.value = false
  if (state.resolve) state.resolve(true)
}

export function cancel() {
  showDialog.value = false
  if (state.resolve) state.resolve(false)
}
