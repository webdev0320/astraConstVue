<template>
  <div class="d-flex justify-between align-center mb-4">
    <h3>Edit Vehicle Handover</h3>
    <VBtn variant="text" @click="$router.push('/dashboards/vehiclehandovers')">Back to list</VBtn>
  </div>

  <VForm ref="refForm" @submit.prevent="submitForm">
    <VRow>
      <!-- Investment Request -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="form.investment_req_id"
          :items="investmentOptions"
          item-title="label"
          item-value="id"
          label="Investment Request"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.investment_req_id"
          :loading="loadingInvestments"
          clearable
          @update:model-value="onInvestmentChange"
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
          clearable
        />
      </VCol>

      <!-- Plate No -->
      <VCol cols="12" md="4">
        <VTextField
          v-model="form.plate_no"
          label="Plate No"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.plate_no"
          clearable
        />
      </VCol>

      <!-- Vehicle Type -->
      <VCol cols="12" md="4">
        <VTextField
          v-model="form.vehicle_type"
          label="Vehicle Type"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.vehicle_type"
          clearable
        />
      </VCol>

      <!-- Model No / Year -->
      <VCol cols="12" md="4">
        <VTextField
          v-model="form.model_no"
          label="Model No / Year"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.model_no"
          clearable
        />
      </VCol>

      <!-- KM Reading -->
      <VCol cols="12" md="4">
        <VTextField
          v-model.number="form.km_reading"
          type="number"
          min="0"
          label="KM Reading"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.km_reading"
          clearable
        />
      </VCol>

      <!-- Driver -->
      <VCol cols="12" md="8">
        <VSelect
          v-model="form.driver_id"
          :items="driverOptions"
          item-title="name"
          item-value="id"
          label="Driver"
          :loading="loadingProjectUsers"
          :error-messages="errorMessages.driver_id"
          clearable
        />
      </VCol>

      <!-- Releasing Employee -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="form.releasing_emp_id"
          :items="projectUsers"
          item-title="name"
          item-value="id"
          label="Releasing Employee"
          :loading="loadingProjectUsers"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.releasing_emp_id"
          clearable
        />
      </VCol>

      <!-- Receiving Employee -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="form.receiving_emp_id"
          :items="projectUsers"
          item-title="name"
          item-value="id"
          label="Receiving Employee"
          :loading="loadingProjectUsers"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.receiving_emp_id"
          clearable
        />
      </VCol>

      <!-- Handover Location -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="form.handover_location_id"
          :items="locationOptions"
          item-title="name"
          item-value="id"
          label="Handover Location"
          :loading="loadingLocations"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.handover_location_id"
          clearable
        />
      </VCol>

      <!-- Receiving Location -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="form.receiving_location_id"
          :items="locationOptions"
          item-title="name"
          item-value="id"
          label="Receiving Location"
          :loading="loadingLocations"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.receiving_location_id"
          clearable
        />
      </VCol>

      <!-- Handover Datetime -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="form.handover_datetime"
          type="datetime-local"
          label="Handover Datetime"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.handover_datetime"
          clearable
        />
      </VCol>

      <!-- Receiving Datetime -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="form.receiving_datetime"
          type="datetime-local"
          label="Receiving Datetime"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.receiving_datetime"
          clearable
        />
      </VCol>

      <!-- Notes -->
      <VCol cols="12">
        <VTextarea
          v-model="form.notes"
          label="Notes"
          :rows="3"
          :error-messages="errorMessages.notes"
        />
      </VCol>

      <!-- Checks -->
      <VCol cols="12">
        <div class="mb-2 font-weight-500">Checks</div>
        <VRow>
          <VCol cols="12" sm="6" md="3" v-for="c in checkList" :key="c.key">
            <VCheckbox
              v-model="form.checks[c.key]"
              :label="c.label"
              hide-details
            />
          </VCol>
        </VRow>
        <div class="text-caption mt-1">Tip: API key <code>spare_time</code> ko as-is use kiya gaya hai.</div>
      </VCol>

      <VCol cols="12" class="mt-2">
        <VBtn type="submit" color="primary" :loading="saving" :disabled="saving">
          Update
        </VBtn>
      </VCol>
    </VRow>

    <div v-if="message" class="mt-4">{{ message }}</div>
  </VForm>
</template>

<script setup>
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  VBtn, VCheckbox, VCol, VForm, VRow,
  VSelect, VTextField, VTextarea,
} from 'vuetify/components'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL // should end with /api


const route = useRoute()
const router = useRouter()
const handoverId = route.params.id

