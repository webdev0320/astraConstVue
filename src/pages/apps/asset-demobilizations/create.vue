<template>
  <div class="d-flex justify-between align-center mb-4">
    <h3>Create Asset Demobilization</h3>
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
          @update:model-value="onProjectChange"
        />
      </VCol>

       <!-- Handover -->
      <!-- Handover Request -->
      <!--  <VCol cols="12" md="6">
              <VSelect
                v-model="form.handover_id"
                :items="handovers"
                item-title="title"
                item-value="value"
                label="Select Handover"
                :loading="loadingHandovers"
                :disabled="!form.project_id"
                clearable
              />
        </VCol> -->


      <!-- Asset -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="form.asset_id"
          :items="assetOptions"
          item-title="title"
          item-value="value"
          label="Asset"
          :loading="loadingAssets"
          clearable
          :disabled="!form.project_id"
          @update:model-value="onAssetChange"
        />
      </VCol>

      <!-- Custodian -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="selectedCustodianName"
          label="Custodian"
          disabled
        />
      </VCol>

       <!-- Date -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="form.date"
          type="date"
          label="Date"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.date"
          :max="today"
        />
      </VCol>


     


      <!-- Total Quantity Demobilized -->
    

      <!-- Remaining Quantity -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="form.project_quantity"
          type="number"
          label="Assigned Quantity"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.project_quantity"
          disabled
        />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField
          v-model="form.total_quantity_demobilized"
          type="number"
          label="Total Quantity Demobilized"
          :rules="[quantityValidator]"
          :error-messages="errorMessages.total_quantity_demobilized"
        />
      </VCol>

     
      <!-- Description -->
      <VCol cols="12">
        <VTextarea
          v-model="form.description"
          label="Description"
          rows="3"
          :error-messages="errorMessages.description"
          auto-grow
        />
      </VCol>

      <!-- Submit Buttons -->
      <VCol cols="12">
        <VBtn type="submit" color="primary" :loading="loading" :disabled="loading">
          Submit
        </VBtn>
        <VBtn class="ms-2" variant="text" @click="router.push('/dashboards/asset-demobilizations')">
          Cancel
        </VBtn>
      </VCol>
    </VRow>

    <div v-if="message" class="mt-4">{{ message }}</div>
  </VForm>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { VForm, VRow, VCol, VTextField, VSelect, VTextarea, VBtn } from 'vuetify/components'

const router = useRouter()
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const apiCreateUrl = `${apiBaseUrl}/asset-demobilizations`
const apiProjectsUrl = `${apiBaseUrl}/projects`
const apiAssetsUrl = `${apiBaseUrl}/assets`
const apiHandoversUrl = `${apiBaseUrl}/asset-handovers`

/* ------------------------------
   Auth Helper
------------------------------ */
const getCookie = name => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] : null
}
const getToken = () => {
  const token = getCookie('accessToken') || localStorage.getItem('accessToken')
  return token ? decodeURIComponent(token) : null
}
const getAuthHeaders = () => {
  const token = getToken()
  if (!token) throw new Error('Access token is missing.')
  return { Authorization: `Bearer ${token}`, Accept: 'application/json' }
}

const today = new Date().toISOString().substr(0, 10)

/* ------------------------------
   Form Data
------------------------------ */
const refForm = ref()
const form = ref({
  project_id: null,
  asset_id: null,
  custodian_id: null,
  handover_id: null,
  total_quantity_demobilized: null,
  project_quantity: null,
  date: new Date().toISOString().substr(0, 10), // YYYY-MM-DD format,
  description: '',
})

const handovers = ref([])
const loadingHandovers = ref(false)

const loading = ref(false)
const message = ref('')
const errorMessages = ref({})

/* ------------------------------
   Dropdown Data
------------------------------ */
const projects = ref([])
const assets = ref([])

const loadingProjects = ref(false)
const loadingAssets = ref(false)

const projectOptions = computed(() =>
  projects.value.map(p => ({ value: p.id, title: p.name ?? `Project #${p.id}` }))
)

