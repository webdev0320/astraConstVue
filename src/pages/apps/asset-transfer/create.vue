<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <h3>Create Asset Transfer</h3>
      <VBtn variant="tonal" class="ms-auto" @click="$router.back()">Back</VBtn>
    </div>

    <VForm ref="refForm" @submit.prevent="submitForm">
      <VRow>
        <!-- Top meta -->
        <VCol cols="12" md="4">
              <VTextField
                v-model="form.asset_transer_no"
                label="Asset Transfer Request #"
                :error-messages="errorMessages.asset_transer_no"
                clearable
              />
          </VCol>
        <VCol cols="12" md="4">
          <VTextField
            v-model="form.issue_no"
            label="Issue No"
            :rules="[requiredValidator]"
            :error-messages="errorMessages.issue_no"
            clearable
          />
        </VCol>
        <VCol cols="12" md="4">
          <VTextField
            v-model="form.form_no"
            label="Form No"
            :rules="[requiredValidator]"
            :error-messages="errorMessages.form_no"
            clearable
          />
        </VCol>
        <VCol cols="12" md="4">
          <VTextField
            v-model="form.revision_date"
            type="date"
            label="Revision Date"
            :rules="[requiredValidator,dateNotPastValidator]"
            :error-messages="errorMessages.revision_date"
          />
        </VCol>

        <VCol cols="12" md="4">
          <VTextField
            v-model="form.date"
            type="date"
            label="Date"
            :rules="[requiredValidator,dateNotPastValidator]"
            :error-messages="errorMessages.date"
          />
        </VCol>
        <VCol cols="12" md="4">
          <VTextField
            v-model="form.tag_no"
            label="Tag No"
            :error-messages="errorMessages.tag_no"
            clearable
          />
        </VCol>

        <!-- Projects -->
        <VCol cols="12" md="4">
          <VSelect
            v-model="form.transferred_from_project_id"
            :items="projects"
            item-title="name"
            item-value="id"
            label="Transferred From Project"
            :loading="projectsLoading"
            :disabled="projectsLoading || projects.length === 0"
            :rules="[requiredNumberValidator]"
            :error-messages="errorMessages.transferred_from_project_id"
            clearable
          />
        </VCol>

        <VCol cols="12" md="4">
          <VSelect
            v-model="form.transferred_to_project_id"
            :items="projects"
            item-title="name"
            item-value="id"
            label="Transferred To Project"
            :loading="projectsLoading"
            :disabled="projectsLoading || projects.length === 0"
            :rules="[requiredNumberValidator]"
            :error-messages="errorMessages.transferred_to_project_id"
            clearable
          />
        </VCol>

        <!-- Transfer scheduling -->
        <VCol cols="12" md="4">
          <VTextField
            v-model="form.transfer_date"
            type="date"
            label="Transfer Date"
            :rules="[requiredValidator]"
            :error-messages="errorMessages.transfer_date"
          />
        </VCol>
        <VCol cols="12" md="4">
          <VTextField
            v-model="ui.transfer_time_hhmm"
            type="time"
            step="60"
            label="Transfer Time (HH:mm)"
            :rules="[requiredValidator]"
            :error-messages="errorMessages.transfer_time"
            @change="syncTimeWithSeconds('transfer')"
          />
        </VCol>

        <!-- People & logistics -->
        <VCol cols="12" md="4">
          <VSelect
            v-model="form.prepared_by"
            :items="usersFromProject"
            :item-title="userTitle"
            item-value="id"
            label="Prepared By"
            :loading="usersFromLoading"
            :disabled="!form.transferred_from_project_id || usersFromLoading || usersFromProject.length === 0"
            :rules="[requiredNumberValidator]"
            :error-messages="errorMessages.prepared_by"
            clearable
          />
        </VCol>
        <VCol cols="12" md="4">
          <VSelect
            v-model="form.driver_id"
            :items="usersToProject"
            :item-title="userTitle"
            item-value="id"
            label="Assigned to User"
            :loading="usersToLoading"
            :disabled="!form.transferred_to_project_id || usersToLoading || usersToProject.length === 0"
            :error-messages="errorMessages.driver_id"
            clearable
          />
        </VCol>

        <VCol cols="12" md="4">
          <VTextField
            v-model="form.contact_details"
            label="Contact Details"
            :error-messages="errorMessages.contact_details"
            clearable
          />
        </VCol>

          <VCol cols="12">
          <h4 class="mb-2">Items</h4>
        </VCol> 

        <VCol cols="12">
          <div class="d-flex justify-between align-center">
            <VBtn size="small" @click="addItem">Add Item</VBtn>
          </div>
          <div v-if="form.items.length === 0" class="text-medium-emphasis mt-2">
            No items yet. Click “Add Item”.
          </div>
        </VCol>

              <VCol cols="12" v-for="(it, idx) in form.items" :key="idx">
              <VRow>
                  <VCol cols="3">
                      <VSelect
                      v-model="it.asset_id"
                      :items="assets"
                      item-title="label"
                      item-value="id"
                      label="Asset"
                      :loading="assetsLoading"
                      :disabled="assetsLoading || assets.length === 0"
                      :rules="[requiredNumberValidator]"
                      clearable
                      @update:modelValue="val => onAssetChange(idx, val)"
                      />
                  </VCol>
                
                <VCol cols="2">    
                <VTextField
                      v-model.number="it.qty"
                      type="number"
                      min="1"
                      :max="it.remaining_quantity"
                      label="Qty"
                      :rules="[
                        requiredNumberValidator,
                        v => (!it.remaining_quantity || v <= it.remaining_quantity) || `Cannot exceed remaining qty (${it.remaining_quantity})`
                      ]"
                    />


                  </VCol>
                    <VCol cols="6">
                         <VTextField v-model="it.remarks" label="Remarks" />
                    </VCol>
                  <VCol cols="1">
                       <VBtn color="error" variant="tonal" @click="removeItem(idx)">X</VBtn>
                  </VCol>
              </VRow>
              </VCol>

        <!-- Approvals -->
        <VCol cols="12">
          <h4 class="mb-2">Approvals</h4>
        </VCol>

        <VCol cols="12" md="4">
          <VSelect
            v-model="form.plant_manager_status"
            :items="[
              { title: 'Approve', value: 'true' },
              { title: 'Disapprove', value: 'false' }
            ]"
            label="Plant Manager Status"
            item-title="title"
            item-value="value"
            :rules="[requiredValidator]"
            :error-messages="errorMessages.plant_manager_status"
            clearable
          />
        </VCol>

        <VCol cols="12" md="4">
          <VTextField v-model="form.plant_manager_status_date" type="date" label="Plant Manager Status Date" />
        </VCol>
        <VCol cols="12">
          <VTextarea v-model="form.plant_manager_remarks" label="Plant Manager Remarks" :rows="2" />
        </VCol>

        <VCol cols="12" md="4">
          <VSelect
            v-model="form.project_incharge_status"
            :items="[
              { title: 'Approve', value: 'true' },
              { title: 'Disapprove', value: 'false' }
            ]"
            label="Project In-Charge Status"
            item-title="title"
            item-value="value"
            :rules="[requiredValidator]"
            :error-messages="errorMessages.project_incharge_status"
            clearable
          />
        </VCol>

        <VCol cols="12" md="4">
          <VTextField v-model="form.project_incharge_status_date" type="date" label="Project In-Charge Status Date" />
        </VCol>
        <VCol cols="12">
          <VTextarea v-model="form.project_incharge_remarks" label="Project In-Charge Remarks" :rows="2" />
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
            :disabled="!form.transferred_to_project_id || usersToLoading || usersToProject.length === 0"
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
            :disabled="!form.transferred_to_project_id || usersToLoading || usersToProject.length === 0"
            :rules="[requiredNumberValidator]"
            :error-messages="errorMessages.received_by"
            clearable
          />
        </VCol>

        <VCol cols="12" md="4">
          <VTextField v-model="form.received_date" type="date" label="Received Date" />
        </VCol>
        <VCol cols="12" md="4">
          <VTextField
            v-model="ui.received_time_hhmm"
            type="time"
            step="60"
            label="Received Time (HH:mm)"
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
            :disabled="!form.transferred_to_project_id || usersToLoading || usersToProject.length === 0"
            :rules="[requiredNumberValidator]"
            :error-messages="errorMessages.inspected_by"
            clearable
          />
        </VCol>
        <VCol cols="12" md="4">
          <VSwitch v-model="form.equipment_status" label="is Equipment OK?" inset />
        </VCol>

        <!-- Items -->
        

        <!-- ✅ asset_id input replaced with dropdown from /api/assets -->
        

        <!-- Submit -->
        <VCol cols="12" class="mt-2">
          <VBtn type="submit" color="primary" :loading="loading" :disabled="loading">
            Submit
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
import { useRouter } from 'vue-router'
import {
  VBtn, VCol, VForm, VRow,
  VSelect, VSwitch, VTextField, VTextarea
} from 'vuetify/components'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL // should end with /api