// ---- state ----
const refForm = ref()
const loadingInvestments = ref(false)
const loadingLocations = ref(false)
const loadingProjectUsers = ref(false)
const saving = ref(false)
const message = ref('')
const errorMessages = ref({})

// dropdown data
const investmentOptions = ref([])
const projectUsers = ref([])
const locationOptions = ref([])

// form model
const form = ref({
  investment_req_id: null,
  report_date: '',
  plate_no: '',
  driver_id: null,
  km_reading: null,
  vehicle_type: '',
  model_no: '',
  releasing_emp_id: null,
  handover_location_id: null,
  handover_datetime: '',   // datetime-local format
  receiving_emp_id: null,
  receiving_location_id: null,
  receiving_datetime: '',
  notes: '',
  checks: {
    tires: false,
    battery: false,
    scratches: false,
    mirrors: false,
    registration_card: false,
    insurance_card: false,
    spare_time: false,
    jack: false,
    tool_kit: false,
  },
})

const checkList = [
  { key: 'tires', label: 'Tires' },
  { key: 'battery', label: 'Battery' },
  { key: 'scratches', label: 'Scratches' },
  { key: 'mirrors', label: 'Mirrors' },
  { key: 'registration_card', label: 'Registration Card' },
  { key: 'insurance_card', label: 'Insurance Card' },
  { key: 'spare_time', label: 'Spare Tire (spare_time)' },
  { key: 'jack', label: 'Jack' },
  { key: 'tool_kit', label: 'Tool Kit' },
]

// Prefer "Drivers" role for driver dropdown, else show all
const driverOptions = computed(() => {
  const drivers = projectUsers.value.filter(u =>
    (u.role || '').toLowerCase().includes('driver'),
  )
  return drivers.length ? drivers : projectUsers.value
})

// ---- utils ----
const requiredValidator = v => (!!v || v === 0) || 'This field is required'

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
  return { Authorization: `Bearer ${token}`, Accept: 'application/json' }
}

// datetime helpers
const toSqlDatetime = (v) => {
  if (!v) return v
  const pad = (n) => String(n).padStart(2, '0')
  const d = new Date(v)
  if (isNaN(d.getTime())) {
    return v.includes('T') ? v.replace('T', ' ') + ':00' : v
  }
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const mi = pad(d.getMinutes())
  const ss = '00'
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`
}
const toInputLocal = (sqlOrIso) => {
  // convert "YYYY-MM-DD HH:mm:ss" or ISO → "YYYY-MM-DDTHH:mm"
  if (!sqlOrIso) return ''
  try {
    let s = String(sqlOrIso)
    if (!s.includes('T')) s = s.replace(' ', 'T')
    const d = new Date(s)
    if (isNaN(d.getTime())) return ''
    const pad = n => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch {
    return ''
  }
}

// ---- data loaders ----
const loadInvestments = async () => {
  loadingInvestments.value = true
  try {
    const res = await axios.get(`${apiBaseUrl}/asset-investment-requests`, { headers: authHeaders() })
    const list = res.data?.data ?? []
    investmentOptions.value = list.map(r => ({
      id: r.id,
      label: `#${r.id} — ${r.project_name} — ${r.date} — ${r.status}`,
      project_id: r.project_id,
    }))
  } catch (e) {
    console.error('Load investments failed', e)
    message.value = e.response?.data?.message || 'Failed to load investment requests.'
  } finally {
    loadingInvestments.value = false
  }
}

const loadLocations = async () => {
  loadingLocations.value = true
  try {
    const res = await axios.get(`${apiBaseUrl}/locations`, { headers: authHeaders() })
    locationOptions.value = Array.isArray(res.data) ? res.data : []
  } catch (e) {
    console.error('Load locations failed', e)
    message.value = e.response?.data?.message || 'Failed to load locations.'
  } finally {
    loadingLocations.value = false
  }
}

const loadProjectUsersByProjectId = async (projectId) => {
  if (!projectId) return
  loadingProjectUsers.value = true
  try {
    const res = await axios.get(`${apiBaseUrl}/projects/${projectId}/users/sync`, { headers: authHeaders() })
    projectUsers.value = res.data?.users ?? []
  } catch (e) {
    console.error('Load project users failed', e)
    message.value = e.response?.data?.message || 'Failed to load project users.'
  } finally {
    loadingProjectUsers.value = false
  }
}

