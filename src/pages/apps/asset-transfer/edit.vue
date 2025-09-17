<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <h3>Edit Asset Transfer</h3>
      <VBtn variant="tonal" class="ms-auto" @click="$router.back()">Back</VBtn>
    </div>

    <VForm ref="refForm" @submit.prevent="submitForm">
      <VRow>
        <!-- Top meta -->
        <VCol cols="12" md="4">
          <VTextField
            v-model="form.issue_no"
            label="Issue No"
            :rules="[requiredValidator]"
            :error-messages="errorMessages.issue_no"
            :disabled="loading"
            clearable
          />
        </VCol>
        <VCol cols="12" md="4">
          <VTextField
            v-model="form.form_no"
            label="Form No"
            :rules="[requiredValidator]"
            :error-messages="errorMessages.form_no"
            :disabled="loading"
            clearable
          />
        </VCol>
        <VCol cols="12" md="4">
          <VTextField
            v-model="form.revision_date"
            type="date"
            label="Revision Date"
            :rules="[requiredValidator]"
            :error-messages="errorMessages.revision_date"
            :disabled="loading"
          />
        </VCol>

        <VCol cols="12" md="6">
          <VTextField
            v-model="form.date"
            type="date"
            label="Date"
            :rules="[requiredValidator]"
            :error-messages="errorMessages.date"
            :disabled="loading"
          />
        </VCol>
        <VCol cols="12" md="6">
          <VTextField
            v-model="form.tag_no"
            label="Tag No"
            :error-messages="errorMessages.tag_no"
            :disabled="loading"
            clearable
          />
        </VCol>

        <!-- Projects -->
        <VCol cols="12" md="6">
          <VSelect
            v-model="form.transferred_from_project_id"
            :items="projects"
            item-title="name"
            item-value="id"
            label="Transferred From Project"
            :loading="projectsLoading"
            :disabled="loading || projectsLoading || projects.length === 0"
            :rules="[requiredNumberValidator]"
            :error-messages="errorMessages.transferred_from_project_id"
            clearable
          />
        </VCol>

        <VCol cols="12" md="6">
          <VSelect
            v-model="form.transferred_to_project_id"
            :items="projects"
            item-title="name"
            item-value="id"
            label="Transferred To Project"
            :loading="projectsLoading"
            :disabled="loading || projectsLoading || projects.length === 0"
            :rules="[requiredNumberValidator]"
            :error-messages="errorMessages.transferred_to_project_id"
            clearable
          />
        </VCol>

        <!-- Transfer scheduling -->
        <VCol cols="12" md="6">
          <VTextField
            v-model="form.transfer_date"
            type="date"
            label="Transfer Date"
            :rules="[requiredValidator]"
            :error-messages="errorMessages.transfer_date"
            :disabled="loading"
          />
        </VCol>
        <VCol cols="12" md="6">
          <VTextField
            v-model="ui.transfer_time_hhmm"
            type="time"
            step="60"
            label="Transfer Time (HH:mm)"
            :rules="[requiredValidator]"
            :error-messages="errorMessages.transfer_time"
            :disabled="loading"
            @change="syncTimeWithSeconds('transfer')"
          />
        </VCol>

        <!-- People & logistics -->
        <VCol cols="12" md="6">
          <VSelect
            v-model="form.prepared_by"
            :items="usersFromProject"
            :item-title="userTitle"
            item-value="id"
            label="Prepared By"
            :loading="usersFromLoading"
            :disabled="loading || !form.transferred_from_project_id || usersFromLoading || usersFromProject.length === 0"
            :rules="[requiredNumberValidator]"
            :error-messages="errorMessages.prepared_by"
            clearable
          />
        </VCol>
        <VCol cols="12" md="6">
          <VSelect
            v-model="form.driver_id"
            :items="usersToProject.filter(u => u.role === 'Drivers')"
            :item-title="userTitle"
            item-value="id"
            label="Driver"
            :loading="usersToLoading"
            :disabled="loading || !form.transferred_to_project_id || usersToLoading || usersToProject.length === 0"
            :error-messages="errorMessages.driver_id"
            clearable
          />
        </VCol>

        <VCol cols="12" md="6">
          <VTextField
            v-model="form.contact_details"
            label="Contact Details"
            :error-messages="errorMessages.contact_details"
            :disabled="loading"
            clearable
          />
        </VCol>
        <VCol cols="12" md="6">
          <VTextField
            v-model="form.vehicle_plate_no"
            label="Vehicle Plate No"
            :error-messages="errorMessages.vehicle_plate_no"
            :disabled="loading"
            clearable
          />
        </VCol>

        <!-- Approvals -->
        <VCol cols="12">
          <h4 class="mb-2">Approvals</h4>
        </VCol>

        <VCol cols="12" md="4">
          <VSelect
            v-model="form.plant_manager_status"
            :items="[
              { title: 'Approve', value: 'approved' },
              { title: 'Disapprove', value: 'disapproved' }
            ]"
            label="Plant Manager Status"
            item-title="title"
            item-value="value"
            :rules="[requiredValidator]"
            :error-messages="errorMessages.plant_manager_status"
            :disabled="loading"
            clearable
          />
        </VCol>

        <VCol cols="12" md="4">
          <VTextField
            v-model="form.plant_manager_status_date"
            type="date"
            label="Plant Manager Status Date"
            :disabled="loading"
          />
        </VCol>
        <VCol cols="12">
          <VTextarea
            v-model="form.plant_manager_remarks"
            label="Plant Manager Remarks"
            :rows="2"
            :disabled="loading"
          />
        </VCol>

        <VCol cols="12" md="4">
          <VSelect
            v-model="form.project_incharge_status"
            :items="[
              { title: 'Approve', value: 'approved' },
              { title: 'Disapprove', value: 'disapproved' }
            ]"
            label="Project In-Charge Status"
            item-title="title"
            item-value="value"
            :rules="[requiredValidator]"
            :error-messages="errorMessages.project_incharge_status"
            :disabled="loading"
            clearable
          />
        </VCol>

        <VCol cols="12" md="4">
          <VTextField
            v-model="form.project_incharge_status_date"
            type="date"
            label="Project In-Charge Status Date"
            :disabled="loading"
          />
        </VCol>
        <VCol cols="12">
          <VTextarea
            v-model="form.project_incharge_remarks"
            label="Project In-Charge Remarks"
            :rows="2"
            :disabled="loading"
          />
        </VCol>

        <!-- Receiving -->
        <VCol cols="12">
          <h4 class="mb-2">Receiving</h4>
        </VCol>

        <VCol cols="12" md="4">
          <VSelect
            v-model="form.received_from"
            :items="usersToProject"
            :item-title="userTitle"
            item-value="id"
            label="Received From"
            :loading="usersToLoading"
            :disabled="loading || !form.transferred_to_project_id || usersToLoading || usersToProject.length === 0"
            :rules="[requiredNumberValidator]"
            :error-messages="errorMessages.received_from"
            clearable
          />
        </VCol>

        <VCol cols="12" md="4">
          <VSelect
            v-model="form.received_by"
            :items="usersToProject"
            :item-title="userTitle"
            item-value="id"
            label="Received By"
            :loading="usersToLoading"
            :disabled="loading || !form.transferred_to_project_id || usersToLoading || usersToProject.length === 0"
            :rules="[requiredNumberValidator]"
            :error-messages="errorMessages.received_by"
            clearable
          />
        </VCol>

        <VCol cols="12" md="4">
          <VTextField
            v-model="form.received_date"
            type="date"
            label="Received Date"
            :disabled="loading"
          />
        </VCol>
        <VCol cols="12" md="4">
          <VTextField
            v-model="ui.received_time_hhmm"
            type="time"
            step="60"
            label="Received Time (HH:mm)"
            :disabled="loading"
            @change="syncTimeWithSeconds('received')"
          />
        </VCol>

        <VCol cols="12" md="4">
          <VSelect
            v-model="form.inspected_by"
            :items="usersToProject"
            :item-title="userTitle"
            item-value="id"
            label="Inspected By"
            :loading="usersToLoading"
            :disabled="loading || !form.transferred_to_project_id || usersToLoading || usersToProject.length === 0"
            :rules="[requiredNumberValidator]"
            :error-messages="errorMessages.inspected_by"
            clearable
          />
        </VCol>
        <VCol cols="12" md="4">
          <VSwitch v-model="form.equipment_status" label="is Equipment OK?" inset :disabled="loading" />
        </VCol>

        <!-- Items -->
        <VCol cols="12">
          <div class="d-flex justify-between align-center">
            <h4>Items</h4>
            <VBtn size="small" @click="addItem" :disabled="loading">Add Item</VBtn>
          </div>
          <div v-if="form.items.length === 0" class="text-medium-emphasis mt-2">
            No items yet. Click “Add Item”.
          </div>
        </VCol>

        <!-- Asset dropdown just like create.vue -->
        <VCol cols="12" v-for="(it, idx) in form.items" :key="idx">
          <div class="item-row">
            <VSelect
              v-model="it.asset_id"
              :items="assets"
              item-title="label"
              item-value="id"
              label="Asset"
              :loading="assetsLoading"
              :disabled="loading || assetsLoading || assets.length === 0"
              :rules="[requiredNumberValidator]"
              class="mr-2 flex-1"
              clearable
            />
            <VTextField
              v-model.number="it.qty"
              type="number"
              min="1"
              label="Qty"
              :rules="[requiredNumberValidator]"
              :disabled="loading"
              class="mr-2"
            />
            <VTextField v-model="it.remarks" label="Remarks" class="mr-2 flex-1" :disabled="loading" />
            <VBtn color="error" variant="tonal" @click="removeItem(idx)" :disabled="loading">Remove</VBtn>
          </div>
        </VCol>

        <!-- Submit -->
        <VCol cols="12" class="mt-2">
          <VBtn type="submit" color="primary" :loading="saving" :disabled="saving || loading">
            Update
          </VBtn>
        </VCol>
      </VRow>

      <div v-if="message" class="mt-4">{{ message }}</div>
    </VForm>
  </div>