const router = useRouter()

// Projects
const projects = ref([])
const projectsLoading = ref(false)


const asset_transer_no = ref(null);
// Users (from & to projects)
const usersFromProject = ref([])
const usersToProject = ref([])
const usersFromLoading = ref(false)
const usersToLoading = ref(false)
const userTitle = u => (u?.user_code ? `${u.name} — ${u.user_code}` : u?.name ?? '')

const today = new Date().toISOString().split('T')[0]
const now = new Date()
const hh = String(now.getHours()).padStart(2, '0')
const mm = String(now.getMinutes()).padStart(2, '0')

const timeHHMM = `${hh}:${mm}`
const timeHHMMSS = `${hh}:${mm}:00`

// 🔹 Assets for items[].asset_id
const assets = ref([])            // [{ id, label }]
const assetsLoading = ref(false)

const form = ref({
  issue_no: '',
  revision_date: today,
  asset_transer_no: '',
  form_no: '',
  date: today,
  tag_no: '',
  transferred_from_project_id: null,
  transferred_to_project_id: null,
  transfer_date: today,
  transfer_time: timeHHMMSS,
  prepared_by: null,
  driver_id: null,
  contact_details: '',
  plant_manager_status: '',
  plant_manager_remarks: '',
  plant_manager_status_date: today,
  project_incharge_status: '',
  project_incharge_remarks: '',
  project_incharge_status_date: today,
  received_from: null,
  received_by: null,
  received_date: today,
  received_time: timeHHMMSS,
  inspected_by: null,
  equipment_status: false,
  items: [],
})

