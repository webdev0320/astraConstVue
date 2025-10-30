<template>
  <div class="rental-form-container">
    <div class="d-flex justify-between align-center mb-4">
      <VBtn variant="text" @click="$router.back()">← Back</VBtn>
      <h3>Create Rental Request</h3>
    </div>

    <VCard class="pa-4">
      <VForm ref="refForm" @submit.prevent="saveRentalRequest">
        <VRow>
          <!-- Project -->
          <VCol cols="12" md="8">
            <VSelect
              v-model="form.project_id"
              :items="projectOptions"
              item-title="label"
              item-value="id"
              label="Select Project"
              :rules="[requiredValidator]"
              :error-messages="errorMessages.project_id"
              :loading="loading.projects"
              :disabled="loading.projects"
              hide-details="auto"
              clearable
              prepend-inner-icon="mdi-briefcase"
            />

          </VCol>

          <!-- Date -->
          <VCol cols="12" md="4">
            <VTextField
              v-model="form.date"
              type="date"
              label="Date"
              :rules="[requiredValidator]"
              :error-messages="errorMessages.date"
              hide-details="auto"
              clearable
              prepend-inner-icon="mdi-calendar"
            />
          </VCol>
        </VRow>

        <!-- Asset Requests -->
        <div class="mt-6">
          <div class="font-weight-medium mb-2">LIST OF EQUIPMENT REQUIRED</div>
          <VRow>
            <VCol cols="12" md="4">
              <VSelect
                v-model="assetRequest.asset_category_id"
                :items="categories"
                item-title="name"
                item-value="id"
                label="Select Asset Category"
                :rules="[requiredValidator]"
                :loading="loading.categories"
                :disabled="loading.categories"
                hide-details="auto"
                clearable
                prepend-inner-icon="mdi-category"
              />

            </VCol>
            <VCol cols="12" md="4">
              <VSelect
                v-model="assetRequest.asset_sub_category_id"
                :items="subCategoriesForAsset"
                item-title="name"
                item-value="id"
                label="Select Subcategory"
                :rules="[requiredValidator]"
                :disabled="!assetRequest.asset_category_id || loading.subCategories"
                :loading="loading.subCategories"
                hide-details="auto"
                clearable
                prepend-inner-icon="mdi-subdirectory-arrow-right"
              />

            </VCol>
            <VCol cols="12" md="4">
              <VSelect
                v-model="assetRequest.asset_id"
                :items="assets"
                item-title="code"
                item-value="id"
                label="Select Asset"
                :rules="[requiredValidator]"
                :loading="loading.assets"
                :disabled="!assetRequest.asset_sub_category_id || loading.assets"
                hide-details="auto"
                clearable
                prepend-inner-icon="mdi-cube"
              />

            </VCol>
            <VCol cols="12" md="12">
              <VTextField
                v-model="assetRequest.activity"
                label="Activity"
                :rules="[requiredValidator]"
                :error-messages="errorMessages.asset_request?.activity"
                hide-details="auto"
                prepend-inner-icon="mdi-format-list-bulleted"
              />

            </VCol>
            <VCol cols="12" md="3">
              <VTextField
                v-model.number="assetRequest.quantity"
                type="number"
                label="Quantity"
                min="1"
                step="1"
                :rules="[requiredValidator]"
                :error-messages="errorMessages.asset_request?.quantity"
                hide-details="auto"
                prepend-inner-icon="mdi-numeric"
              />

            </VCol>
            <VCol cols="12" md="3">
              <VTextField
                v-model="assetRequest.date_of_need"
                type="date"
                label="Date of Need"
                :rules="[requiredValidator]"
                :error-messages="errorMessages.asset_request?.date_of_need"
                hide-details="auto"
                clearable
                prepend-inner-icon="mdi-calendar"
              />

            </VCol>
            <VCol cols="12" md="3">
              <VTextField
                v-model="assetRequest.requested_no_days"
                type="date"
                label="Requested End Date"
                :rules="[requiredValidator]"
                :error-messages="errorMessages.asset_request?.requested_no_days"
                hide-details="auto"
                clearable
                prepend-inner-icon="mdi-calendar"
              />

            </VCol>
            <VCol cols="12" md="3" class="d-flex align-end">
              <VBtn
                color="primary"
                @click="addAssetRequest"
                :disabled="!isAssetRequestValid"
              >
                <VIcon start>mdi-plus</VIcon> Add
              </VBtn>
            </VCol>
          </VRow>

          <!-- Asset Request Chips -->
          <div v-if="form.asset_requests.length" class="mt-4">
            <VChip
              v-for="(asset, idx) in form.asset_requests"
              :key="idx"
              class="ma-1"
              closable
              @click:close="removeAssetRequest(idx)"
            >
              {{ asset.activity }} — {{ assetNameById(asset.asset_id) }} — Qty: {{ asset.quantity }} — {{ formatDate(asset.date_of_need) }} to {{ formatDate(asset.requested_no_days) }}
            </VChip>
          </div>

          <!-- Asset Request Table -->
          <VDataTable
            v-if="form.asset_requests.length"
            :headers="assetHeaders"
            :items="form.asset_requests"
            :items-per-page="5"
            class="mt-4"
          >
            <template #item.asset_id="{ item }">
              {{ assetNameById(item.asset_id) }}
            </template>
            <template #item.date_of_need="{ item }">
              {{ formatDate(item.date_of_need) }}
            </template>
            <template #item.requested_no_days="{ item }">
              {{ formatDate(item.requested_no_days) }}
            </template>
            <template #item.actions="{ item }">
              <VBtn color="error" size="small" @click="removeAssetRequest(form.asset_requests.indexOf(item))">
                Delete
              </VBtn>
            </template>
          </VDataTable>
        </div>

        <!-- Rental Equipment -->
        <div class="mt-6">
          <div class="font-weight-medium mb-2">LIST OF EQUIPMENT ALREADY WORKING ON THE PROJECT</div>
          <VRow>
            <VCol cols="12" md="2">
              <VTextField
                v-model.number="rentalEquipment.rental_equipment_id"
                type="number"
                label="Rental Equipment ID"
                min="1"
                step="1"
                :rules="[requiredValidator]"
                :error-messages="errorMessages.rental_equipment?.rental_equipment_id"
                hide-details="auto"
                prepend-inner-icon="mdi-pound"
              />
              <small class="text-medium-emphasis">Unique equipment ID</small>
            </VCol>
            <VCol cols="12" md="2">
              <VSelect
                v-model="rentalEquipment.asset_category_id"
                :items="categories"
                item-title="name"
                item-value="id"
                label="Select Asset Category"
                :rules="[requiredValidator]"
                :loading="loading.categories"
                :disabled="loading.categories"
                hide-details="auto"
                clearable
                prepend-inner-icon="mdi-category"
              />
              <small class="text-medium-emphasis">Choose category to load subcategories</small>
            </VCol>
            <VCol cols="12" md="2">
              <VSelect
                v-model="rentalEquipment.asset_sub_category_id"
                :items="subCategoriesForRental"
                item-title="name"
                item-value="id"
                label="Select Subcategory"
                :rules="[requiredValidator]"
                :disabled="!rentalEquipment.asset_category_id || loading.subCategories"
                :loading="loading.subCategories"
                hide-details="auto"
                clearable
                prepend-inner-icon="mdi-subdirectory-arrow-right"
              />
              <small class="text-medium-emphasis">Subcategories for selected category</small>
            </VCol>
            <VCol cols="12" md="2">
              <VSelect
                v-model="rentalEquipment.asset_id"
                :items="assets"
                item-title="code"
                item-value="id"
                label="Select Asset"
                :rules="[requiredValidator]"
                :loading="loading.assets"
                :disabled="!rentalEquipment.asset_sub_category_id || loading.assets"
                hide-details="auto"
                clearable
                prepend-inner-icon="mdi-cube"
              />
              <small class="text-medium-emphasis">Select an asset</small>
            </VCol>
            <VCol cols="12" md="3">
              <VTextField
                v-model="rentalEquipment.activity"
                label="Activity"
                :rules="[requiredValidator]"
                :error-messages="errorMessages.rental_equipment?.activity"
                hide-details="auto"
                prepend-inner-icon="mdi-format-list-bulleted"
              />
              <small class="text-medium-emphasis">Describe the equipment activity</small>
            </VCol>
            <VCol cols="12" md="2">
              <VTextField
                v-model.number="rentalEquipment.quantity_at_site"
                type="number"
                label="Quantity at Site"
                min="1"
                step="1"
                :rules="[requiredValidator]"
                :error-messages="errorMessages.rental_equipment?.quantity_at_site"
                hide-details="auto"
                prepend-inner-icon="mdi-numeric"
              />
              <small class="text-medium-emphasis">Number of equipment at site</small>
            </VCol>
            <VCol cols="12" md="2">
              <VTextField
                v-model="rentalEquipment.start_date"
                type="date"
                label="Start Date"
                :rules="[requiredValidator]"
                :error-messages="errorMessages.rental_equipment?.start_date"
                hide-details="auto"
                clearable
                prepend-inner-icon="mdi-calendar"
              />
              <small class="text-medium-emphasis">Equipment rental start date</small>
            </VCol>
            <VCol cols="12" md="2">
              <VTextField
                v-model="rentalEquipment.end_date"
                type="date"
                label="End Date"
                :rules="[requiredValidator]"
                :error-messages="errorMessages.rental_equipment?.end_date"
                hide-details="auto"
                clearable
                prepend-inner-icon="mdi-calendar"
              />
              <small class="text-medium-emphasis">Equipment rental end date</small>
            </VCol>
            <VCol cols="12" md="2">
              <VTextField
                v-model="rentalEquipment.requested_no_days"
                type="date"
                label="Requested End Date"
                :rules="[requiredValidator]"
                :error-messages="errorMessages.rental_equipment?.requested_no_days"
                hide-details="auto"
                clearable
                prepend-inner-icon="mdi-calendar"
              />
              <small class="text-medium-emphasis">End date of rental</small>
            </VCol>
            <VCol cols="12" md="2">
              <VTextField
                v-model="rentalEquipment.spo_number"
                label="SPO Number"
                :rules="[requiredValidator]"
                :error-messages="errorMessages.rental_equipment?.spo_number"
                hide-details="auto"
                prepend-inner-icon="mdi-pound"
              />
              <small class="text-medium-emphasis">Unique SPO number</small>
            </VCol>
            <VCol cols="12" md="2" class="d-flex align-end">
              <VBtn
                color="primary"
                @click="addRentalEquipment"
                :disabled="!isRentalEquipmentValid"
              >
                <VIcon start>mdi-plus</VIcon> Add
              </VBtn>
            </VCol>
          </VRow>

          <!-- Rental Equipment Chips -->
          <div v-if="form.rental_equipments.length" class="mt-4">
            <VChip
              v-for="(rental, idx) in form.rental_equipments"
              :key="idx"
              class="ma-1"
              closable
              @click:close="removeRentalEquipment(idx)"
            >
              {{ rental.activity }} — {{ assetNameById(rental.asset_id) }} — Qty: {{ rental.quantity_at_site }} — {{ rental.spo_number }}
            </VChip>
          </div>

          <!-- Rental Equipment Table -->
          <VDataTable
            v-if="form.rental_equipments.length"
            :headers="rentalHeaders"
            :items="form.rental_equipments"
            :items-per-page="5"
            class="mt-4"
          >
            <template #item.asset_id="{ item }">
              {{ assetNameById(item.asset_id) }}
            </template>
            <template #item.start_date="{ item }">
              {{ formatDate(item.start_date) }}
            </template>
            <template #item.end_date="{ item }">
              {{ formatDate(item.end_date) }}
            </template>
            <template #item.requested_no_days="{ item }">
              {{ formatDate(item.requested_no_days) }}
            </template>
            <template #item.actions="{ item }">
              <VBtn color="error" size="small" @click="removeRentalEquipment(form.rental_equipments.indexOf(item))">
                Delete
              </VBtn>
            </template>
          </VDataTable>
        </div>

        <!-- Summary -->
        <VCol cols="12" class="d-flex justify-end mt-4">
          <div class="text-end">
            <div class="text-medium-emphasis">Asset Requests: <b>{{ form.asset_requests.length }}</b></div>
            <div class="text-medium-emphasis">Total Asset Quantity: <b>{{ totalAssetQuantity }}</b></div>
            <div class="text-medium-emphasis">Rental Equipments: <b>{{ form.rental_equipments.length }}</b></div>
            <div class="text-medium-emphasis">Total Equipment Quantity: <b>{{ totalEquipmentQuantity }}</b></div>
          </div>
        </VCol>

        <!-- Actions -->
        <div class="d-flex gap-2 mt-4">
          <VBtn
            color="primary"
            type="submit"
            :loading="loading.submit"
            :disabled="loading.submit || (!form.asset_requests.length && !form.rental_equipments.length)"
          >
            <VIcon start>mdi-content-save</VIcon> Save All
          </VBtn>
          <VBtn variant="text" @click="clearAll" :disabled="!form.asset_requests.length && !form.rental_equipments.length">
            Clear
          </VBtn>
        </div>

        <VAlert v-if="message" :type="message.includes('success') ? 'success' : 'error'" class="mt-4">
          {{ message }}
        </VAlert>
      </VForm>
    </VCard>
  </div>
