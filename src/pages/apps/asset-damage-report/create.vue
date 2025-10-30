<template>
  <div class="d-flex justify-between align-center mb-4">
    <h3>Create Asset Damage Report</h3>
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
          @update:model-value="fetchAssetsByProject"
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

      <!-- Damaged Asset Reported On -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="form.damaged_asset_reported_on"
          type="date"
          label="Damaged Asset Reported On"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.damaged_asset_reported_on"
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
          clearable
        />
      </VCol>

      <!-- Asset Damaged By -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="form.asset_damaged_by"
          :items="userOptions"
          item-title="title"
          item-value="value"
          label="Asset Damaged By"
          :loading="loadingUsers"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.asset_damaged_by"
          clearable
        />
      </VCol>

      <!-- Asset Damaged Due To -->
      <VCol cols="12" md="6">
        <VTextarea
          v-model="form.asset_damaged_due_to"
          label="Asset Damaged Due To"
          rows="2"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.asset_damaged_due_to"
          auto-grow
        />
      </VCol>

      <!-- Warranty Status -->
    <VCol cols="12" md="6">
      <VSelect
        v-model="form.warranty_status"
        :items="[
          { title: 'Under warranty', value: 'Under warranty' },
          { title: 'Out of warranty', value: 'Out of warranty' },
        ]"
        item-title="title"
        item-value="value"
        label="Warranty Status"
        :rules="[requiredValidator]"
        :error-messages="errorMessages.warranty_status"
        hide-details="auto"
        clearable
      />
    </VCol>

      <!-- Boolean Conditions -->
      <VCol cols="12" md="6">
        <VCheckbox v-model="form.wear_condition" label="Wear Condition" color="primary" />
        <VCheckbox v-model="form.inadequate_use" label="Inadequate Use" color="primary" />
        <VCheckbox v-model="form.repair_estimation_attached" label="Repair Estimation Attached" color="primary" />
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
          clearable
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
          clearable
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
          :error-messages="errorMessages.proposed_action"
          auto-grow
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
          clearable
        />
      </VCol>

      <!-- Approval Section -->
      <VCol cols="12" md="6">
        <VCheckbox v-model="form.approved" label="Approved" color="primary" />
      </VCol>

      <VCol cols="12" md="6">
        <VTextarea v-model="form.approval_remarks" label="Approval Remarks" rows="2" auto-grow />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField v-model="form.approval_date" type="date" label="Approval Date" />
      </VCol>

      <VCol cols="12" md="6">
        <VSelect
          v-model="form.approval_manager"
          :items="userOptions"
          item-title="title"
          item-value="value"
          label="Approval Manager"
          :loading="loadingUsers"
          clearable
        />
      </VCol>

      <!-- Submit Buttons -->
      <VCol cols="12">
        <VBtn type="submit" color="primary" :loading="loading" :disabled="loading">Submit</VBtn>
        <VBtn class="ms-2" variant="text" @click="router.push('/dashboards/asset-damage-reports')">Cancel</VBtn>
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
const apiCreateUrl = `${apiBaseUrl}/asset-damage-reports`
const apiProjectsUrl = `${apiBaseUrl}/projects`
const apiUsersUrl = `${apiBaseUrl}/users`
const apiAssetsUrl = `${apiBaseUrl}/assets`

const router = useRouter()

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
   Data & Form
------------------------------ */
const refForm = ref()
const form = ref({
  project_id: null,
  tag_no: '',
  report_date: '',
  time: '',
  damaged_asset_reported_on: '',
  reported_by: null,
  asset_damaged_by: null,
  asset_damaged_due_to: '',
  warranty_status: '',
  wear_condition: false,
  inadequate_use: false,
  repair_estimation_attached: false,
  report_received_on: '',
  received_time: '',
  asset_id: null,
  assessed_by: null,
  assessed_date: '',
  proposed_action: '',
  manager_action_date: '',
  manager_id: null,
  approved: false,
  approval_remarks: '',
  approval_date: '',
  approval_manager: null,
})

const loading = ref(false)
const message = ref('')
const errorMessages = ref({})

/* ------------------------------
   Dropdown Data
------------------------------ */
const projects = ref([])
const users = ref([])
const assets = ref([])

const loadingProjects = ref(false)
const loadingUsers = ref(false)
const loadingAssets = ref(false)

const requiredValidator = v => (!!v || v === 0) || 'This field is required'

/* ------------------------------
   Computed Dropdown Options
------------------------------ */
const projectOptions = computed(() => projects.value.map(p => ({ value: p.id, title: p.name ?? `Project #${p.id}` })))
const userOptions = computed(() => users.value.map(u => ({ value: u.id, title: `${u.name ?? '(no name)'} — ${u.user_code ?? u.id}` })))
const assetOptions = computed(() => assets.value.map(a => ({ value: a.id, title: a.asset_code ?? a.title ?? `Asset #${a.id}` })))

/* ------------------------------
   Fetching Logic
------------------------------ */
const fetchProjects = async () => {
  loadingProjects.value = true
  try {
    const res = await axios.get(apiProjectsUrl, { headers: getAuthHeaders() })
    const possible = [res.data?.data, res.data?.projects, res.data]
    projects.value = possible.find(Array.isArray) || []
  } finally {
    loadingProjects.value = false
  }
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

const fetchAssetsByProject = async projectId => {
  if (!projectId) { assets.value = []; return }
  loadingAssets.value = true
  try {
    const res = await axios.get(`${apiAssetsUrl}?project_id=${projectId}`, { headers: getAuthHeaders() })
    const possible = [res.data?.data, res.data?.assets, res.data]
    assets.value = possible.find(Array.isArray) || []
  } finally {
    loadingAssets.value = false
  }
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
    message.value = res.data?.message || 'Asset Damage Report created successfully.'
    router.push('/dashboards/asset-damage-report')
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
  await Promise.all([fetchProjects(), fetchUsers()])
})
</script>

<style scoped>
.mb-4 { margin-block-end: 16px; }
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.ms-2 { margin-inline-start: 8px; }
</style>