</template>

<script setup>
import axios from 'axios'
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  VBtn, VCol, VForm, VRow,
  VSelect, VSwitch, VTextField, VTextarea
} from 'vuetify/components'

const apiBaseUrl = 'https://dm.kreashionsoftwarehouse.com/astraConst/public/api'
const router = useRouter()
const route = useRoute()
const transferId = route.params.id

// Projects
const projects = ref([])
const projectsLoading = ref(false)

// Users (from & to projects)
const usersFromProject = ref([])
const usersToProject = ref([])
const usersFromLoading = ref(false)
const usersToLoading = ref(false)
const userTitle = u => (u?.user_code ? `${u.name} — ${u.user_code}` : u?.name ?? '')

const today = new Date().toISOString().split('T')[0]

// Assets
const assets = ref([])            // [{ id, label }]
const assetsLoading = ref(false)

const form = ref({
  issue_no: '',
  revision_date: '',
  form_no: '',
  date: today,
  tag_no: '',
  transferred_from_project_id: null,
  transferred_to_project_id: null,
  transfer_date: '',
  transfer_time: '',
  prepared_by: null,
  driver_id: null,
  contact_details: '',
  vehicle_plate_no: '',
  plant_manager_status: 'approved',
  plant_manager_remarks: '',
  plant_manager_status_date: today,
  project_incharge_status: 'approved',
  project_incharge_remarks: '',
  project_incharge_status_date: today,
  received_from: null,
  received_by: null,
  received_date: '',
  received_time: '',
  inspected_by: null,
  equipment_status: false,
  items: [],
})

