<template>
  <div class="d-flex justify-between align-center mb-4">
    <h3>Create Asset Handover</h3>
  </div>

  <VForm ref="refForm" @submit.prevent="submitForm">
    <VRow>
      <!-- Name of Employee (from logged-in user) -->
        <VCol cols="12" md="4">
              <VTextField
                v-model="form.hor_number"
                label="HandOver Number"
                :error-messages="errorMessages.hor_number"
                clearable
              />
            </VCol>


   <VCol cols="12" md="4">
          <VSelect
            v-model="form.project_id"
            :items="projects"
            item-title="label"
            item-value="id"
            label="Project"
            :loading="loadingProjects"
            :disabled="loadingProjects"
            :error-messages="errorMessages.project_id"
            clearable
            @update:modelValue="onProjectChange"
          />
        </VCol>


      <!-- Asset Investment Request -->
      <VCol cols="12" md="4">
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

      <!-- Handover Date (defaults to today) -->
      <VCol cols="12" md="4">
        <VTextField
          v-model="form.handover_date"
          label="Handover Date"
          type="date"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.handover_date"
        />
      </VCol>

      <!-- Department -->
      <VCol cols="12" md="4">
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

      <!-- Handover By -->
      <VCol cols="12" md="4">
        <VSelect
          v-model="form.user_id"
          :items="usersOptions"
          item-title="title"
          item-value="value"
          label="Handover By"
          :loading="loadingUsers"
          :disabled="!selectedProjectId || loadingUsers"
          :error-messages="errorMessages.user_id"
          clearable
        />
      </VCol>

      <!-- Notice -->
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

                  <!-- Quantity (Requested) readonly -->
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

                  <!-- Quantity (Handover) -->
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

                  <!-- Remarks -->
                  <td>
                    <VTextarea
                      v-model="row.remarks"
                      :rows="1"
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
          Submit
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
import { useRouter } from 'vue-router'
import {
  VBtn, VCard, VCardText, VCardTitle, VCol, VForm, VRow,
  VSelect, VTable, VTextField, VTextarea,
} from 'vuetify/components'

/* ========= CONFIG ========= */
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL // should end with /api
const apiCreateUrl = `${apiBaseUrl}/asset-handovers`
const apiRequestsUrl = `${apiBaseUrl}/asset-handovers`
const apiDepartmentsUrl = `${apiBaseUrl}/departments`

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

const loadingDepartments = ref(false)
const departments = ref([])

/* items for selected request */
const loadingItems = ref(false)
const requestItems = ref([])   // [{ item_id, description, request_qty, handover_qty, asset_id|null, remarks, asset_type }]
const rowErrors = ref([])      // per-row client errors

const projects = ref([])
const loadingProjects = ref(false)

/* today as default date */
const today = new Date().toISOString().split('T')[0]

/* include employee_id/employee_name/employee_code */
const form = ref({
   employee_id: null,           // hidden, captured from logged-in user.id
  employee_name: '',           // shown (readonly)
  employee_code: '',           // shown (readonly)
  asset_investment_requests_id: null,
  project_id: null,
  user_id: null,
  department_id: null,
  handover_date: today,
  hor_number: null,
})

watch(
  () => form.value.handover_date,
  (newVal) => {
    if (!newVal) {
      errorMessages.value.handover_date = "";
      return;
    }

    const today = new Date().setHours(0, 0, 0, 0);
    const selected = new Date(newVal).setHours(0, 0, 0, 0);

    if (selected < today) {
      errorMessages.value.handover_date = "Handover date cannot be older than today.";
    } else {
      errorMessages.value.handover_date = "";
    }
  }
);

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


const onProjectChange = (projectId) => {
  if (!projectId) {
    asset.asset_investment_requests_id = null
    return
  }

  fetchAssetRequests(projectId)
  fetchAssets(projectId)
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

/* DETAIL + items map */
const fetchInvestmentRequestDetail = async (id) => {
  requestItems.value = []
  rowErrors.value = []
  if (!id) return

  loadingItems.value = true
  try {
    const token = getToken()
    if (!token) throw new Error('Access token is missing. Please log in.')

    const url = `${apiRequestsUrl}/${id}`
    const res = await axios.get(url, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    })

    const detail = res.data?.data || res.data
    const items = Array.isArray(detail?.items) ? detail.items : []

    requestItems.value = items.map(it => ({
      item_id: it.id,
      description: it.description,
      request_qty: Number(it.quantity) || 1,      // readonly
      handover_qty: Number(it.quantity) || 1,     // editable default
      asset_id: it.asset_id != null ? String(it.asset_id) : null,
      remarks: '',
      asset_type: it.request_type || 'NEW',
      handover_date : it.handover_date,
      hor_number : it.handover_id
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
    fetchInvestmentRequestDetail(newVal)
  },
)

/* ========= SUBMIT ========= */
const validateRows = () => {
  let ok = true
  rowErrors.value = requestItems.value.map(r => {
    const e = {}
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

    const payload = {
      // include employee metadata
      employee_id: form.value.employee_id,
      employee_name: form.value.employee_name,
      employee_code: form.value.employee_code,

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

    const res = await axios.post(apiCreateUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    message.value = res.data?.message || 'Asset Handover created successfully.'
    router.push('/dashboards/assethandovers')
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
  await Promise.all([
    fetchCurrentUser(),     // fill employee name + code from logged-in user
    fetchAssetRequests(),
    fetchDepartments(),
  ])
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

.auth-signatory {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin-block-start: 16px;
}
</style>
