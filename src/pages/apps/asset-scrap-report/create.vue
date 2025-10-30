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
import { ref, onMounted } from 'vue'
import { requiredValidator } from '@/validators'

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
const apiUrl = `${baseUrl}/api/asset-scrap-reports`

// Refs
const formRef = ref(null)
const loading = ref(false)

// Dropdown data
const projects = ref([])
const assets = ref([])
const users = ref([])
const assetDamageReports = ref([])

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

const errorMessages = ref({})

// Fetch dropdowns
const fetchDropdowns = async () => {
  try {
    const [projectRes, assetRes, userRes, damageReportRes] = await Promise.all([
      axios.get(`${baseUrl}/api/projects`, { headers: getAuthHeaders() }),
      axios.get(`${baseUrl}/api/assets`, { headers: getAuthHeaders() }),
      axios.get(`${baseUrl}/api/users`, { headers: getAuthHeaders() }),
      axios.get(`${baseUrl}/api/asset-damage-reports`, { headers: getAuthHeaders() }),
    ])
    projects.value = projectRes.data.data
    assets.value = assetRes.data.data
    users.value = userRes.data.data
    assetDamageReports.value = damageReportRes.data.data
  } catch (error) {
    console.error('Dropdown fetch error:', error)
  }
}

// Submit
const submitForm = async () => {
  try {
    loading.value = true
    const { data } = await axios.post(apiUrl, form.value, { headers: getAuthHeaders() })
    alert('Asset Scrap Report submitted successfully!')
    console.log(data)
    formRef.value.reset()
  } catch (error) {
    if (error.response?.data?.errors) errorMessages.value = error.response.data.errors
    else console.error('Submission error:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDropdowns()
})
</script>
