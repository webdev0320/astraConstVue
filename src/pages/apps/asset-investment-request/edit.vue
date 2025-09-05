<template>
  <div class="d-flex justify-between align-center mb-4">
    <h3>Edit Asset Investment Request</h3>
  </div>

  <VForm ref="refForm" @submit.prevent="submitForm" v-model="isFormValid">
    <VRow>
      <!-- Project -->
      <VCol cols="12" md="4">
        <VSelect
          v-model="form.project_id"
          :items="projects"
          item-title="name"
          item-value="id"
          label="Select Project"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.project_id"
          clearable
        />
      </VCol>

      <!-- Date -->
      <VCol cols="12" md="4">
        <VTextField
          v-model="form.date"
          type="date"
          label="Date"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.date"
        />
      </VCol>

      <!-- Planned Cost -->
      <VCol cols="12" md="4">
        <VTextField
          v-model="form.planned_cost"
          type="number"
          label="Planned Cost"
          :rules="[requiredValidator, numberValidator]"
          :error-messages="errorMessages.planned_cost"
          clearable
        />
      </VCol>

      <!-- Request Type -->
      <VCol cols="12" md="4">
        <VSelect
          v-model="form.request_type"
          :items="REQUEST_TYPE_OPTIONS"
          label="Request Type"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.request_type"
          clearable
        />
      </VCol>

      <!-- Quantity (NEW) -->
      <VCol cols="12" md="4">
        <VTextField
          v-model="form.quantity"
          type="number"
          label="Quantity"
          :rules="[requiredValidator, integerPositiveValidator]"
          :error-messages="errorMessages.quantity"
          min="1"
          clearable
        />
      </VCol>

      <!-- Description -->
      <VCol cols="12">
        <VTextarea
          v-model="form.description"
          label="Description"
          :rows="3"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.description"
        />
      </VCol>

      <!-- Reason -->
      <VCol cols="12">
        <VTextarea
          v-model="form.reason"
          label="Reason"
          :rows="3"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.reason"
        />
      </VCol>

      <!-- Actions -->
      <VCol cols="12" class="d-flex gap-2">
        <VBtn type="submit" color="primary" :loading="loading" :disabled="loading || !isFormValid">
          Update
        </VBtn>
        <VBtn variant="tonal" @click="goBack" :disabled="loading">Cancel</VBtn>
      </VCol>
    </VRow>

    <div v-if="message" class="mt-4">{{ message }}</div>
  </VForm>
</template>

<script setup>
import axios from 'axios'
import { nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  VBtn, VCol, VForm, VRow,
  VSelect,
  VTextField, VTextarea,
} from 'vuetify/components'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const router = useRouter()
const route = useRoute()

const id = route.params.id // /asset-investment-requests/edit/:id
const REQUEST_TYPE_OPTIONS = ['NEW', 'RENEWAL', 'USED']

const form = ref({
  project_id: null,
  date: '',
  description: '',
  planned_cost: '',
  request_type: 'NEW',
  quantity: 1,        // NEW default
  reason: '',
})

const projects = ref([])
const refForm = ref()
const isFormValid = ref(false)
const loading = ref(false)
const message = ref('')
const errorMessages = ref({})

const requiredValidator = v => (!!v || v === 0) || 'This field is required'
const numberValidator   = v => (v === '' || isNaN(Number(v))) ? 'Enter a valid number' : true
const integerPositiveValidator = v => {
  if (v === '' || v === null || v === undefined) return 'This field is required'
  const n = Number(v)
  if (!Number.isInteger(n) || n < 1) return 'Enter a whole number ≥ 1'
  return true
}

const getCookie = name => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

const goBack = () => router.push('/dashboards/asset-investment-requests')

const fetchProjects = async () => {
  try {
    const accessToken = getCookie('accessToken')
    const decodedToken = decodeURIComponent(accessToken ?? '')
    const res = await axios.get(`${apiBaseUrl}/projects`, {
      headers: { Authorization: `Bearer ${decodedToken}`, Accept: 'application/json' },
    })
    projects.value = Array.isArray(res.data) ? res.data : (res.data?.data ?? [])
  } catch (e) {
    console.error('Error fetching projects:', e)
  }
}

const loadRecord = async () => {
  try {
    loading.value = true
    const accessToken = getCookie('accessToken')
    if (!accessToken) throw new Error('Access token is missing. Please log in.')
    const decodedToken = decodeURIComponent(accessToken)

    const res = await axios.get(`${apiBaseUrl}/asset-investment-requests/${id}`, {
      headers: { Authorization: `Bearer ${decodedToken}`, Accept: 'application/json' },
    })

    const p = res.data?.data ?? res.data
    form.value = {
      project_id: p.project_id ?? p.project?.id ?? null,
      date: p.date ?? '',
      description: p.description ?? '',
      planned_cost: p.planned_cost !== undefined && p.planned_cost !== null
        ? String(p.planned_cost).replace(/\.00$/, '')
        : '',
      request_type: p.request_type ?? 'NEW',
      quantity: p.quantity !== undefined && p.quantity !== null ? Number(p.quantity) : 1, // NEW
      reason: p.reason ?? '',
    }
  } catch (error) {
    console.error('Error loading record:', error?.response?.data || error)
    message.value = 'Failed to load record.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchProjects()
  await loadRecord()
})

const scrollToFirstError = () => {
  nextTick(() => {
    const el = document.querySelector('[aria-invalid="true"]')
    if (el?.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

const submitForm = async () => {
  loading.value = true
  message.value = ''
  errorMessages.value = {}

  try {
    const { valid } = (await refForm.value?.validate?.()) ?? { valid: true }
    if (!valid) {
      loading.value = false
      message.value = 'Please fix the highlighted errors.'
      scrollToFirstError()
      return
    }

    const accessToken = getCookie('accessToken')
    if (!accessToken) throw new Error('Access token is missing. Please log in.')
    const decodedToken = decodeURIComponent(accessToken)

    const payload = {
      project_id: form.value.project_id,
      date: form.value.date,
      description: form.value.description,
      planned_cost: form.value.planned_cost === '' ? null : Number(form.value.planned_cost),
      request_type: form.value.request_type,
      quantity: form.value.quantity === '' ? null : Number(form.value.quantity), // NEW
      reason: form.value.reason,
    }

    // Use PUT; if backend expects PATCH, switch to axios.patch
    const res = await axios.put(`${apiBaseUrl}/asset-investment-requests/${id}`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${decodedToken}`,
      },
    })

    message.value = res.data?.message || 'Asset Investment Request updated successfully!'
    router.push('/dashboards/asset-investment-requests')
  } catch (error) {
    console.error('Error updating record:', error?.response?.data || error)
    if (error.response?.status === 422 && error.response?.data?.errors) {
      errorMessages.value = error.response.data.errors
      message.value = 'Please fix the highlighted errors.'
      scrollToFirstError()
    } else {
      message.value = error.response?.data?.message || 'Failed to update request.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style>
.mb-4 { margin-bottom: 16px; }
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.gap-2 { gap: 8px; }
</style>
