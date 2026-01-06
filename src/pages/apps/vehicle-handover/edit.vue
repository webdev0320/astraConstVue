<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <h3>Edit Vehicle Handover</h3>
    </div>

    <VForm ref="refForm" @submit.prevent="submitForm">
      <VRow>

        <VCol cols="12" md="4">
          <VTextField
            v-model="form.vehicle_handover_id"
            label="Vehicle Handover Request #"
            disabled
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
            clearable
          />
        </VCol>

        <VCol cols="12" md="4">
          <VSelect
            v-model="form.investment_req_id"
            :items="investmentOptions"
            item-title="label"
            item-value="id"
            label="Investment Request"
            :loading="loadingInvestments"
            clearable
          />
        </VCol>

        <VCol cols="12" md="4">
          <VSelect
            v-model="form.asset_id"
            :items="assetOptions"
            item-title="label"
            item-value="id"
            label="Asset"
            clearable
          />
        </VCol>

        <VCol cols="12" md="4">
          <VTextField v-model="form.report_date" type="date" label="Report Date" />
        </VCol>

        <VCol cols="12" md="4">
          <VTextField v-model="form.plate_no" label="Plate No" />
        </VCol>

        <VCol cols="12" md="4">
          <VTextField v-model="form.vehicle_type" label="Vehicle Type" />
        </VCol>

        <VCol cols="12" md="4">
          <VTextField v-model="form.model_no" label="Model No / Year" />
        </VCol>

        <VCol cols="12" md="4">
          <VTextField v-model.number="form.km_reading" type="number" label="KM Reading" />
        </VCol>

        <VCol cols="12" md="4">
          <VSelect
            v-model="form.driver_id"
            :items="driverOptions"
            item-title="name"
            item-value="id"
            label="Driver"
            clearable
          />
        </VCol>

        <VCol cols="12" md="6">
          <VSelect
            v-model="form.releasing_emp_id"
            :items="projectUsers"
            item-title="name"
            item-value="id"
            label="Releasing Employee"
            clearable
          />
        </VCol>

        <VCol cols="12" md="6">
          <VSelect
            v-model="form.receiving_emp_id"
            :items="projectUsers"
            item-title="name"
            item-value="id"
            label="Receiving Employee"
            clearable
          />
        </VCol>

        <VCol cols="12" md="6">
          <VSelect
            v-model="form.handover_location_id"
            :items="locationOptions"
            item-title="label"
            item-value="id"
            label="Handover Location"
            clearable
          />
        </VCol>

        <VCol cols="12" md="6">
          <VSelect
            v-model="form.receiving_location_id"
            :items="locationOptions"
            item-title="label"
            item-value="id"
            label="Receiving Location"
            clearable
          />
        </VCol>

        <VCol cols="12" md="6">
          <VTextField
            v-model="form.handover_datetime"
            type="datetime-local"
            label="Handover Datetime"
          />
        </VCol>

        <VCol cols="12" md="6">
          <VTextField
            v-model="form.receiving_datetime"
            type="datetime-local"
            label="Receiving Datetime"
          />
        </VCol>

        <VCol cols="12">
          <VTextarea v-model="form.notes" label="Notes" />
        </VCol>

        <VCol cols="12" class="mt-2">
          <VBtn type="submit" color="primary" :loading="loading">Update</VBtn>
        </VCol>

      </VRow>
    </VForm>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

const loading = ref(false)

/* ------------------ FORM ------------------ */
const form = ref({
  vehicle_handover_id: '',
  project_id: null,
  investment_req_id: null,
  asset_id: null,
  report_date: '',
  plate_no: '',
  km_reading: null,
  vehicle_type: '',
  model_no: '',
  driver_id: null,
  releasing_emp_id: null,
  receiving_emp_id: null,
  handover_location_id: null,
  receiving_location_id: null,
  handover_datetime: '',
  receiving_datetime: '',
  notes: ''
})

/* ------------------ DROPDOWNS ------------------ */
const projects = ref([])
const investmentOptions = ref([])
const assetOptions = ref([])
const locationOptions = ref([])
const projectUsers = ref([])
const driverOptions = ref([])