const ui = ref({
  transfer_time_hhmm: '',
  received_time_hhmm: '',
})

const refForm = ref()
const loading = ref(false)   // full-page/blocking while fetching existing transfer
const saving = ref(false)
const message = ref('')
const errorMessages = ref({})

const requiredValidator = v => (!!v || v === 0) || 'This field is required'
const requiredNumberValidator = v => (v !== null && v !== '' && !Number.isNaN(Number(v))) || 'A number is required'

const getCookie = name => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

// Time helpers
const ensureSeconds = hhmm => {
  if (!hhmm) return ''
  return /^\d{2}:\d{2}(:\d{2})?$/.test(hhmm)
    ? (hhmm.length === 5 ? `${hhmm}:00` : hhmm)
    : ''
}
const toHHmm = hhmmss => {
  if (!hhmmss) return ''
  const m = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(hhmmss)
  return m ? `${m[1]}:${m[2]}` : ''
}
const syncTimeWithSeconds = which => {
  if (which === 'transfer') form.value.transfer_time = ensureSeconds(ui.value.transfer_time_hhmm)
  else if (which === 'received') form.value.received_time = ensureSeconds(ui.value.received_time_hhmm)
}

// Items
const addItem = () => form.value.items.push({ asset_id: null, qty: 1, remarks: '' })
const removeItem = idx => form.value.items.splice(idx, 1)

