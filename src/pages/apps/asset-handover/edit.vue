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

      <!-- Assign To (Project Users) -->
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

      <!-- Department -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="form.department_id"
          :items="departmentsOptions"
          item-title="title"
          item-value="value"
          label="Department"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.department_id"
          clearable
          :loading="loadingDepartments"
        />
      </VCol>

      <!-- Handover Date -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="form.handover_date"
          label="Handover Date"
          type="date"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.handover_date"
        />
      </VCol>

      <!-- Hard-coded message (same as create.vue) -->
      <VCol cols="12">
        <p class="notice-text">
          Dear Sir / Madam<br>
          Please find the below the assets handed over to you, to support you in carrying out your assignment/work in a most Proficient manner. Please sign also the attached picture.
        </p>
      </VCol>

      <!-- Items Table -->
      <VCol cols="12">
        <VCard variant="outlined">
          <VCardTitle class="px-4 py-3">Items</VCardTitle>
          <VCardText class="px-0">
            <VTable density="comfortable" fixed-header>
              <thead>
                <tr>
                  <th style="inline-size: 80px;">S.No</th>
                  <th>Description</th>
                  <th style="inline-size: 160px;">Asset ID</th>
                  <th style="inline-size: 180px;">Quantity (Requested)</th>
                  <th style="inline-size: 180px;">Quantity (Handover)</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loadingItems">
                  <td colspan="6" class="text-center py-6">Loading items…</td>
                </tr>

                <tr v-else-if="requestItems.length === 0">
                  <td colspan="6" class="text-center py-6">No items found for this request.</td>
                </tr>

                <tr v-for="(row, idx) in requestItems" :key="row.item_id">
                  <td>{{ idx + 1 }}</td>
                  <td>{{ row.description }}</td>

                  <!-- Asset ID (readonly, optional) -->
                  <td>
                    <VTextField
                      v-model="row.asset_id"
                      hide-details="auto"
                      variant="outlined"
                      density="compact"
                      placeholder="(optional)"
                      readonly
                    />
                  </td>

                  <!-- Quantity (Requested) readonly, NOT submitted -->
                  <td>
                    <VTextField
                      v-model.number="row.request_qty"
                      type="number"
                      min="0"
                      hide-details="auto"
                      variant="outlined"
                      density="compact"
                      readonly
                    />
                  </td>

                  <!-- Quantity (Handover) input -> submitted -->
                  <td>
                    <VTextField
                      v-model.number="row.handover_qty"
                      type="number"
                      min="1"
                      hide-details="auto"
                      variant="outlined"
                      density="compact"
                      :error-messages="rowErrors[idx]?.handover_qty"
                      placeholder="Enter qty"
                    />
                  </td>

                  <!-- Remarks textarea -> submitted -->
                  <td>
                    <VTextarea
                      v-model="row.remarks"
                      :rows="2"
                      hide-details="auto"
                      variant="outlined"
                      density="compact"
                      placeholder="Remarks"
                      auto-grow
                    />
                  </td>
                </tr>
              </tbody>
            </VTable>
          </VCardText>
        </VCard>
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
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  VBtn, VCard, VCardText, VCardTitle, VCol, VForm, VRow,
  VSelect, VTable, VTextField, VTextarea,
} from 'vuetify/components'

/* ========= CONFIG ========= */
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL // should end with /api
const apiShowUrl   = id => `${apiBaseUrl}/asset-handovers/${id}`
const apiUpdateUrl = id => `${apiBaseUrl}/asset-handovers/${id}`
const apiRequestsUrl = `${apiBaseUrl}/asset-investment-requests`
const apiDepartmentsUrl = `${apiBaseUrl}/departments`

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

const selectedProjectId = ref(null)
const loadingUsers = ref(false)
const projectUsers = ref([])

const loadingDepartments = ref(false)
const departments = ref([])

/* items for selected request / existing handover */
const loadingItems = ref(false)
const requestItems = ref([])   // [{ item_id, description, request_qty, handover_qty, asset_id|null, remarks, asset_type }]
const rowErrors = ref([])

/* today as default date (fallback) */
const today = new Date().toISOString().split('T')[0]

const form = ref({
  asset_investment_requests_id: null,
  user_id: null,
  department_id: null,
  handover_date: today, // default (will be replaced by record)
})