const ui = ref({
  transfer_time_hhmm: timeHHMM,
  received_time_hhmm: timeHHMM,
})

const refForm = ref()
const loading = ref(false)
const message = ref('')
const errorMessages = ref({})

const requiredValidator = v => (!!v || v === 0) || 'This field is required'
const requiredNumberValidator = v => (v !== null && v !== '' && !Number.isNaN(Number(v))) || 'A number is required'

const dateNotPastValidator = v => {
  if (!v) return true
  return v >= today || 'Date cannot be older than today'
}


// Time helpers
const ensureSeconds = hhmm => {
  if (!hhmm) return ''
  return /^\d{2}:\d{2}(:\d{2})?$/.test(hhmm)
    ? (hhmm.length === 5 ? `${hhmm}:00` : hhmm)
    : ''
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
    projects.value = list.map(p => ({ id: p.id, name: `${p.project_code} — ${p.name}`.trim() }))
  } catch (e) {
    console.error('Error fetching projects:', e)
  } finally {
    projectsLoading.value = false
  }
}

// 🔹 Fetch assets for dropdown
const fetchAssets = async (pid) => {
  try {
    assets.value = []

    form.value.items.forEach(i => {
      i.asset_id = null
      i.qty = 1
      i.maxQty = null
    })

    assetsLoading.value = true
    const accessToken = getCookie('accessToken')
    if (!accessToken) throw new Error('Access token is missing. Please log in.')
    const decodedToken = decodeURIComponent(accessToken)

   const res = await axios.get(`${apiBaseUrl}/assets`, {
      headers: {
        Authorization: `Bearer ${decodedToken}`,
        Accept: 'application/json',
      },
      params: {
        project_id: pid
      }
    })

    const list = Array.isArray(res.data) ? res.data
      : Array.isArray(res.data?.data) ? res.data.data
      : []

    // map to {id,label}
    assets.value = list.map(a => {
      const code = a.code;
      const title = a.title
      return { id: Number(a.id), label: `${code} — ${title}`.trim(),quantity: Number(a.quantity),remaining_quantity: Number(a.remaining_quantity) }
    })
  } catch (e) {
    console.error('Error fetching assets:', e)
  } finally {
    assetsLoading.value = false
  }
}


