<!-- C:\xampp\htdocs\vue\astra-const\src\pages\apps\asset-handover\create.vue -->
<template>
  <div class="d-flex justify-between align-center mb-4">
    <h3>Create Asset Handover</h3>
  </div>

  <VForm ref="refForm" @submit.prevent="submitForm">
    <VRow>
      <!-- Asset Investment Request -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="form.asset_investment_requests_id"
          :items="requestOptions"
          item-title="title"
          item-value="value"
          label="Asset Investment Request"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.asset_investment_requests_id"
          clearable
          :loading="loadingRequests"
        />
      </VCol>

      <!-- Project Users (auto-populated after selecting a request) -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="form.user_id"
          :items="usersOptions"
          item-title="title"
          item-value="value"
          label="Assign To (Project Users)"
          :loading="loadingUsers"
          :disabled="!selectedProjectId || loadingUsers"
          :error-messages="errorMessages.user_id"
          clearable
        />
      </VCol>

      <!-- Handover Date -->
      <VCol cols="12" md="3">
        <VTextField
          v-model="form.handover_date"
          label="Handover Date"
          type="date"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.handover_date"
        />
      </VCol>

      <!-- Quantity -->
      <VCol cols="12" md="3">
        <VTextField
          v-model.number="form.quantity"
          label="Quantity"
          type="number"
          min="1"
          :rules="[requiredValidator, positiveIntValidator]"
          :error-messages="errorMessages.quantity"
          clearable
        />
      </VCol>

      <!-- Remarks -->
      <VCol cols="12">
        <VTextarea
          v-model="form.remarks"
          label="Remarks"
          :rows="3"
          :error-messages="errorMessages.remarks"
          clearable
        />
      </VCol>

      <VCol cols="12">
        <VBtn type="submit" color="primary" :loading="loading" :disabled="loading">
          Submit
        </VBtn>
        <VBtn class="ms-2" variant="text" @click="router.push('/dashboards/asset-handovers')">
          Cancel
        </VBtn>
      </VCol>
    </VRow>

    <div v-if="message" class="mt-4">{{ message }}</div>
  </VForm>
</template>

<script setup>
import axios from 'axios'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  VBtn, VCol, VForm, VRow,
  VSelect,
  VTextField, VTextarea,
} from 'vuetify/components'

/* ========= CONFIG ========= */
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL // should end with /api
const apiCreateUrl = `${apiBaseUrl}/asset-handovers`
const apiRequestsUrl = `${apiBaseUrl}/asset-investment-requests`

const router = useRouter()

/* ========= STATE ========= */
const refForm = ref()
const loading = ref(false)
const message = ref('')
const errorMessages = ref({})

const loadingRequests = ref(false)
const assetRequests = ref([])

const selectedProjectId = ref(null)
const loadingUsers = ref(false)
const projectUsers = ref([])

const form = ref({
  asset_investment_requests_id: null,
  user_id: null,              // NEW: selected project user
  handover_date: '',
  quantity: 1,
  remarks: '',
})

/* ========= VALIDATORS ========= */
const requiredValidator = v => (!!v || v === 0) || 'This field is required'
const positiveIntValidator = v => (Number.isInteger(+v) && +v > 0) || 'Enter a positive integer'

/* ========= TOKEN HELPERS ========= */
const getCookie = name => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}
const getToken = () => {
  const fromCookie = getCookie('accessToken')
  if (fromCookie) return decodeURIComponent(fromCookie)
  const fromLS = localStorage.getItem('accessToken')
  return fromLS ? decodeURIComponent(fromLS) : null
}

/* ========= OPTIONS (Requests) =========
   Note: API returns project_id (no embedded project name in your sample) */
const requestOptions = computed(() =>
  assetRequests.value.map(r => ({
    value: r.id,
    title: `#${r.id} — ${r.date} — Qty ${r.quantity} — Project ${r.project_id ?? 'N/A'}`,
  })),
)

/* ========= OPTIONS (Users) ========= */
const usersOptions = computed(() =>
  projectUsers.value.map(u => ({
    value: u.id,
    title: `${u.name} — ${u.user_code}`,
  })),
)

/* ========= LOADERS ========= */
const fetchAssetRequests = async () => {
  loadingRequests.value = true
  try {
    const token = getToken()
    if (!token) throw new Error('Access token is missing. Please log in.')

    const res = await axios.get(apiRequestsUrl, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    assetRequests.value = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
        ? res.data.data
        : []
  } catch (err) {
    console.error('Error loading asset investment requests:', err)
    message.value = err.response?.data?.message || 'Failed to load asset investment requests.'
  } finally {
    loadingRequests.value = false
  }
}

const fetchProjectUsers = async projectId => {
  if (!projectId) {
    projectUsers.value = []
    return
  }
  loadingUsers.value = true
  try {
    const token = getToken()
    if (!token) throw new Error('Access token is missing. Please log in.')

    const url = `${apiBaseUrl}/projects/${projectId}/users/sync`
    const res = await axios.get(url, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    // Expected structure: { project: 2, users: [ ... ] }
    projectUsers.value = Array.isArray(res.data?.users) ? res.data.users : []
  } catch (err) {
    console.error('Error loading project users:', err)
    message.value = err.response?.data?.message || 'Failed to load project users.'
    projectUsers.value = []
  } finally {
    loadingUsers.value = false
  }
}

/* ========= WATCHERS ========= */
watch(
  () => form.value.asset_investment_requests_id,
  newVal => {
    // reset user select when request changes
    form.value.user_id = null
    projectUsers.value = []
    selectedProjectId.value = null

    if (!newVal) return

    // find request and pick project_id
    const req = assetRequests.value.find(r => r.id === newVal)
    const projectId = req?.project_id ?? null
    selectedProjectId.value = projectId

    if (projectId) fetchProjectUsers(projectId)
  },
)

/* ========= SUBMIT ========= */
const submitForm = async () => {
  try {
    loading.value = true
    message.value = ''
    errorMessages.value = {}

    const { valid } = (await refForm.value?.validate?.()) ?? { valid: true }
    if (!valid) {
      loading.value = false
      return
    }

    const token = getToken()
    if (!token) throw new Error('Access token is missing. Please log in.')

    const payload = {
      asset_investment_requests_id: form.value.asset_investment_requests_id,
      user_id: form.value.user_id || undefined,     // send if selected/required by API
      handover_date: form.value.handover_date,      // YYYY-MM-DD
      quantity: form.value.quantity,
      remarks: form.value.remarks || null,
      // If API expects different key (e.g., handover_to), rename here accordingly.
    }

    const res = await axios.post(apiCreateUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    message.value = res.data?.message || 'Asset Handover created successfully.'
    router.push('/dashboards/asset-handovers') // unified route
  } catch (error) {
    console.error('Error submitting handover:', error)
    if (error.response?.data?.errors) {
      errorMessages.value = error.response.data.errors
      message.value = 'Please fix the highlighted errors.'
    } else {
      message.value = error.response?.data?.message || 'Failed to create asset handover.'
    }
  } finally {
    loading.value = false
  }
}

/* ========= LIFECYCLE ========= */
onMounted(async () => {
  await fetchAssetRequests()
})
</script>

<style scoped>
.mb-4 { margin-block-end: 16px; }
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.ms-2 { margin-inline-start: 8px; }
</style>
