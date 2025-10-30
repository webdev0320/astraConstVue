<template>
  <div class="d-flex justify-between align-center mb-4">
    <h3>Create Asset Missing Report</h3>
  </div>

  <VForm ref="refForm" @submit.prevent="submitForm">
    <VRow>
      <!-- Project -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="form.project_id"
          :items="projectOptions"
          item-title="title"
          item-value="value"
          label="Project"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.project_id"
          :loading="loadingProjects"
          clearable
        />
      </VCol>

      <!-- Tag No -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="form.tag_no"
          label="Tag No"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.tag_no"
          hide-details="auto"
        />
      </VCol>

      <!-- Report Date -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="form.report_date"
          type="date"
          label="Report Date"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.report_date"
        />
      </VCol>

      <!-- Report Time -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="form.time"
          type="time"
          label="Report Time"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.time"
        />
      </VCol>

      <!-- Missing Asset Reported On -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="form.missing_asset_reported_on"
          type="date"
          label="Missing Asset Reported On"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.missing_asset_reported_on"
        />
      </VCol>

      <!-- Reported By -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="form.reported_by"
          :items="userOptions"
          item-title="title"
          item-value="value"
          label="Reported By"
          :loading="loadingUsers"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.reported_by"
        />
      </VCol>

      <!-- Asset Issue To -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="form.asset_issue_to"
          :items="userOptions"
          item-title="title"
          item-value="value"
          label="Asset Issued To"
          :loading="loadingUsers"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.asset_issue_to"
        />
      </VCol>

      <!-- Asset Issued Last Time -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="form.asset_issued_last_time"
          type="date"
          label="Asset Issued Last Time"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.asset_issued_last_time"
        />
      </VCol>

      <!-- Asset Used Last Time -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="form.asset_used_last_time"
          type="date"
          label="Asset Used Last Time"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.asset_used_last_time"
        />
      </VCol>

      <!-- Location -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="form.location_id"
          :items="locationOptions"
          item-title="title"
          item-value="value"
          label="Location"
          :loading="loadingLocations"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.location_id"
        />
      </VCol>

      <!-- Equipment Issuance Form Attached -->
      <VCol cols="12" md="6">
        <VCheckbox
          v-model="form.equipment_issuance_from_attached"
          label="Equipment Issuance Form Attached"
          color="primary"
        />
      </VCol>

      <!-- Asset -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="form.asset_id"
          :items="assetOptions"
          item-title="title"
          item-value="value"
          label="Asset"
          :loading="loadingAssets"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.asset_id"
        />
      </VCol>

      <!-- Report Received On -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="form.report_received_on"
          type="date"
          label="Report Received On"
          :error-messages="errorMessages.report_received_on"
        />
      </VCol>

      <!-- Received Time -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="form.received_time"
          type="time"
          label="Received Time"
          :error-messages="errorMessages.received_time"
        />
      </VCol>

      <!-- Assessed By -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="form.assessed_by"
          :items="userOptions"
          item-title="title"
          item-value="value"
          label="Assessed By"
          :loading="loadingUsers"
          :error-messages="errorMessages.assessed_by"
        />
      </VCol>

      <!-- Assessed Date -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="form.assessed_date"
          type="date"
          label="Assessed Date"
          :error-messages="errorMessages.assessed_date"
        />
      </VCol>

      <!-- Proposed Action -->
      <VCol cols="12" md="6">
        <VTextarea
          v-model="form.proposed_action"
          label="Proposed Action"
          rows="2"
          auto-grow
          :error-messages="errorMessages.proposed_action"
        />
      </VCol>

      <!-- Manager Action Date -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="form.manager_action_date"
          type="date"
          label="Manager Action Date"
          :error-messages="errorMessages.manager_action_date"
        />
      </VCol>

      <!-- Manager -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="form.manager_id"
          :items="userOptions"
          item-title="title"
          item-value="value"
          label="Manager"
          :loading="loadingUsers"
          :error-messages="errorMessages.manager_id"
        />
      </VCol>

      <!-- Approval Section -->
      <VCol cols="12" md="6">
        <VCheckbox v-model="form.approved" label="Approved" color="primary" />
      </VCol>

      <VCol cols="12" md="6">
        <VTextarea
          v-model="form.approval_remarks"
          label="Approval Remarks"
          rows="2"
          auto-grow
        />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField
          v-model="form.approval_date"
          type="date"
          label="Approval Date"
        />
      </VCol>

      <VCol cols="12" md="6">
        <VSelect
          v-model="form.approval_manager"
          :items="userOptions"
          item-title="title"
          item-value="value"
          label="Approval Manager"
          :loading="loadingUsers"
        />
      </VCol>

      <!-- Debit To -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="form.debit_to"
          :items="userOptions"
          item-title="title"
          item-value="value"
          label="Debit To"
          :loading="loadingUsers"
          :error-messages="errorMessages.debit_to"
        />
      </VCol>

      <!-- Debit Amount -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="form.debit_amount"
          type="number"
          label="Debit Amount"
          :error-messages="errorMessages.debit_amount"
        />
      </VCol>

      <!-- Submit Buttons -->
      <VCol cols="12">
        <VBtn type="submit" color="primary" :loading="loading" :disabled="loading">Submit</VBtn>
        <VBtn class="ms-2" variant="text" @click="router.push('/dashboards/asset-missing-reports')">Cancel</VBtn>
      </VCol>
    </VRow>

    <div v-if="message" class="mt-4">{{ message }}</div>
  </VForm>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { VForm, VRow, VCol, VTextField, VSelect, VTextarea, VBtn, VCheckbox } from 'vuetify/components'

