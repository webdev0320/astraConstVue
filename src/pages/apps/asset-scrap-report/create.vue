<template>
  <VCard class="p-4">
    <VCardTitle>Asset Scrap Report</VCardTitle>
    <VCardText>
      <VForm ref="formRef" @submit.prevent="submitForm">
        <VRow>
          <!-- Project -->
          <VCol cols="12" md="6">
            <VSelect
              v-model="form.project_id"
              :items="projects"
              item-title="name"
              item-value="id"
              label="Project"
              :error-messages="errorMessages.project_id"
              hide-details="auto"
              :rules="[requiredValidator]"
            />
          </VCol>

          <!-- Tag No -->
          <VCol cols="12" md="6">
            <VTextField
              v-model="form.tag_no"
              label="Tag Number"
              :error-messages="errorMessages.tag_no"
              hide-details="auto"
              :rules="[requiredValidator]"
            />
          </VCol>

          <!-- Report Date & Time -->
          <VCol cols="12" md="6">
            <VTextField v-model="form.report_date" label="Report Date" type="date" />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="form.time" label="Time" type="time" />
          </VCol>

          <!-- Scrap Info -->
          <VCol cols="12" md="6">
            <VTextField v-model="form.asset_scraped_on" label="Asset Scraped On" type="date" />
          </VCol>

          <VCol cols="12" md="6">
            <VSelect
              v-model="form.scraped_by"
              :items="users"
              item-title="name"
              item-value="id"
              label="Scraped By"
              :error-messages="errorMessages.scraped_by"
              hide-details="auto"
              :rules="[requiredValidator]"
            />
          </VCol>

          <!-- Purchased/Transferred -->
          <VCol cols="12" md="6">
            <VTextField
              v-model="form.asset_purchased_transferred_on"
              label="Asset Purchased/Transferred On"
              type="date"
            />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField
              v-model="form.transferred_from"
              label="Transferred From"
              :error-messages="errorMessages.transferred_from"
              hide-details="auto"
            />
          </VCol>

          <!-- Asset Damage Report -->
          <VCol cols="12" md="6">
            <VSelect
              v-model="form.asset_damage_report_id"
              :items="assetDamageReports"
              item-title="tag_no"
              item-value="id"
              label="Asset Damage Report"
              :error-messages="errorMessages.asset_damage_report_id"
              hide-details="auto"
            />
          </VCol>

          <!-- Attachments -->
          <VCol cols="12" md="4">
            <VSwitch v-model="form.photos_attached" label="Photos Attached" />
          </VCol>
          <VCol cols="12" md="4">
            <VSwitch v-model="form.asset_damage_report_attached" label="Damage Report Attached" />
          </VCol>
          <VCol cols="12" md="4">
            <VSwitch v-model="form.repairing_estimation_attached" label="Repair Estimation Attached" />
          </VCol>

          <!-- Asset -->
          <VCol cols="12" md="6">
            <VSelect
              v-model="form.asset_id"
              :items="assets"
              item-title="name"
              item-value="id"
              label="Asset"
              :error-messages="errorMessages.asset_id"
              hide-details="auto"
              :rules="[requiredValidator]"
            />
          </VCol>

          <!-- Proposed Action -->
          <VCol cols="12" md="6">
            <VTextField
              v-model="form.proposed_action"
              label="Proposed Action"
              :error-messages="errorMessages.proposed_action"
              hide-details="auto"
            />
          </VCol>

          <!-- Manager -->
          <VCol cols="12" md="6">
            <VSelect
              v-model="form.manager_id"
              :items="users"
              item-title="name"
              item-value="id"
              label="Manager"
              :error-messages="errorMessages.manager_id"
              hide-details="auto"
            />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField
              v-model="form.manager_action_date"
              label="Manager Action Date"
              type="date"
            />
          </VCol>

          <!-- Report Received -->
          <VCol cols="12" md="6">
            <VTextField
              v-model="form.report_received_on"
              label="Report Received On"
              type="date"
            />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField v-model="form.received_time" label="Received Time" type="time" />
          </VCol>

          <!-- Assessed -->
          <VCol cols="12" md="6">
            <VSelect
              v-model="form.assessed_by"
              :items="users"
              item-title="name"
              item-value="id"
              label="Assessed By"
            />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="form.assessed_date" label="Assessed Date" type="date" />
          </VCol>

          <!-- Approval -->
          <VCol cols="12" md="6">
            <VSwitch v-model="form.approved" label="Approved" />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField v-model="form.approval_remarks" label="Approval Remarks" />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField v-model="form.approval_date" label="Approval Date" type="date" />
          </VCol>

          <VCol cols="12" md="6">
            <VSelect
              v-model="form.approval_manager"
              :items="users"
              item-title="name"
              item-value="id"
              label="Approval Manager"
            />
          </VCol>

          <!-- Submit -->
          <VCol cols="12" class="text-end">
            <VBtn color="primary" type="submit" :loading="loading">Submit Report</VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCardText>
  </VCard>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted, watch } from 'vue'