/* ========= VALIDATORS ========= */
const requiredValidator = v => (!!v || v === 0) || 'This field is required'
const posInt = v => Number.isInteger(+v) && +v > 0

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

/* ========= OPTIONS ========= */
const requestOptions = computed(() =>
  assetRequests.value.map(r => ({
    value: r.id,
    title: `#${r.id} — ${r.date} — Project ${r.project_id ?? 'N/A'}`,
  })),
)
const usersOptions = computed(() =>
  projectUsers.value.map(u => ({
    value: u.id,
    title: `${u.name} — ${u.user_code}`,
  })),
)
const departmentsOptions = computed(() =>
  departments.value.map(d => ({ value: d.id, title: d.name })),
)

/* ========= LOADERS ========= */
const fetchAssetRequests = async () => {
  loadingRequests.value = true
  try {
    const token = getToken()
    if (!token) throw new Error('Access token is missing. Please log in.')
    const res = await axios.get(apiRequestsUrl, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    })
    assetRequests.value = Array.isArray(res.data) ? res.data
      : Array.isArray(res.data?.data) ? res.data.data : []
  } catch (err) {
    console.error('Error loading asset investment requests:', err)
    message.value = err.response?.data?.message || 'Failed to load asset investment requests.'
  } finally {
    loadingRequests.value = false
  }
}

const fetchProjectUsers = async projectId => {
  if (!projectId) { projectUsers.value = []; return }
  loadingUsers.value = true
  try {
    const token = getToken()
    if (!token) throw new Error('Access token is missing. Please log in.')
    const url = `${apiBaseUrl}/projects/${projectId}/users/sync`
    const res = await axios.get(url, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    })
    projectUsers.value = Array.isArray(res.data?.users) ? res.data.users : []
  } catch (err) {
    console.error('Error loading project users:', err)
    message.value = err.response?.data?.message || 'Failed to load project users.'
    projectUsers.value = []
  } finally {
    loadingUsers.value = false
  }
}

const fetchDepartments = async () => {
  loadingDepartments.value = true
  try {
    const token = getToken()
    if (!token) throw new Error('Access token is missing. Please log in.')
    const res = await axios.get(apiDepartmentsUrl, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    })
    departments.value = Array.isArray(res.data) ? res.data
      : Array.isArray(res.data?.data) ? res.data.data : []
  } catch (err) {
    console.error('Error loading departments:', err)
    message.value = err.response?.data?.message || 'Failed to load departments.'
  } finally {
    loadingDepartments.value = false
  }
}

/* Load existing handover, including its items */
const fetchHandover = async () => {
  loadingInitial.value = true
  loadingItems.value = true
  try {
    const token = getToken()
    if (!token) throw new Error('Access token is missing. Please log in.')

    const res = await axios.get(apiShowUrl(id), {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    })

    const p = res.data?.data ?? res.data

    // Pre-fill form
    form.value = {
      asset_investment_requests_id: p.asset_investment_requests_id ?? null,
      handover_date: p.handover_date || today,
      department_id: p.department_id ?? null,
      user_id: p.user_id ?? p.user?.id ?? null,
    }

    // Resolve selected project's users
    const reqFromList = assetRequests.value.find(r => r.id === form.value.asset_investment_requests_id)
    const projectId = reqFromList?.project_id ?? p.project_id ?? null
    selectedProjectId.value = projectId
    if (projectId) fetchProjectUsers(projectId)

    // Ensure select shows existing value even if not in options
    if (
      form.value.asset_investment_requests_id &&
      !assetRequests.value.some(r => r.id === form.value.asset_investment_requests_id)
    ) {
      assetRequests.value.unshift({
        id: form.value.asset_investment_requests_id,
        project_id: projectId ?? 'N/A',
        date: p.handover_date || '',
      })
    }

    // Map items
    // Expect p.items like: [{ id:item_id, description, quantity(requested), handover_qty, asset_id, remarks, request_type }]
    const items = Array.isArray(p?.items) ? p.items : []
    requestItems.value = items.map(it => ({
      item_id: it.id,
      description: it.description,
      request_qty: Number(it.quantity) || Number(it.request_qty) || 1,
      handover_qty: Number(it.handover_qty ?? it.quantity) || 1,
      asset_id: it.asset_id != null ? String(it.asset_id) : null,
      remarks: it.remarks || '',
      asset_type: it.request_type || it.asset_type || 'NEW',
    }))
    rowErrors.value = requestItems.value.map(() => ({}))
  } catch (err) {
    console.error('Error loading asset handover:', err)
    message.value = err.response?.data?.message || 'Failed to load asset handover.'
    requestItems.value = []
  } finally {
    loadingInitial.value = false
    loadingItems.value = false
  }
}