// Fetch projects
const fetchProjects = async () => {
  try {
    projectsLoading.value = true
    const accessToken = getCookie('accessToken')
    if (!accessToken) throw new Error('Access token is missing. Please log in.')
    const decodedToken = decodeURIComponent(accessToken)

    const res = await axios.get(`${apiBaseUrl}/projects`, {
      headers: { Authorization: `Bearer ${decodedToken}`, Accept: 'application/json' },
    })
    const list = Array.isArray(res.data) ? res.data
      : Array.isArray(res.data?.data) ? res.data.data
      : []
    projects.value = list.map(p => ({ id: p.id, name: p.name }))
  } catch (e) {
    console.error('Error fetching projects:', e)
  } finally {
    projectsLoading.value = false
  }
}

// Fetch assets
const fetchAssets = async () => {
  try {
    assetsLoading.value = true
    const accessToken = getCookie('accessToken')
    if (!accessToken) throw new Error('Access token is missing. Please log in.')
    const decodedToken = decodeURIComponent(accessToken)

    const res = await axios.get(`${apiBaseUrl}/assets`, {
      headers: { Authorization: `Bearer ${decodedToken}`, Accept: 'application/json' },
    })

    const list = Array.isArray(res.data) ? res.data
      : Array.isArray(res.data?.data) ? res.data.data
      : []

    assets.value = list.map(a => {
      const code = a.code || `AST-${a.id}`
      const cat = a.category_name || ''
      const sub = a.sub_category ? ` / ${a.sub_category}` : ''
      return { id: Number(a.id), label: `${code} — ${cat}${sub}`.trim() }
    })
  } catch (e) {
    console.error('Error fetching assets:', e)
  } finally {
    assetsLoading.value = false
  }
}

// Fetch users for a project
const fetchProjectUsers = async (projectId) => {
  if (!projectId) return []
  const accessToken = getCookie('accessToken')
  if (!accessToken) throw new Error('Access token is missing. Please log in.')
  const decodedToken = decodeURIComponent(accessToken)

  const headers = { Authorization: `Bearer ${decodedToken}`, Accept: 'application/json' }

  try {
    const r = await axios.get(`${apiBaseUrl}/projects/${projectId}/users/sync`, { headers })
    const arr = r.data?.project?.users ?? r.data?.users ?? []
    return Array.isArray(arr) ? arr : []
  } catch {
    try {
      const r2 = await axios.post(`${apiBaseUrl}/projects/${projectId}/users/sync`, {}, { headers })
      const arr2 = r2.data?.project?.users ?? r2.data?.users ?? []
      return Array.isArray(arr2) ? arr2 : []
    } catch (e2) {
      console.error('Error fetching project users:', e2)
      return []
    }
  }
}

// Watchers: when project changes, load its users and clear selected user
watch(() => form.value.transferred_from_project_id, async (pid) => {
  form.value.prepared_by = null
  usersFromProject.value = []
  if (!pid) return
  usersFromLoading.value = true
  usersFromProject.value = (await fetchProjectUsers(pid)).map(u => ({
    id: u.id, name: u.name, user_code: u.user_code
  }))
  usersFromLoading.value = false
})

watch(() => form.value.transferred_to_project_id, async (pid) => {
  form.value.driver_id = null
  form.value.received_from = null
  form.value.received_by = null
  usersToProject.value = []
  if (!pid) return
  usersToLoading.value = true
  const rawUsers = await fetchProjectUsers(pid)
  usersToProject.value = rawUsers.map(u => ({
    id: u.id,
    name: u.name,
    user_code: u.user_code,
    role: u.role
  }))
  usersToLoading.value = false
})