</template>

<script setup>
import axios from 'axios'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { VAlert, VBtn, VCard, VChip, VCol, VDataTable, VForm, VIcon, VRow, VSelect, VTextField } from 'vuetify/components'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL // should end with /api

const router = useRouter()

// ---- state ----
const refForm = ref()
const loading = ref({
  projects: false,
  categories: false,
  subCategories: false,
  assets: false,
  submit: false,
})
const message = ref('')
const errorMessages = ref({})

// dropdown data
const projectOptions = ref([])
const categories = ref([])
const subCategoriesForAsset = ref([])
const subCategoriesForRental = ref([])
const assets = ref([])

// form models
const form = ref({
  project_id: null,
  date: '',
  asset_requests: [],
  rental_equipments: [],
})

const assetRequest = ref({
  asset_category_id: null,
  asset_sub_category_id: null,
  asset_id: null,
  activity: '',
  quantity: null,
  date_of_need: '',
  requested_no_days: '',
})

const rentalEquipment = ref({
  rental_equipment_id: null,
  asset_category_id: null,
  asset_sub_category_id: null,
  asset_id: null,
  activity: '',
  quantity_at_site: null,
  start_date: '',
  end_date: '',
  requested_no_days: '',
  spo_number: '',
})

// table headers
const assetHeaders = [
  { title: 'Activity', key: 'activity' },
  { title: 'Asset', key: 'asset_id' },
  { title: 'Quantity', key: 'quantity' },
  { title: 'Date of Need', key: 'date_of_need' },
  { title: 'Requested End Date', key: 'requested_no_days' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const rentalHeaders = [
  { title: 'Rental Equipment ID', key: 'rental_equipment_id' },
  { title: 'Activity', key: 'activity' },
  { title: 'Asset', key: 'asset_id' },
  { title: 'Quantity at Site', key: 'quantity_at_site' },
  { title: 'Start Date', key: 'start_date' },
  { title: 'End Date', key: 'end_date' },
  { title: 'Requested End Date', key: 'requested_no_days' },
  { title: 'SPO Number', key: 'spo_number' },
  { title: 'Actions', key: 'actions', sortable: false },
]

// utils
const requiredValidator = value => !!value || 'This field is required'

const slugToTitle = slug =>
  (slug || '')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/(^|\s)\S/g, s => s.toUpperCase())

const formatDate = date => {
  if (!date) return ''
  if (typeof date === 'string') return date
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

// computed
const isAssetRequestValid = computed(() =>
  !!(
    assetRequest.value.asset_category_id &&
    assetRequest.value.asset_sub_category_id &&
    assetRequest.value.asset_id &&
    assetRequest.value.activity &&
    assetRequest.value.quantity > 0 &&
    assetRequest.value.date_of_need &&
    assetRequest.value.requested_no_days
  )
)

const isRentalEquipmentValid = computed(() =>
  !!(
    rentalEquipment.value.rental_equipment_id &&
    rentalEquipment.value.asset_category_id &&
    rentalEquipment.value.asset_sub_category_id &&
    rentalEquipment.value.asset_id &&
    rentalEquipment.value.activity &&
    rentalEquipment.value.quantity_at_site > 0 &&
    rentalEquipment.value.start_date &&
    rentalEquipment.value.end_date &&
    rentalEquipment.value.requested_no_days &&
    rentalEquipment.value.spo_number
  )
)

const totalAssetQuantity = computed(() =>
  form.value.asset_requests.reduce((sum, r) => sum + Number(r.quantity || 0), 0)
)

const totalEquipmentQuantity = computed(() =>
  form.value.rental_equipments.reduce((sum, r) => sum + Number(r.quantity_at_site || 0), 0)
)

const assetNameById = id => {
  const asset = assets.value.find(a => Number(a.id) === Number(id))

  return asset?.code ?? 'Unknown Asset'
}

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

// fetch data
const fetchProjects = async () => {
  loading.value.projects = true
  try {
    const res = await axios.get(`${apiBaseUrl}/projects`, { headers: authHeaders() })
    projectOptions.value = res.data.data.map(project => ({
      id: project.id,
      label: project.name,
    }))
  } catch (error) {
    console.error('Error fetching Projects:', error)
    message.value = 'Failed to load projects.'
  } finally {
    loading.value.projects = false
  }
}

const fetchAllCategories = async () => {
  let page = 1
  let all = []
  let total = Infinity
  let perPageFromServer = 15

  while ((page - 1) * perPageFromServer < total) {
    const res = await axios.get(`${apiBaseUrl}/asset-categories`, {
      params: { page },
      headers: authHeaders(),
    })

    const list =
      Array.isArray(res.data?.categories) ? res.data.categories
      : Array.isArray(res.data?.data) ? res.data.data
      : Array.isArray(res.data) ? res.data : []

    all = all.concat(list)

    total = Number(res.data?.total_records ?? total)
    perPageFromServer = Number(res.data?.perPage ?? perPageFromServer)

    if (!list.length) break
    page += 1
  }

  return all
}

const fetchCategories = async () => {
  try {
    loading.value.categories = true
    const raw = await fetchAllCategories()

    const parents = raw.filter(
      c => c && c.status === true && c.is_parent === true && (c.parent_id === null || c.parent_id === undefined)
    )

    categories.value = parents
      .map(c => ({ id: c.id, slug: c.slug, name: c.title || slugToTitle(c.slug) }))
      .sort((a, b) => a.name.localeCompare(b.name))
  } catch (e) {
    console.error('Failed to load categories', e)
    categories.value = []
    message.value = 'Failed to load categories.'
  } finally {
    loading.value.categories = false
  }
}

const fetchSubCategories = async (parentId, target) => {
  if (!parentId) {
    if (target === 'asset') subCategoriesForAsset.value = []
    else subCategoriesForRental.value = []
    return
  }
  try {
    loading.value.subCategories = true
    const res = await axios.get(`${apiBaseUrl}/asset-categories/${encodeURIComponent(parentId)}`, {
      headers: authHeaders(),
    })
    const children = res?.data?.data?.children || res?.data?.children || []
    const formatted = children
      .filter(ch => ch?.status !== false)
      .map(ch => ({ id: ch.id, slug: ch.slug, name: ch.title || slugToTitle(ch.slug) }))
      .sort((a, b) => a.name.localeCompare(b.name))
    
    if (target === 'asset') subCategoriesForAsset.value = formatted
    else subCategoriesForRental.value = formatted
  } catch (e) {
    console.error('Failed to load sub categories', e)
    if (target === 'asset') subCategoriesForAsset.value = []
    else subCategoriesForRental.value = []
    message.value = 'Failed to load subcategories.'
  } finally {
    loading.value.subCategories = false
  }
}

const fetchAssets = async (subCategoryId) => {
  if (!subCategoryId) {
    assets.value = []
    return
  }
  loading.value.assets = true
  try {
    const res = await axios.get(`${apiBaseUrl}/assets`, {
      params: { asset_sub_category_id: subCategoryId },
      headers: authHeaders(),
    })
    const list = res.data?.data?.data ?? res.data?.data ?? res.data ?? []
    assets.value = Array.isArray(list) ? list : []
  } catch (error) {
    console.error('Error fetching Assets:', error)
    message.value = 'Failed to load assets.'
  } finally {
    loading.value.assets = false
  }
}

// watchers
watch(
  () => assetRequest.value.asset_category_id,
  async newVal => {
    assetRequest.value.asset_sub_category_id = null
    assetRequest.value.asset_id = null
    assets.value = []
    await fetchSubCategories(newVal, 'asset')
  }
)

watch(
  () => rentalEquipment.value.asset_category_id,
  async newVal => {
    rentalEquipment.value.asset_sub_category_id = null
    rentalEquipment.value.asset_id = null
    assets.value = []
    await fetchSubCategories(newVal, 'rental')
  }
)

watch(
  () => assetRequest.value.asset_sub_category_id,
  async newVal => {
    assetRequest.value.asset_id = null
    await fetchAssets(newVal)
  }
)

watch(
  () => rentalEquipment.value.asset_sub_category_id,
  async newVal => {
    rentalEquipment.value.asset_id = null
    await fetchAssets(newVal)
  }
)

// actions
const addAssetRequest = () => {
  if (!isAssetRequestValid.value) return
  form.value.asset_requests.push({ ...assetRequest.value })
  resetAssetRequest()
}

const removeAssetRequest = index => {
  form.value.asset_requests.splice(index, 1)
}

const addRentalEquipment = () => {
  if (!isRentalEquipmentValid.value) return
  form.value.rental_equipments.push({ ...rentalEquipment.value })
  resetRentalEquipment()
}

const removeRentalEquipment = index => {
  form.value.rental_equipments.splice(index, 1)
}

const clearAll = () => {
  form.value.asset_requests = []
  form.value.rental_equipments = []
  resetAssetRequest()
  resetRentalEquipment()
  form.value.project_id = null
  form.value.date = ''
}

const resetAssetRequest = () => {
  assetRequest.value = {
    asset_category_id: null,
    asset_sub_category_id: null,
    asset_id: null,
    activity: '',
    quantity: null,
    date_of_need: '',
    requested_no_days: '',
  }
}

const resetRentalEquipment = () => {
  rentalEquipment.value = {
    rental_equipment_id: null,
    asset_category_id: null,
    asset_sub_category_id: null,
    asset_id: null,
    activity: '',
    quantity_at_site: null,
    start_date: '',
    end_date: '',
    requested_no_days: '',
    spo_number: '',
  }
}

const saveRentalRequest = async () => {
  try {
    loading.value.submit = true
    errorMessages.value = {}

    // Validate form
    const { valid, errors } = await refForm.value.validate()
    if (!valid) {
      console.error('Form validation errors:', errors)
      message.value = 'Please fill all required fields correctly. Check the form for errors.'
      return
    }

    // Ensure at least one asset_request or rental_equipment exists
    if (!form.value.asset_requests.length && !form.value.rental_equipments.length) {
      message.value = 'Please add at least one asset request or rental equipment.'
      return
    }

    // Validate project_id and date
    if (!form.value.project_id || !form.value.date) {
      message.value = 'Project and date are required.'
      return
    }

    const payload = {
      project_id: Number(form.value.project_id),
      date: form.value.date,
      asset_requests: form.value.asset_requests.map(r => ({
        asset_category_id: Number(r.asset_category_id),
        asset_sub_category_id: Number(r.asset_sub_category_id),
        asset_id: Number(r.asset_id),
        activity: r.activity,
        quantity: Number(r.quantity),
        date_of_need: r.date_of_need,
        requested_no_days: r.requested_no_days,
      })),
      rental_equipments: form.value.rental_equipments.map(r => ({
        rental_equipment_id: Number(r.rental_equipment_id),
        asset_category_id: Number(r.asset_category_id),
        asset_sub_category_id: Number(r.asset_sub_category_id),
        asset_id: Number(r.asset_id),
        activity: r.activity,
        quantity_at_site: Number(r.quantity_at_site),
        start_date: r.start_date,
        end_date: r.end_date,
        requested_no_days: r.requested_no_days,
        spo_number: r.spo_number,
      })),
    }

    const res = await axios.post(`${apiBaseUrl}/rental-required`, payload, {
      headers: {
        ...authHeaders(),
        'Content-Type': 'application/json',
      },
    })

    message.value = res.data?.message || 'Rental request created successfully!'
    router.push({ name: 'dashboards-rental-required' })
  } catch (error) {
    console.error('Error submitting form:', error)
    message.value = error.response?.data?.message || 'Failed to create rental request.'
    if (error.response?.data?.errors) {
      errorMessages.value = error.response.data.errors
      console.error('API validation errors:', errorMessages.value)
    }
  } finally {
    loading.value.submit = false
  }
}

// init
fetchProjects()
fetchCategories()
</script>

<style scoped>
.rental-form-container {
  padding: 16px;
  margin-block: 0;
  margin-inline: auto;
  max-inline-size: 1200px;
}

h3 {
  color: #1a1a1a;
  font-size: 1.5rem;
  font-weight: 500;
}

.pa-4 {
  padding: 24px !important;
}

.d-flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}

.align-center {
  align-items: center;
}

.align-end {
  align-items: flex-end;
}

.gap-2 {
  gap: 8px;
}

.mb-4 {
  margin-block-end: 16px;
}

.mt-4 {
  margin-block-start: 16px;
}

.mt-6 {
  margin-block-start: 24px;
}

.text-medium-emphasis {
  opacity: 0.7;
}

.v-btn {
  text-transform: none;
}

.v-alert {
  border-radius: 4px;
}

@media (min-width: 960px) {
  .rental-form-container {
    padding: 24px;
  }
}
</style>