// On changing investment manually from UI
const onInvestmentChange = async (investmentId) => {
  projectUsers.value = []
  if (!investmentId) return
  const inv = investmentOptions.value.find(i => i.id === investmentId)
  if (inv?.project_id) {
    await loadProjectUsersByProjectId(inv.project_id)
  }
}

// Load existing handover
const fetchHandover = async () => {
  try {
    const res = await axios.get(`${apiBaseUrl}/vehicle-handovers/${handoverId}`, { headers: authHeaders() })
    // API might return {data:{...}} or {...}
    const h = res.data?.data ?? res.data

    // Pre-fill form
    form.value.investment_req_id    = h.investment_req_id ?? null
    form.value.report_date          = h.report_date ?? ''
    form.value.plate_no             = h.plate_no ?? ''
    form.value.vehicle_type         = h.vehicle_type ?? ''
    form.value.model_no             = h.model_no ?? ''
    form.value.km_reading           = h.km_reading ?? null
    form.value.releasing_emp_id     = h.releasing_emp_id ?? null
    form.value.receiving_emp_id     = h.receiving_emp_id ?? null
    form.value.driver_id            = h.driver_id ?? null
    form.value.handover_location_id = h.handover_location_id ?? null
    form.value.receiving_location_id= h.receiving_location_id ?? null
    form.value.handover_datetime    = toInputLocal(h.handover_datetime)
    form.value.receiving_datetime   = toInputLocal(h.receiving_datetime)
    form.value.notes                = h.notes ?? ''

    // Checks object if available
    if (h.checks && typeof h.checks === 'object') {
      form.value.checks = {
        tires: !!h.checks.tires,
        battery: !!h.checks.battery,
        scratches: !!h.checks.scratches,
        mirrors: !!h.checks.mirrors,
        registration_card: !!h.checks.registration_card,
        insurance_card: !!h.checks.insurance_card,
        spare_time: !!h.checks.spare_time,
        jack: !!h.checks.jack,
        tool_kit: !!h.checks.tool_kit,
      }
    }

    // Load project users for selected investment (needs investmentOptions to be ready)
    const inv = investmentOptions.value.find(i => i.id === form.value.investment_req_id)
    if (inv?.project_id) {
      await loadProjectUsersByProjectId(inv.project_id)
    }
  } catch (e) {
    console.error('Error fetching handover:', e)
    message.value = e.response?.data?.message || 'Failed to load vehicle handover.'
  }
}

// Submit update
const submitForm = async () => {
  try {
    saving.value = true
    errorMessages.value = {}
    message.value = ''

    const { valid } = await (refForm.value?.validate?.() ?? { valid: true })
    if (!valid) { saving.value = false; return }

    // Build payload
    const payload = {
      investment_req_id: form.value.investment_req_id,
      report_date: form.value.report_date,
      plate_no: form.value.plate_no,
      driver_id: form.value.driver_id,
      km_reading: form.value.km_reading,
      vehicle_type: form.value.vehicle_type,
      model_no: form.value.model_no,
      releasing_emp_id: form.value.releasing_emp_id,
      handover_location_id: form.value.handover_location_id,
      handover_datetime: toSqlDatetime(form.value.handover_datetime),
      receiving_emp_id: form.value.receiving_emp_id,
      receiving_location_id: form.value.receiving_location_id,
      receiving_datetime: toSqlDatetime(form.value.receiving_datetime),
      notes: form.value.notes,
      checks: form.value.checks,
    }

    await axios.put(`${apiBaseUrl}/vehicle-handovers/${handoverId}`, payload, {
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    })

    message.value = 'Vehicle handover updated successfully!'
    router.push('/dashboards/vehiclehandovers')
  } catch (error) {
    console.error('Error updating vehicle handover:', error)
    if (error.response?.status === 422 && error.response?.data?.errors) {
      errorMessages.value = error.response.data.errors
      message.value = 'Please fix the highlighted errors.'
    } else if (error.response?.status === 401) {
      message.value = 'Unauthorized. Please log in again.'
    } else {
      message.value = error.response?.data?.message || 'Failed to update vehicle handover.'
    }
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    if (!getAccessToken()) throw new Error('Access token is missing. Please log in.')
    // Load static dropdowns first, then handover (so project users can load correctly)
    await Promise.all([loadInvestments(), loadLocations()])
    await fetchHandover()
  } catch (e) {
    console.error(e)
    message.value = e.message
  }
})
</script>

<style>
.mb-4 { margin-block-end: 16px; }
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.font-weight-500 { font-weight: 600; }
.text-caption { font-size: 12px; opacity: 0.8; }
</style>