// Load existing transfer
const fetchTransfer = async () => {
  try {
    loading.value = true
    message.value = ''
    errorMessages.value = {}

    const accessToken = getCookie('accessToken')
    if (!accessToken) throw new Error('Access token is missing. Please log in.')
    const decodedToken = decodeURIComponent(accessToken)

    const res = await axios.get(`${apiBaseUrl}/asset-transfers/${transferId}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${decodedToken}`,
      },
    })

    const t = res.data?.data ?? res.data ?? {}

    // Set projects first so watchers fetch users for those projects
    form.value.transferred_from_project_id = Number(t.transferred_from_project_id ?? null)
    form.value.transferred_to_project_id   = Number(t.transferred_to_project_id ?? null)

    // Core fields
    form.value.issue_no = t.issue_no ?? ''
    form.value.form_no = t.form_no ?? ''
    form.value.revision_date = t.revision_date ?? ''
    form.value.date = t.date ?? today
    form.value.tag_no = t.tag_no ?? ''

    // Scheduling
    form.value.transfer_date = t.transfer_date ?? ''
    form.value.transfer_time = t.transfer_time ?? ''
    ui.value.transfer_time_hhmm = toHHmm(form.value.transfer_time)

    // People & logistics
    form.value.prepared_by = t.prepared_by ?? null
    form.value.driver_id = t.driver_id ?? null
    form.value.contact_details = t.contact_details ?? ''
    form.value.vehicle_plate_no = t.vehicle_plate_no ?? ''

    // Approvals
    form.value.plant_manager_status = (t.plant_manager_status ?? 'approved')
    form.value.plant_manager_remarks = t.plant_manager_remarks ?? ''
    form.value.plant_manager_status_date = t.plant_manager_status_date ?? today

    form.value.project_incharge_status = (t.project_incharge_status ?? 'approved')
    form.value.project_incharge_remarks = t.project_incharge_remarks ?? ''
    form.value.project_incharge_status_date = t.project_incharge_status_date ?? today

    // Receiving
    form.value.received_from = t.received_from ?? null
    form.value.received_by = t.received_by ?? null
    form.value.received_date = t.received_date ?? ''
    form.value.received_time = t.received_time ?? ''
    ui.value.received_time_hhmm = toHHmm(form.value.received_time)

    form.value.inspected_by = t.inspected_by ?? null
    form.value.equipment_status = !!t.equipment_status

    // Items
    const items = Array.isArray(t.items) ? t.items : (Array.isArray(t.asset_transfer_items) ? t.asset_transfer_items : [])
    form.value.items = items.map(i => ({
      asset_id: Number(i.asset_id ?? i.asset?.id ?? null),
      qty: Number(i.qty ?? i.quantity ?? 1),
      remarks: i.remarks ?? ''
    }))
  } catch (error) {
    console.error('Error fetching asset transfer:', error)
    message.value = error.response?.data?.message || 'Failed to load asset transfer.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await Promise.all([fetchProjects(), fetchAssets()])
  await fetchTransfer()
})

// Submit update
const submitForm = async () => {
  try {
    saving.value = true
    errorMessages.value = {}
    message.value = ''

    // sync times to HH:mm:ss
    syncTimeWithSeconds('transfer')
    syncTimeWithSeconds('received')

    const { valid } = (await (refForm.value?.validate?.() ?? Promise.resolve({ valid: true })))
    if (!valid) { saving.value = false; return }
    if (!form.value.items.length) { message.value = 'Please add at least one item.'; saving.value = false; return }

    const accessToken = getCookie('accessToken')
    if (!accessToken) throw new Error('Access token is missing. Please log in.')
    const decodedToken = decodeURIComponent(accessToken)

    const payload = { ...form.value }

    await axios.put(`${apiBaseUrl}/asset-transfers/${transferId}`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${decodedToken}`,
      },
    })

    message.value = 'Asset transfer updated successfully!'
    router.push('/dashboards/assettransfers')
  } catch (error) {
    console.error('Error updating asset transfer:', error)
    if (error.response?.data?.errors) {
      errorMessages.value = error.response.data.errors
      message.value = 'Please fix the highlighted errors.'
    } else {
      message.value = error.response?.data?.message || 'Failed to update asset transfer.'
    }
  } finally {
    saving.value = false
  }
}
</script>

<style>
.mb-4 { margin-block-end: 16px; }
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.ms-auto { margin-inline-start: auto; }
.item-row { display: flex; align-items: center; gap: 8px; }
.mr-2 { margin-inline-end: 8px; }
.flex-1 { flex: 1; }
</style>