/* ------------------------------
   API URLs
------------------------------ */
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const apiCreateUrl = `${apiBaseUrl}/asset-missing-reports`
const apiProjectsUrl = `${apiBaseUrl}/projects`
const apiUsersUrl = `${apiBaseUrl}/users`
const apiAssetsUrl = `${apiBaseUrl}/assets`
const apiLocationsUrl = `${apiBaseUrl}/locations`

const router = useRouter()

/* ------------------------------
   Form State
------------------------------ */
const refForm = ref()
const form = ref({
  project_id: null,
  tag_no: '',
  report_date: '',
  time: '',
  missing_asset_reported_on: '',
  reported_by: null,
  asset_issue_to: null,
  asset_issued_last_time: '',
  asset_used_last_time: '',
  location_id: null,
  equipment_issuance_from_attached: false,
  asset_id: null,
  report_received_on: '',
  received_time: '',
  assessed_by: null,
  assessed_date: '',
  proposed_action: '',
  manager_action_date: '',
  manager_id: null,
  approved: false,
  approval_remarks: '',
  approval_date: '',
  approval_manager: null,
  debit_to: null,
  debit_amount: null,
})

const loading = ref(false)
const message = ref('')
const errorMessages = ref({})

/* ------------------------------
   Token Handling
------------------------------ */
const getCookie = name => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] : null
}

const getToken = () => {
  const fromCookie = getCookie('accessToken')
  if (fromCookie) return decodeURIComponent(fromCookie)
  const fromLS = localStorage.getItem('accessToken')
  return fromLS ? decodeURIComponent(fromLS) : null
}

const getAuthHeaders = () => {
  const token = getToken()
  if (!token) throw new Error('Access token is missing. Please log in.')
  return { Accept: 'application/json', Authorization: `Bearer ${token}` }
}

/* ------------------------------
   Data Fetching
------------------------------ */
const projects = ref([])
const users = ref([])
const assets = ref([])
const locations = ref([])

const loadingProjects = ref(false)
const loadingUsers = ref(false)
const loadingAssets = ref(false)
const loadingLocations = ref(false)

const projectOptions = computed(() => projects.value.map(p => ({ value: p.id, title: p.name })))
const userOptions = computed(() => users.value.map(u => ({ value: u.id, title: `${u.name ?? '(no name)'} — ${u.user_code ?? u.id}` })))
const assetOptions = computed(() => assets.value.map(a => ({ value: a.id, title: a.asset_code || a.title })))
const locationOptions = computed(() => locations.value.map(l => ({ value: l.id, title: l.name })))

const requiredValidator = v => (!!v || v === 0) || 'This field is required'

const fetchProjects = async () => {
  loadingProjects.value = true
  try {
    const res = await axios.get(apiProjectsUrl, { headers: getAuthHeaders() })
    projects.value = res.data?.data || res.data || []
  } finally { loadingProjects.value = false }
}


const fetchUsers = async () => {
  loadingUsers.value = true
  try {
    const res = await axios.get(apiUsersUrl, { headers: getAuthHeaders(), params: { per_page: 100 } })
    const possible = [res.data?.data?.users, res.data?.users, res.data?.data, res.data]
    users.value = possible.find(Array.isArray) || []
  } finally {
    loadingUsers.value = false
  }
}


const fetchAssets = async () => {
  loadingAssets.value = true
  try {
    const res = await axios.get(apiAssetsUrl, { headers: getAuthHeaders() })
    assets.value = res.data?.data || res.data || []
  } finally { loadingAssets.value = false }
}

const fetchLocations = async () => {
  loadingLocations.value = true
  try {
    const res = await axios.get(apiLocationsUrl, { headers: getAuthHeaders() })
    locations.value = res.data?.data || res.data || []
  } finally { loadingLocations.value = false }
}

/* ------------------------------
   Submit Form
------------------------------ */
const submitForm = async () => {
  const { valid } = await refForm.value.validate()
  if (!valid) return

  loading.value = true
  try {
    const res = await axios.post(apiCreateUrl, form.value, { headers: getAuthHeaders() })
    message.value = res.data?.message || 'Asset Missing Report created successfully.'
    router.push('/dashboards/asset-missing-report')
  } catch (error) {
    errorMessages.value = error.response?.data?.errors || {}
    message.value = error.response?.data?.message || 'Failed to create report.'
  } finally {
    loading.value = false
  }
}

/* ------------------------------
   Lifecycle
------------------------------ */
onMounted(async () => {
  await Promise.all([fetchProjects(), fetchUsers(), fetchAssets(), fetchLocations()])
})
</script>

<style scoped>
.mb-4 { margin-block-end: 16px; }
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.ms-2 { margin-inline-start: 8px; }
</style>
