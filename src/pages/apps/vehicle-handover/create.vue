<template>
  <div class="d-flex justify-between align-center mb-4">
    <h3>Create Vehicle Handover</h3>
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
      </VCol>

      <!-- Images (multiple) -->
      <VCol cols="12">
        <VFileInput
          v-model="form.images"
          label="Upload Images"
          multiple
          accept="image/*"
          chips
          counter
          show-size
          prepend-icon="mdi-camera"
          :error-messages="errorMessages.images"
        />
      </VCol>

      <VCol cols="12" class="mt-2">
        <VBtn type="submit" color="primary" :loading="loading" :disabled="loading">
          Submit
        </VBtn>
      </VCol>
    </VRow>

    <div v-if="message" class="mt-4">{{ message }}</div>
  </VForm>
</template>

<script setup>
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  VBtn, VCheckbox, VCol,
  VFileInput,
  VForm, VRow,
  VSelect, VTextField, VTextarea,
} from 'vuetify/components'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL // should end with /api

const router = useRouter()

// ---- state ----
const refForm = ref()
const loading = ref(false)
const message = ref('')
const errorMessages = ref({})

// dropdown data
const investmentOptions = ref([])
const loadingInvestments = ref(false)

const projectUsers = ref([])
const loadingProjectUsers = ref(false)

const locationOptions = ref([])
const loadingLocations = ref(false)

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
  handover_datetime: '',
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
  images: [], // <— files go here
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
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  }
}

// ---- data loaders ----
const loadInvestments = async () => {
  loadingInvestments.value = true
  try {
    const res = await axios.get(`${apiBaseUrl}/asset-investment-requests`, {
      headers: authHeaders(),
    })
    const list = res.data?.data ?? []
    investmentOptions.value = list.map(r => ({
      id: r.id,
      label: `#${r.id} — ${r.project_name} — ${r.date} — ${r.status}`,
      project_id: r.project_id,
    }))
  } catch (e) {
    console.error('Load investments failed', e)
    message.value = e.response?.data?.message || 'Failed to load investment requests (401).'
  } finally {
    loadingInvestments.value = false
  }
}

const loadLocations = async () => {
  loadingLocations.value = true
  try {
    const res = await axios.get(`${apiBaseUrl}/locations`, {
      headers: authHeaders(),
    })
    locationOptions.value = Array.isArray(res.data) ? res.data : []
  } catch (e) {
    console.error('Load locations failed', e)
    message.value = e.response?.data?.message || 'Failed to load locations (401).'
  } finally {
    loadingLocations.value = false
  }
}

const onInvestmentChange = async (investmentId) => {
  projectUsers.value = []
  if (!investmentId) return
  const inv = investmentOptions.value.find(i => i.id === investmentId)
  if (!inv?.project_id) return

  loadingProjectUsers.value = true
  try {
    const res = await axios.get(`${apiBaseUrl}/projects/${inv.project_id}/users/sync`, {
      headers: authHeaders(),
    })
    projectUsers.value = res.data?.users ?? []
  } catch (e) {
    console.error('Load project users failed', e)
    message.value = e.response?.data?.message || 'Failed to load project users (401).'
  } finally {
    loadingProjectUsers.value = false
  }
}

// ---- submit ----
const submitForm = async () => {
  try {
    loading.value = true
    errorMessages.value = {}

    const { valid } = await (refForm.value?.validate?.() ?? { valid: true })
    if (!valid) { loading.value = false; return }

    const token = getAccessToken()
    if (!token) throw new Error('Access token is missing. Please log in.')

    // Convert datetime-local to "YYYY-MM-DD HH:mm:ss"
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

    // Build multipart form data (supports files)
    const fd = new FormData()
    const appendIf = (k, v) => {
      if (v !== null && v !== undefined && v !== '') fd.append(k, v)
    }

    appendIf('investment_req_id', form.value.investment_req_id)
    appendIf('report_date', form.value.report_date)
    appendIf('plate_no', form.value.plate_no)
    appendIf('driver_id', form.value.driver_id)
    appendIf('km_reading', form.value.km_reading)
    appendIf('vehicle_type', form.value.vehicle_type)
    appendIf('model_no', form.value.model_no)
    appendIf('releasing_emp_id', form.value.releasing_emp_id)
    appendIf('handover_location_id', form.value.handover_location_id)
    appendIf('handover_datetime', toSqlDatetime(form.value.handover_datetime))
    appendIf('receiving_emp_id', form.value.receiving_emp_id)
    appendIf('receiving_location_id', form.value.receiving_location_id)
    appendIf('receiving_datetime', toSqlDatetime(form.value.receiving_datetime))
    appendIf('notes', form.value.notes)

    // Send checks as nested fields: checks[tires]=1, etc.
    Object.entries(form.value.checks || {}).forEach(([key, val]) => {
      fd.append(`checks[${key}]`, val ? 1 : 0)
    })

    // Append multiple images as images[]
    ;(form.value.images || []).forEach(file => {
      // Some browsers may pass strings; only append actual File/Blob
      if (file instanceof File || (file && typeof file === 'object' && 'size' in file)) {
        fd.append('images[]', file)
      }
    })

    const res = await axios.post(`${apiBaseUrl}/vehicle-handovers`, fd, {
      headers: {
        ...authHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    })

    message.value = res.data?.message || 'Vehicle handover created successfully!'
    router.push('/dashboards/vehiclehandovers')
  } catch (error) {
    console.error('Error submitting form:', error)
    if (error.response?.status === 401) {
      message.value = 'Unauthorized. Please log in again.'
    } else if (error.response?.data?.errors) {
      errorMessages.value = error.response.data.errors
      message.value = 'Please fix the highlighted errors.'
    } else {
      message.value = error.response?.data?.message || 'Failed to create vehicle handover.'
    }
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    if (!getAccessToken()) throw new Error('Access token is missing. Please log in.')
    await Promise.all([loadInvestments(), loadLocations()])
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