// called when asset select changes; idx is index in form.items, val is selected asset id
const onAssetChange = (idx, val) => {
  const item = form.value.items[idx]

  if (!item) return

  if (val === null || val === '' || typeof val === 'undefined') {
    item.maxQty = null
    item.qty = 1
    return
  }

  const selected = assets.value.find(a => a.id === Number(val))
  if (selected) {
    // use remaining_quantity instead of quantity

    item.maxQty = Number(selected.remaining_quantity ?? 0)

    // set qty based on remaining stock (or 1)
    item.qty = Math.max(1, Math.min(item.maxQty))
  } else {
    item.maxQty = null
  }
}

// Fetch users for a project (GET → POST fallback)
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

  fetchAssets(pid)
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

// auth helpers
const getCookie = name => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

const getAccessToken = () => {
  const raw = getCookie('accessToken')
  if (!raw) return null
  const decoded = decodeURIComponent(raw)
  return decoded.replace(/^"+|"+$/g, '')
}

const authHeaders = () => {
  const token = getAccessToken()
  if (!token) throw new Error('Access token is missing. Please log in.')
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  }
}

const fetchLatestId = async () => {
  try {

    const accessToken = getCookie('accessToken')
    if (!accessToken) throw new Error('Access token is missing. Please log in.')
    const decodedToken = decodeURIComponent(accessToken)


    const res = await axios.get(`${apiBaseUrl}/getLatestNumber`, {
      params: { type: 'AssetTransfer'},
      headers: authHeaders(),
    });


    const numberId = res.data.value;
    console.log(numberId);
    form.value.asset_transer_no = numberId;
  } catch (e) {
    console.error(e);
    form.value.asset_transer_no = '';
  } finally {

  }
};


onMounted(() => {
  fetchProjects(),
  fetchLatestId()
})

const convertBooleanFields = (payload) => {
  const boolFields = [
    'plant_manager_status',
    'project_incharge_status',
    'equipment_status'
  ]

  boolFields.forEach(f => {
    if (payload[f] === 'true') payload[f] = true
    if (payload[f] === 'false') payload[f] = false
  })

  return payload
}


const submitForm = async () => {
  try {
    loading.value = true
    errorMessages.value = {}
    message.value = ''

    // sync times
    syncTimeWithSeconds('transfer')
    syncTimeWithSeconds('received')

    // client validate
    const { valid } = (await (refForm.value?.validate?.() ?? Promise.resolve({ valid: true })))
    if (!valid) { loading.value = false; return }
    if (!form.value.items.length) { message.value = 'Please add at least one item.'; loading.value = false; return }

    let payload = { ...form.value }

    payload = convertBooleanFields(payload)

    const res = await axios.post(`${apiBaseUrl}/asset-transfers`, payload, {
      headers: {
        ...authHeaders(),
        Accept: 'application/json',
      },
    })

    message.value = res.data?.message || 'Asset transfer created successfully!'
    router.push('/dashboards/assettransfers')
  } catch (error) {
    console.error('Error submitting asset transfer:', error)
    if (error.response?.data?.errors) {
      errorMessages.value = error.response.data.errors
      message.value = 'Please fix the highlighted errors.'
    } else {
      message.value = error.response?.data?.message || 'Failed to create asset transfer.'
    }
  } finally {
    loading.value = false
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
