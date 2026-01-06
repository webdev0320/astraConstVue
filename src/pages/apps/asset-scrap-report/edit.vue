<template>
  <VCard class="p-4">
    <VCardTitle>Edit Asset Scrap Report</VCardTitle>
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
              :items="mappedUsers"
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
              :loading="assetsLoading"
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
              :items="mappedUsers"
              item-title="name"
              item-value="id"
              label="Manager"
              :error-messages="errorMessages.manager_id"
              hide-details="auto"
            />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="form.manager_action_date" label="Manager Action Date" type="date" />
          </VCol>

          <!-- Report Received -->
          <VCol cols="12" md="6">
            <VTextField v-model="form.report_received_on" label="Report Received On" type="date" />
          </VCol>
          <VCol cols="12" md="6">
            <VTextField v-model="form.received_time" label="Received Time" type="time" />
          </VCol>

          <!-- Assessed -->
          <VCol cols="12" md="6">
            <VSelect v-model="form.assessed_by" :items="mappedUsers" item-title="name" item-value="id" label="Assessed By" />
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
            <VSelect v-model="form.approval_manager" :items="mappedUsers" item-title="name" item-value="id" label="Approval Manager" />
          </VCol>

          <!-- Submit -->
          <VCol cols="12" class="text-end">
            <VBtn color="primary" type="submit" :loading="loading">Update Report</VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCardText>
  </VCard>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'

// --------------------
// Helpers
// --------------------
const requiredValidator = value => !!value || 'This field is required'
const getCookie = name => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}
const getToken = () => {
  const cookieToken = getCookie('accessToken')
  if (cookieToken) return decodeURIComponent(cookieToken)
  const lsToken = localStorage.getItem('accessToken')
  return lsToken ? decodeURIComponent(lsToken) : null
}
const getAuthHeaders = () => {
  const token = getToken()
  if (!token) throw new Error('Access token missing')
  return { Accept: 'application/json', Authorization: `Bearer ${token}` }
}

// --------------------
// Refs
// --------------------
const formRef = ref(null)
const loading = ref(false)
const assetsLoading = ref(false)
const errorMessages = ref({})
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

// --------------------
// Dropdowns
// --------------------
const projects = ref([])
const assets = ref([])
const users = ref([])
const assetDamageReports = ref([])
const baseUrl = import.meta.env.VITE_API_BASE_URL

const mappedUsers = computed(() =>
  users.value.map(u => ({
    id: u.id,
    name: `${u.name ?? '(no name)'} — ${u.user_code ?? u.id}`
  }))
)

// --------------------
// Fetch dropdowns
// --------------------
const extractArray = res => {
  if (!res) return []
  if (Array.isArray(res.data?.data?.users)) return res.data.data.users
  if (Array.isArray(res.data?.data)) return res.data.data
  if (Array.isArray(res.data)) return res.data
  return []
}

const fetchDropdowns = async () => {
  try {
    const [projRes, userRes, damageRes] = await Promise.all([
      axios.get(`${baseUrl}/projects`, { headers: getAuthHeaders() }),
      axios.get(`${baseUrl}/users`, { headers: getAuthHeaders() }),
      axios.get(`${baseUrl}/asset-damage-reports`, { headers: getAuthHeaders() }),
    ])
    projects.value = extractArray(projRes)
    users.value = extractArray(userRes)
    assetDamageReports.value = extractArray(damageRes)
  } catch (err) {
    console.error('Dropdown fetch error', err)
  }
}

// --------------------
// Fetch assets by project
// --------------------
const fetchAssets = async projectId => {
  if (!projectId) {
    assets.value = []
    return
  }
  try {
    assetsLoading.value = true
    const res = await axios.get(`${baseUrl}/assets`, {
      headers: getAuthHeaders(),
      params: { project_id: projectId },
    })
    const list = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []
    assets.value = list.map(a => ({
      id: Number(a.id),
      name: `${a.code ?? ''} — ${a.title ?? a.name ?? ''}`.trim(),
      quantity: Number(a.quantity ?? 0),
      remaining_quantity: Number(a.remaining_quantity ?? 0),
    }))
  } catch (err) {
    console.error('Error fetching assets:', err)
  } finally {
    assetsLoading.value = false
  }
}

watch(() => form.value.project_id, pid => {
  form.value.asset_id = ''
  if (pid) fetchAssets(pid)
})

// --------------------
// Load existing report
// --------------------
const route = useRoute()
const reportId = route.params.id

const loadReport = async () => {
  try {
    const res = await axios.get(`${baseUrl}/asset-scrap-reports/${reportId}`, {
      headers: getAuthHeaders()
    })
    const d = res.data.data

    // Set project first
    form.value.project_id = d.project_id

    // Fetch assets for this project first
    if (d.project_id) {
      await fetchAssets(d.project_id) // wait for assets to load
    }

    // Then set rest of form, including asset_id
    form.value = {
      ...form.value, // project_id is already set
      tag_no: d.tag_no,
      report_date: d.report_date,
      time: d.time,
      asset_scraped_on: d.asset_scraped_on,
      scraped_by: d.scraped_by,
      asset_purchased_transferred_on: d.asset_purchased_transferred_on,
      transferred_from: d.transferred_from,
      asset_damage_report_id: d.asset_damage_report_id,
      photos_attached: d.photos_attached,
      asset_damage_report_attached: d.asset_damage_report_attached,
      repairing_estimation_attached: d.repairing_estimation_attached,
      asset_id: d.asset_id, // now this will match the loaded assets
      proposed_action: d.proposed_action,
      manager_action_date: d.manager_action_date,
      manager_id: d.manager_id,
      report_received_on: d.report_received_on,
      received_time: d.received_time,
      assessed_by: d.assessed_by,
      assessed_date: d.assessed_date,
      approved: Boolean(d.approved),
      approval_remarks: d.approval_remarks,
      approval_date: d.approval_date,
      approval_manager: d.approval_manager,
    }

  } catch (err) {
    console.error('Error loading report:', err)
  }
}


// --------------------
// Submit update
// --------------------
const submitForm = async () => {
  try {
    loading.value = true

     const payload = {
    ...form.value,
      time: form.value.time ? form.value.time.slice(0,5) : null, // "HH:mm"
      received_time: form.value.received_time ? form.value.received_time.slice(0,5) : null, // "HH:mm"
    };

    await axios.put(`${baseUrl}/asset-scrap-reports/${reportId}`, payload, { headers: getAuthHeaders() })
    alert('Asset Scrap Report updated successfully!')
    router.push("/dashboards/asset-scrap-report");
  } catch (err) {
    if (err.response?.data?.errors) errorMessages.value = err.response.data.errors
    else console.error('Update error:', err)
  } finally {
    loading.value = false
  }
}

// --------------------
// Mounted
// --------------------
onMounted(async () => {
  await fetchDropdowns()
  await loadReport()
})
</script>