/* ------------------------------
   Fetch Handovers
------------------------------ */
const fetchHandoversByProject = async (projectId) => {
  handovers.value = []
  form.value.handover_id = null

  if (!projectId) return

  loadingHandovers.value = true
  try {
    const res = await axios.get(apiHandoversUrl, {
      headers: getAuthHeaders(),
      params: { project_id: projectId },
    })

    console.log('Handovers API:', res.data) // 👈 Add this

    // If your API returns { data: [...] }
    const list = Array.isArray(res.data?.data)
      ? res.data.data
      : Array.isArray(res.data)
      ? res.data
      : []

    handovers.value = list.map(h => ({
      value: h.id,
      title: h.handover_id || `Handover #${h.id}`,
    }))

    console.log('Mapped handovers:', handovers.value)
  } catch (err) {
    console.error('Error fetching handovers:', err)
    handovers.value = []
  } finally {
    loadingHandovers.value = false
  }
}


const handoverOptions = computed(() =>
  handovers.value.map(h => ({
    value: h.id,
    title: h.title,
  }))
)


const quantityValidator = v => {
  if (v === null || v === undefined || v === '') return 'This field is required';
  if (form.value.project_quantity !== null && v > form.value.project_quantity) {
    return 'Total Quantity Demobilized cannot be greater than Project Quantity';
  }
  return true;
}


/* ------------------------------
   Auto-fill Fields
------------------------------ */
const selectedCustodianName = ref('')

const onAssetChange = assetId => {
  if (!assetId) {
    form.value.custodian_id = null
    form.value.project_quantity = null
    selectedCustodianName.value = ''
    return
  }

  const selectedAsset = assets.value.find(a => a.id === assetId)
  console.log(JSON.stringify(selectedAsset?.last_custodian));
  if (selectedAsset?.last_custodian?.user) {
    form.value.custodian_id = selectedAsset.last_custodian.user.id
   
    selectedCustodianName.value = selectedAsset.last_custodian.user.name || ''
  } else {
    form.value.custodian_id = null
    selectedCustodianName.value = ''
  }

  form.value.total_quantity_demobilized = selectedAsset?.occupied_quantity ?? null
  form.value.project_quantity = selectedAsset?.occupied_quantity ?? null
}


const assetOptions = computed(() =>
  assets.value.map(a => ({
    value: a.id,
    title: a.code ? `${a.code} — ${a.title ?? 'Untitled'}` : a.title ?? `Asset #${a.id}`,
    last_custodian: a.last_custodian ?? null,
    occupied_quantity: a.occupied_quantity ?? null,
    remaining_quantity: a.remaining_quantity ?? null,
  }))
)

/* ------------------------------
   Fetching Logic
------------------------------ */
const fetchProjects = async () => {
  loadingProjects.value = true
  try {
    const res = await axios.get(apiProjectsUrl, { headers: getAuthHeaders() })
    projects.value = Array.isArray(res.data?.data) ? res.data.data : res.data
  } finally {
    loadingProjects.value = false
  }
}

const fetchAssetsByProject = async projectId => {
  form.value.asset_id = null
  assets.value = []
  if (!projectId) return

  loadingAssets.value = true
  try {
    const res = await axios.get(apiAssetsUrl, {
      headers: getAuthHeaders(),
      params: { project_id: projectId },
    })
    const list = Array.isArray(res.data?.data) ? res.data.data : res.data
     assets.value = list.map(a => ({
      id: a.id,
      code: a.code,
      title: a.title,
      last_custodian: a.last_custodian??null,
      occupied_quantity: a.occupied_quantity ?? null,
      remaining_quantity: a.remaining_quantity ?? null,
    }))
  } catch (err) {
    console.error('Error fetching assets:', err)
  } finally {
    loadingAssets.value = false
  }
}

/* ------------------------------
   On Project Change
------------------------------ */
const onProjectChange = async projectId => {
  await Promise.all([fetchAssetsByProject(projectId)])
}

//fetchHandoversByProject(projectId)

/* ------------------------------
   Submit Form
------------------------------ */
const submitForm = async () => {
  const { valid } = await refForm.value.validate()
  if (!valid) return

  loading.value = true
  try {
    const res = await axios.post(apiCreateUrl, form.value, { headers: getAuthHeaders() })
    message.value = res.data?.message || 'Asset Demobilization created successfully.'
    router.push('/dashboards/asset-demobilizations')
  } catch (err) {
    errorMessages.value = err.response?.data?.errors || {}
    message.value = err.response?.data?.message || 'Failed to create demobilization.'
  } finally {
    loading.value = false
  }
}

/* ------------------------------
   Lifecycle
------------------------------ */
onMounted(fetchProjects)

/* ------------------------------
   Validators
------------------------------ */
const requiredValidator = v => (!!v || v === 0) || 'This field is required'
</script>


<style scoped>
.mb-4 { margin-block-end: 16px; }
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.ms-2 { margin-inline-start: 8px; }
</style>