// Simple required validator
const requiredValidator = value => !!value || 'This field is required'

// Helper to get cookie
const getCookie = name => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

// Token helpers
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

// API URLs
const baseUrl = import.meta.env.VITE_API_BASE_URL
const apiUrl = `${baseUrl}/asset-scrap-reports`

// Refs
const formRef = ref(null)
const loading = ref(false)
const assetsLoading = ref(false)
const errorMessages = ref({})

// Dropdown data
const projects = ref([])
const assets = ref([])
const users = ref([])
const assetDamageReports = ref([])

// Form data
const form = ref({
  project_id: '',
  tag_no: '',
  report_date: '',
  time: '',
  asset_scraped_on: '',
  scraped_by: '',
  asset_purchased_transferred_on: '',
  transferred_from: '',
  asset_damage_report_id: '',
  photos_attached: false,
  asset_damage_report_attached: false,
  repairing_estimation_attached: false,
  asset_id: '',
  proposed_action: '',
  manager_action_date: '',
  manager_id: '',
  report_received_on: '',
  received_time: '',
  assessed_by: '',
  assessed_date: '',
  approved: false,
  approval_remarks: '',
  approval_date: '',
  approval_manager: '',
})

// 🔹 Fetch dropdowns with safe fallback
const fetchDropdowns = async () => {
  try {
    const [projectRes, userRes, damageReportRes] = await Promise.all([
      axios.get(`${baseUrl}/projects`, { headers: getAuthHeaders() }),
      axios.get(`${baseUrl}/users`, { headers: getAuthHeaders() }),
      axios.get(`${baseUrl}/asset-damage-reports`, { headers: getAuthHeaders() }),
    ])

    console.log('Raw API responses:', {
      projects: projectRes.data,
      users: userRes.data,
      assetDamageReports: damageReportRes.data,
    })

    projects.value = Array.isArray(projectRes.data)
      ? projectRes.data
      : Array.isArray(projectRes.data?.data)
      ? projectRes.data.data
      : []

    users.value = Array.isArray(userRes.data)
      ? userRes.data
      : Array.isArray(userRes.data?.data)
      ? userRes.data.data
      : []

    assetDamageReports.value = Array.isArray(damageReportRes.data)
      ? damageReportRes.data
      : Array.isArray(damageReportRes.data?.data)
      ? damageReportRes.data.data
      : []
  } catch (error) {
    console.error('Dropdown fetch error:', error)
  }
}

// 🔹 Fetch assets for selected project
const fetchAssets = async pid => {
  try {
    if (!pid) return
    assets.value = []
    assetsLoading.value = true

    const res = await axios.get(`${baseUrl}/assets`, {
      headers: getAuthHeaders(),
      params: { project_id: pid },
    })

    const list = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
      ? res.data.data
      : []

    assets.value = list.map(a => ({
      id: Number(a.id),
      name: `${a.code ?? ''} — ${a.title ?? ''}`.trim(),
      quantity: Number(a.quantity ?? 0),
      remaining_quantity: Number(a.remaining_quantity ?? 0),
    }))

    console.log('Assets loaded:', assets.value)
  } catch (error) {
    console.error('Error fetching assets:', error)
  } finally {
    assetsLoading.value = false
  }
}

// 🔹 Watch project change and reload assets
watch(
  () => form.value.project_id,
  pid => {
    form.value.asset_id = null
    if (pid) fetchAssets(pid)
  }
)

// 🔹 Submit form
const submitForm = async () => {
  try {
    loading.value = true
    const { data } = await axios.post(apiUrl, form.value, { headers: getAuthHeaders() })
    alert('Asset Scrap Report submitted successfully!')
    console.log('Response:', data)
    formRef.value.reset()
  } catch (error) {
    if (error.response?.data?.errors) {
      errorMessages.value = error.response.data.errors
    } else {
      console.error('Submission error:', error)
    }
  } finally {
    loading.value = false
  }
}

// 🔹 Mount
onMounted(() => {
  fetchDropdowns()
})
</script>


