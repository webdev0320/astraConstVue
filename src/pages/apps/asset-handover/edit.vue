<template>
  <div class="d-flex justify-between align-center mb-4">
    <h3>Edit Asset Handover</h3>
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
          Update
        </VBtn>
        <VBtn class="ms-2" variant="text" @click="router.push('/dashboards/assethandovers')">
          Cancel
        </VBtn>
      </VCol>
    </VRow>

    <div v-if="message" class="mt-4">{{ message }}</div>
  </VForm>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  VBtn, VCol, VForm, VRow, VTextField, VTextarea, VSelect,
} from 'vuetify/components'

/* ========= CONFIG ========= */
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const apiShowUrl   = (id) => `${apiBaseUrl}/asset-handovers/${id}`;
const apiUpdateUrl = (id) => `${apiBaseUrl}/asset-handovers/${id}`;
const apiRequestsUrl = `${apiBaseUrl}/asset-investment-requests`;

const router = useRouter()
const route = useRoute()
const id = route.params.id

/* ========= STATE ========= */
const refForm = ref()
const loading = ref(false)
const loadingInitial = ref(false)
const message = ref('')
const errorMessages = ref({})

const loadingRequests = ref(false)
const assetRequests = ref([])

const form = ref({
  asset_investment_requests_id: null,
  handover_date: '',
  quantity: 1,
  remarks: '',
  user_id: null, // 🔹 required by backend; kept hidden
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

/* ========= OPTIONS (Requests) ========= */
const requestOptions = computed(() =>
  assetRequests.value.map(r => ({
    value: r.id,
    title: `#${r.id} — ${r.project?.name ?? 'No Project'} — ${r.date} — Qty ${r.quantity}`,
  })),
)

// helper to find a request by id
const requestById = (id) => assetRequests.value.find(r => r.id === id) || null

// 🔹 keep form.user_id in sync with selected request
watch(() => form.value.asset_investment_requests_id, (newId) => {
  const req = requestById(newId)
  form.value.user_id = req?.user_id ?? null
})

/* ========= LOAD DATA ========= */
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

const fetchHandover = async () => {
  loadingInitial.value = true
  try {
    const token = getToken()
    if (!token) throw new Error('Access token is missing. Please log in.')

    const res = await axios.get(apiShowUrl(id), {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    const p = res.data?.data ?? res.data

    // Pre-fill form
    form.value = {
      asset_investment_requests_id: p.asset_investment_requests_id ?? null,
      handover_date: (p.handover_date ?? ''), // expect YYYY-MM-DD
      quantity: p.quantity ?? 1,
      remarks: p.remarks ?? '',
      user_id: p.user_id ?? p.user?.id ?? null, // seed from record if present
    }

    // Ensure select shows existing value even if not in options
    if (
      form.value.asset_investment_requests_id &&
      !assetRequests.value.some(r => r.id === form.value.asset_investment_requests_id)
    ) {
      assetRequests.value.unshift({
        id: form.value.asset_investment_requests_id,
        project: { name: 'Current (not in list)' },
        date: '',
        quantity: '',
        user_id: form.value.user_id ?? null,
      })
    }

    // Align user_id with the selected request if possible
    const req = requestById(form.value.asset_investment_requests_id)
    if (req?.user_id) form.value.user_id = req.user_id
  } catch (err) {
    console.error('Error loading asset handover:', err)
    message.value = err.response?.data?.message || 'Failed to load asset handover.'
  } finally {
    loadingInitial.value = false
  }
}

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

    // final guard: make sure user_id is present (derive from request)
    if (!form.value.user_id && form.value.asset_investment_requests_id) {
      const req = requestById(form.value.asset_investment_requests_id)
      form.value.user_id = req?.user_id ?? null
    }

    const payload = {
      asset_investment_requests_id: form.value.asset_investment_requests_id,
      handover_date: form.value.handover_date,
      quantity: form.value.quantity,
      remarks: form.value.remarks || null,
      user_id: form.value.user_id, // 🔹 required by backend
    }

    const res = await axios.put(apiUpdateUrl(id), payload, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    message.value = res.data?.message || 'Asset Handover updated successfully.'
    router.push('/dashboards/assethandovers')
  } catch (error) {
    console.error('Error updating handover:', error)
    if (error.response?.data?.errors) {
      errorMessages.value = error.response.data.errors
      message.value = 'Please fix the highlighted errors.'
    } else {
      message.value = error.response?.data?.message || 'Failed to update asset handover.'
    }
  } finally {
    loading.value = false
  }
}

/* ========= LIFECYCLE ========= */
onMounted(async () => {
  await Promise.all([fetchAssetRequests(), fetchHandover()])
})
</script>

<style scoped>
.mb-4 { margin-bottom: 16px; }
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.ms-2 { margin-left: 8px; }
</style>