/* ------------------ LOADING FLAGS ------------------ */
const loadingProjects = ref(false)
const loadingInvestments = ref(false)

/* ------------------ AUTH ------------------ */
const authHeaders = () => ({
  Authorization: `Bearer ${decodeURIComponent(
    document.cookie.replace(/(?:(?:^|.*;\s*)accessToken\s*\=\s*([^;]*).*$)|^.*$/, '$1')
  )}`,
  Accept: 'application/json'
})

/* ------------------ API ------------------ */
const fetchProjects = async () => {
  loadingProjects.value = true
  const res = await axios.get(`${apiBaseUrl}/projects`, { headers: authHeaders() })
  projects.value = res.data.data.map(p => ({
    id: Number(p.id),
    label: p.project_name
  }))
  loadingProjects.value = false
}

const fetchLocations = async () => {
  const res = await axios.get(`${apiBaseUrl}/locations`, { headers: authHeaders() })
  locationOptions.value = res.data.data.map(l => ({
    id: Number(l.id),
    label: l.name
  }))
}

const loadAssets = async (projectId) => {
  const res = await axios.get(`${apiBaseUrl}/assets`, {
    params: { project_id: projectId },
    headers: authHeaders()
  })
  assetOptions.value = res.data.data.map(a => ({
    id: Number(a.id),
    label: `${a.code} - ${a.title}`
  }))
}

const fetchInvestmentRequests = async (projectId) => {
  loadingInvestments.value = true
  const res = await axios.get(`${apiBaseUrl}/asset-investment-requests`, {
    params: { project_id: projectId },
    headers: authHeaders()
  })
  investmentOptions.value = res.data.data.map(r => ({
    id: Number(r.id),
    label: `#${r.air_number}`
  }))
  loadingInvestments.value = false
}

const loadProjectUsers = async (projectId) => {
  const res = await axios.get(
    `${apiBaseUrl}/projects/${projectId}/users/sync`,
    { headers: authHeaders() }
  )
  projectUsers.value = res.data.users
  driverOptions.value = projectUsers.value.filter(u =>
    (u.role || '').toLowerCase().includes('driver')
  )
}

/* ------------------ EDIT FLOW ------------------ */
const loadEditForm = async () => {
  const res = await axios.get(
    `${apiBaseUrl}/vehicle-handovers/${route.params.id}`,
    { headers: authHeaders() }
  )

  const d = res.data.data

  form.value.vehicle_handover_id = d.vehicle_handover_id
  form.value.report_date = d.report_date
  form.value.plate_no = d.plate_no
  form.value.km_reading = d.km_reading
  form.value.vehicle_type = d.vehicle_type
  form.value.model_no = d.model_no
  form.value.notes = d.notes

  form.value.handover_datetime = d.handover_datetime?.replace(' ', 'T') || ''
  form.value.receiving_datetime = d.receiving_datetime?.replace(' ', 'T') || ''

  /* ---- CRITICAL ORDER ---- */
  form.value.project_id = Number(d.project_id)

  await Promise.all([
    loadAssets(d.project_id),
    fetchInvestmentRequests(d.project_id),
    loadProjectUsers(d.project_id)
  ])

  form.value.asset_id = Number(d.asset_id)
  form.value.investment_req_id = Number(d.investment_req_id)
  form.value.driver_id = Number(d.driver_id)
  form.value.releasing_emp_id = Number(d.releasing_emp_id)
  form.value.receiving_emp_id = Number(d.receiving_emp_id)
  form.value.handover_location_id = Number(d.handover_location_id)
  form.value.receiving_location_id = Number(d.receiving_location_id)
}

/* ------------------ SUBMIT ------------------ */
const submitForm = async () => {
  loading.value = true
  await axios.post(
    `${apiBaseUrl}/vehicle-handovers/${route.params.id}`,
    form.value,
    { headers: authHeaders() }
  )
  router.push('/dashboards/vehiclehandovers')
  loading.value = false
}

/* ------------------ MOUNTED ------------------ */
onMounted(async () => {
  await Promise.all([fetchProjects(), fetchLocations()])
  await loadEditForm()
})
</script>