/* ========= WATCHERS ========= */
watch(
  () => form.value.asset_investment_requests_id,
  newVal => {
    form.value.user_id = null
    requestItems.value = []
    rowErrors.value = []
    selectedProjectId.value = null

    if (!newVal) return

    const req = assetRequests.value.find(r => r.id === newVal)
    const projectId = req?.project_id ?? null
    selectedProjectId.value = projectId

    if (projectId) fetchProjectUsers(projectId)

    // Also, when changing the request on edit, reload its items fresh
    fetchInvestmentRequestDetail(newVal)
  },
)

/* If user switches request, we need its items like create.vue */
const fetchInvestmentRequestDetail = async (requestId) => {
  loadingItems.value = true
  try {
    const token = getToken()
    if (!token) throw new Error('Access token is missing. Please log in.')
    const url = `${apiRequestsUrl}/${requestId}`
    const res = await axios.get(url, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    })
    const detail = res.data?.data || res.data
    const items = Array.isArray(detail?.items) ? detail.items : []
    requestItems.value = items.map(it => ({
      item_id: it.id,
      description: it.description,
      request_qty: Number(it.quantity) || 1,
      handover_qty: Number(it.quantity) || 1,
      asset_id: it.asset_id != null ? String(it.asset_id) : null,
      remarks: '',
      asset_type: it.request_type || 'NEW',
    }))
    rowErrors.value = requestItems.value.map(() => ({}))
  } catch (err) {
    console.error('Error loading request detail/items:', err)
    message.value = err.response?.data?.message || 'Failed to load request items.'
    requestItems.value = []
  } finally {
    loadingItems.value = false
  }
}

/* ========= SUBMIT ========= */
const validateRows = () => {
  let ok = true
  rowErrors.value = requestItems.value.map(r => {
    const e = {}
    // asset_id is OPTIONAL; if provided, must be positive integer
    if (r.asset_id !== null && r.asset_id !== '' && !posInt(r.asset_id)) {
      e.asset_id = 'Invalid Asset ID'
      ok = false
    }
    if (!posInt(r.handover_qty)) {
      e.handover_qty = 'Enter a positive integer'
      ok = false
    }
    return e
  })
  return ok
}

const submitForm = async () => {
  try {
    loading.value = true
    message.value = ''
    errorMessages.value = {}

    const { valid } = (await refForm.value?.validate?.()) ?? { valid: true }
    if (!valid) { loading.value = false; return }

    if (requestItems.value.length === 0) {
      message.value = 'No items to hand over for the selected request.'
      loading.value = false; return
    }
    if (!validateRows()) {
      message.value = 'Please fix the highlighted row errors.'
      loading.value = false; return
    }

    const token = getToken()
    if (!token) throw new Error('Access token is missing. Please log in.')

    // Build PUT payload (same shape as create.vue)
    const payload = {
      asset_investment_requests_id: form.value.asset_investment_requests_id,
      handover_date: form.value.handover_date,
      department_id: form.value.department_id,
      user_id: form.value.user_id || undefined,
      data: requestItems.value.map(r => ({
        item_id: r.item_id,
        asset_id: (r.asset_id === null || r.asset_id === '') ? null : Number(r.asset_id),
        quantity: Number(r.handover_qty),
        remarks: r.remarks || '',
        asset_type: r.asset_type,
      })),
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
  await Promise.all([fetchAssetRequests(), fetchDepartments()])
  await fetchHandover()
})
</script>

<style scoped>
.mb-4 { margin-block-end: 16px; }
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.ms-2 { margin-inline-start: 8px; }
.notice-text { line-height: 1.6; }
.text-center { text-align: center; }
.py-6 { padding-block: 24px; }
</style>
