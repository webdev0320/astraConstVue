<template>
  <div class="rental-form-container">
    <VCard class="pa-4">
      <VForm ref="refForm" @submit.prevent="saveRentalRequest">
        <VRow>

          <VCol cols="12" md="4">
              <VTextField
                v-model="form.ren_number"
                label="Rental Equipment Number"
                :error-messages="errorMessages.ren_number"
                clearable
              />
            </VCol>

          <!-- Project -->
          <VCol cols="12" md="4">
            <VSelect
              v-model="form.project_id"
              :items="projectOptions"
              item-title="label"
              item-value="id"
              label="Select Project"
             
              :error-messages="errorMessages.project_id"
              :loading="loading.projects"
              :disabled="loading.projects"
              hide-details="auto"
              clearable
            />

          </VCol>

          <!-- Date -->
          <VCol cols="12" md="4">
            <VTextField
              v-model="form.date"
              type="date"
              label="Date"
             
              :error-messages="errorMessages.date"
              hide-details="auto"
              clearable
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
               
                :loading="loading.categories"
                :disabled="loading.categories"
                hide-details="auto"
                clearable
              />

            </VCol>
            <VCol cols="12" md="4">
              <VSelect
                v-model="assetRequest.asset_sub_category_id"
                :items="subCategoriesForAsset"
                item-title="name"
                item-value="id"
                label="Select Subcategory"
               
                :disabled="!assetRequest.asset_category_id || loading.subCategories"
                :loading="loading.subCategories"
                hide-details="auto"
                clearable
              />

            </VCol>
                <VCol cols="12" md="4">
                  <VSelect
                    v-model="assetRequest.asset_id"
                    :items="assets"
                    item-title="label"
                    item-value="id"
                    label="Asset"
                    :loading="loading.assets"
                    :disabled="!assetRequest.asset_sub_category_id || loading.assets"
                    clearable
                    @update:modelValue="onAssetChange"
                  />
                </VCol>

                <VCol cols="12" md="3">
                  <VTextField
                    v-model.number="assetRequest.quantity"
                    type="number"
                    min="1"
                    :max="assetRequest.maxQty"
                    label="Quantity"
                    :rules="[
                      v => !assetRequest.maxQty || v <= assetRequest.maxQty || `Max allowed: ${assetRequest.maxQty}`
                    ]"
                    hide-details="auto"
                  />
                </VCol>

            <VCol cols="12" md="3">
              <VTextField
                v-model="assetRequest.start_date"
                type="date"
                label="Date of Need"
               
                :error-messages="errorMessages.asset_request?.start_date"
                hide-details="auto"
                clearable

              />

            </VCol>
            <VCol cols="12" md="3">
              <VTextField
                v-model="assetRequest.end_date"
                type="date"
                label="End Date"
               
                :error-messages="errorMessages.asset_request?.end_date"
                hide-details="auto"
                clearable

              />

            </VCol>
            <VCol cols="12" md="12">
              <VTextField
                v-model="assetRequest.activity"
                label="Activity"
               
                :error-messages="errorMessages.asset_request?.activity"
                hide-details="auto"

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
              {{ asset.activity }} — {{ assetNameById(asset.asset_id) }} — Qty: {{ asset.quantity }} — {{ formatDate(asset.start_date) }} to {{ formatDate(asset.end_date) }}
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
            <template #item.start_date="{ item }">
              {{ formatDate(item.start_date) }}
            </template>
            <template #item.end_date="{ item }">
              {{ formatDate(item.end_date) }}
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
            
            <VCol cols="12" md="3">
              <VSelect
                v-model="rentalEquipment.asset_category_id"
                :items="categories"
                item-title="name"
                item-value="id"
                label="Select Asset Category"
               
                :loading="loading.categories"
                :disabled="loading.categories"
                hide-details="auto"
                clearable

              />

            </VCol>
            <VCol cols="12" md="3">
              <VSelect
                v-model="rentalEquipment.asset_sub_category_id"
                :items="subCategoriesForRental"
                item-title="name"
                item-value="id"
                label="Select Subcategory"
               
                :disabled="!rentalEquipment.asset_category_id || loading.subCategories"
                :loading="loading.subCategories"
                hide-details="auto"
                clearable

              />

            </VCol>
            
              

            <VCol cols="12" md="3">
              <VSelect
                v-model="rentalEquipment.asset_id"
                :items="assets"
                item-title="label"
                item-value="id"
                label="Asset"
               
                :loading="loading.assets"
                :disabled="!rentalEquipment.asset_sub_category_id || loading.assets"
                hide-details="auto"
                clearable
                @update:modelValue="onAssetChangeRental"

              />

            </VCol>

              <VCol cols="12" md="3">
                  <VTextField
                    v-model.number="rentalEquipment.quantity_at_site"
                    type="number"
                    min="1"
                    :max="assetRequest.maxQty"
                    label="Quantity at Site"
                    :rules="[
                      v => !assetRequest.maxQty || v <= assetRequest.maxQty || `Max allowed: ${assetRequest.maxQty}`
                    ]"
                    hide-details="auto"
                    readonly
                    variant="outlined"
                  />
                </VCol>

           
          
            <VCol cols="12" md="3">
              <VTextField
                v-model="rentalEquipment.start_date"
                type="date"
                label="Start Date"
               
                :error-messages="errorMessages.rental_equipment?.start_date"
                hide-details="auto"
                clearable

              />

            </VCol>
            <VCol cols="12" md="3">
              <VTextField
                v-model="rentalEquipment.end_date"
                type="date"
                label="End Date"
               
                :error-messages="errorMessages.rental_equipment?.end_date"
                hide-details="auto"
                clearable

              />

            </VCol>
            <VCol cols="12" md="3">
              <VTextField
                v-model="rentalEquipment.spo_number"
                label="SPO Number"
               
                :error-messages="errorMessages.rental_equipment?.spo_number"
                hide-details="auto"

              />
              <small class="text-medium-emphasis">Unique SPO number</small>
            </VCol>
             <VCol cols="12" md="12">
              <VTextField
                v-model="rentalEquipment.activity"
                label="Activity"
               
                :error-messages="errorMessages.rental_equipment?.activity"
                hide-details="auto"

              />

            </VCol>
            <VCol cols="12" md="4" class="d-flex align-end">
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
const today = new Date().toISOString().split('T')[0]
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

const ren_number = ref(null);

// dropdown data
const projectOptions = ref([])
const categories = ref([])
const subCategoriesForAsset = ref([])
const subCategoriesForRental = ref([])
const assets = ref([])

// form models
const form = ref({
  project_id: null,
  ren_number: null,
  date: today,
  asset_requests: [],
  rental_equipments: [],
})

const assetRequest = ref({
  asset_category_id: null,
  asset_sub_category_id: null,
  asset_id: null,
  activity: '',
  quantity: null,
  start_date: today,
})

const rentalEquipment = ref({
  asset_category_id: null,
  asset_sub_category_id: null,
  asset_id: null,
  activity: '',
  quantity_at_site: null,
  start_date: today,
  end_date: '',
  spo_number: '',
})

// table headers
const assetHeaders = [
  { title: 'Activity', key: 'activity' },
  { title: 'Asset', key: 'asset_id' },
  { title: 'Quantity', key: 'quantity' },
  { title: 'Date of Need', key: 'start_date' },
  { title: 'Request End Date', key: 'end_date' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const rentalHeaders = [
  { title: 'Activity', key: 'activity' },
  { title: 'Asset', key: 'asset_id' },
  { title: 'Quantity at Site', key: 'quantity_at_site' },
  { title: 'Start Date', key: 'start_date' },
  { title: 'End Date', key: 'end_date' },
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
    assetRequest.value.start_date &&
    assetRequest.value.end_date
  )
)

const isRentalEquipmentValid = computed(() =>
  !!(
    rentalEquipment.value.asset_category_id &&
    rentalEquipment.value.asset_sub_category_id &&
    rentalEquipment.value.asset_id &&
    rentalEquipment.value.activity &&
    rentalEquipment.value.quantity_at_site > 0 &&
    rentalEquipment.value.start_date &&
    rentalEquipment.value.end_date &&
    rentalEquipment.value.spo_number
  )
)

const totalAssetQuantity = computed(() =>
  form.value.asset_requests.reduce((sum, r) => sum + Number(r.quantity || 0), 0)
)

const totalEquipmentQuantity = computed(() =>
  form.value.rental_equipments.reduce((sum, r) => sum + Number(r.quantity_at_site || 0), 0)
)

const assetNameById = (val) => {
  if (!val) return '—'

  if (!Array.isArray(assets.value) || assets.value.length === 0) {
    console.warn("⚠️ assets list not ready yet")
    return '...'
  }

  const selected = assets.value.find(a => Number(a.id) === Number(val))

  console.log(
    "Find asset",
    val,
    "| available IDs:",
    assets.value.map(a => a.id),
    "| matched asset:",
    selected
  )

  return selected?.label ?? 'Unknown Asset'
}

const isPastDate = (date) => {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  return d < today;
}


const onAssetChange = (val) => {
  // if cleared
  if (!val) {
    assetRequest.value.asset_id = null
    assetRequest.value.maxQty = null
    assetRequest.value.quantity = 1
    return
  }

  const selected = assets.value.find(a => a.id === Number(val))

  if (selected) {
    assetRequest.value.maxQty = Number(selected.quantity ?? 0)

    // Auto-set quantity to available qty or 1 (if 0 stock)
    assetRequest.value.quantity = assetRequest.value.maxQty > 0 ? assetRequest.value.maxQty : 1
  } else {
    assetRequest.value.maxQty = null
    assetRequest.value.quantity = 1
  }
}


const onAssetChangeRental = async (val) => {
  // Reset if asset is cleared
  if (!val) {
    rentalEquipment.value.asset_id = null
    rentalEquipment.value.maxQty = null
    rentalEquipment.value.quantity_at_site = 1
    return
  }

  try {
    // Set selected asset ID
    rentalEquipment.value.asset_id = val

    // Call API to fetch latest quantity
    const res = await axios.get(
      `${apiBaseUrl}/project/asset/${val}?project_id=${form.value.project_id}`,
      { headers: authHeaders() }
    )

    // Extract data from API response (adjust based on actual response structure)
    const quantity = res.data.data || res.data
    console.log(quantity);
    // Example: if your API returns { id, name, quantity, remaining_quantity }
    const availableQty = Number(quantity??1)

    // Update reactive state
    rentalEquipment.value.maxQty = availableQty
    rentalEquipment.value.quantity_at_site = availableQty > 0 ? availableQty : 1

  } catch (error) {
    console.error('Error fetching asset data:', error)
    // Reset to safe defaults on error
    rentalEquipment.value.maxQty = null
    rentalEquipment.value.quantity_at_site = 1
  }
}




const isEndBeforeStart = (start, end) => {
  if (!start || !end) return false;
  return new Date(end) < new Date(start);
}

watch(
  () => rentalEquipment.value.start_date,
  (newStart) => {
    if (isPastDate(newStart)) {
      errorMessages.value.rental_equipment = {
        ...errorMessages.value.rental_equipment,
        start_date: 'Start date cannot be older than today',
      };
    } else {
      if (errorMessages.value.rental_equipment) errorMessages.value.rental_equipment.start_date = '';
    }

    // Also validate end_date
    if (rentalEquipment.value.end_date && isEndBeforeStart(newStart, rentalEquipment.value.end_date)) {
      errorMessages.value.rental_equipment = {
        ...errorMessages.value.rental_equipment,
        end_date: 'End date cannot be before start date',
      };
    } else {
      if (errorMessages.value.rental_equipment) errorMessages.value.rental_equipment.end_date = '';
    }
  }
)

watch(
  () => rentalEquipment.value.end_date,
  (newEnd) => {
    if (isPastDate(newEnd)) {
      errorMessages.value.rental_equipment = {
        ...errorMessages.value.rental_equipment,
        end_date: 'End date cannot be older than today',
      };
    } else if (rentalEquipment.value.start_date && isEndBeforeStart(rentalEquipment.value.start_date, newEnd)) {
      errorMessages.value.rental_equipment = {
        ...errorMessages.value.rental_equipment,
        end_date: 'End date cannot be before start date',
      };
    } else {
      if (errorMessages.value.rental_equipment) errorMessages.value.rental_equipment.end_date = '';
    }
  }
)


watch(
  () => assetRequest.value.start_date,
  (newDate) => {
    if (isPastDate(newDate)) {
      errorMessages.value.asset_request = {
        ...errorMessages.value.asset_request,
        start_date: 'Date of need cannot be older than today',
      };
    } else {
      if (errorMessages.value.asset_request) errorMessages.value.asset_request.start_date = '';
    }
  }
)

watch(
  () => assetRequest.value.end_date,
  (newEnd) => {
    if (isPastDate(newEnd)) {
      errorMessages.value.asset_request = {
        ...errorMessages.value.asset_request,
        end_date: 'Requested end date cannot be older than today',
      };
    } else if (assetRequest.value.start_date && isEndBeforeStart(assetRequest.value.start_date, newEnd)) {
      errorMessages.value.asset_request = {
        ...errorMessages.value.asset_request,
        end_date: 'End date cannot be before date of need',
      };
    } else {
      if (errorMessages.value.asset_request) errorMessages.value.asset_request.end_date = '';
    }
  }
)


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
    //assets.value = []
    return
  }
  loading.value.assets = true
  try {
    const res = await axios.get(`${apiBaseUrl}/assets`, {
      params: { asset_sub_category_id: subCategoryId, project_id : form.value.project_id },
      headers: authHeaders(),
    })
    const list = res.data?.data?.data ?? res.data?.data ?? res.data ?? []

    assets.value = list.map(a => {
      const code = a.code;
      const title = a.title
      return { id: Number(a.id), label: `${code} — ${title}`.trim(),quantity: Number(a.quantity) }
    })


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
/*    assets.value = []*/
    await fetchSubCategories(newVal, 'asset')
  }
)

watch(
  () => rentalEquipment.value.asset_category_id,
  async newVal => {
    rentalEquipment.value.asset_sub_category_id = null
    rentalEquipment.value.asset_id = null
/*    assets.value = []*/
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
  // validate manually
  if (
    !assetRequest.value.asset_category_id ||
    !assetRequest.value.asset_sub_category_id ||
    !assetRequest.value.asset_id ||
    !assetRequest.value.activity ||
    !assetRequest.value.quantity ||
    !assetRequest.value.start_date ||
    !assetRequest.value.end_date
  ) {
    message.value = "Please fill all asset request fields before adding."
    return
  }

  form.value.asset_requests.push({ ...assetRequest.value })

  // Reset
  assetRequest.value = {
    asset_category_id: null,
    asset_sub_category_id: null,
    asset_id: null,
    activity: '',
    quantity: null,
    start_date: '',
    end_date: '',
  }
}



const removeAssetRequest = index => {
  form.value.asset_requests.splice(index, 1)
}

const addRentalEquipment = () => {
  if (!isRentalEquipmentValid.value) return;

  form.value.rental_equipments.push({ ...rentalEquipment.value });

  // reset inline fields
  rentalEquipment.value = {
    asset_category_id: null,
    asset_sub_category_id: null,
    asset_id: null,
    activity: '',
    quantity_at_site: null,
    start_date: '',
    end_date: '',
    end_date: '',
    spo_number: '',
  };

  // reset errors & validation
  errorMessages.value.rental_equipment = {};
  refForm.value?.resetValidation();
};

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
    start_date: '',
    end_date: '',
  }
}

const resetRentalEquipment = () => {
  rentalEquipment.value = {
    asset_category_id: null,
    asset_sub_category_id: null,
    asset_id: null,
    activity: '',
    quantity_at_site: null,
    start_date: '',
    end_date: '',
    spo_number: '',
  }
}

const saveRentalRequest = async () => {
  try {
    loading.value.submit = true
    errorMessages.value = {}

    if (!form.value.asset_requests.length && !form.value.rental_equipments.length) {
      message.value = "Please add at least one request."
      return
    }


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
      ren_number: form.value.ren_number,
      asset_requests: form.value.asset_requests.map(r => ({
        asset_category_id: Number(r.asset_category_id),
        asset_sub_category_id: Number(r.asset_sub_category_id),
        asset_id: Number(r.asset_id),
        activity: r.activity,
        quantity: Number(r.quantity),
        start_date: r.start_date,
        end_date: r.end_date,
      })),
      rental_equipments: form.value.rental_equipments.map(r => ({

        asset_category_id: Number(r.asset_category_id),
        asset_sub_category_id: Number(r.asset_sub_category_id),
        asset_id: Number(r.asset_id),
        activity: r.activity,
        quantity_at_site: Number(r.quantity_at_site),
        start_date: r.start_date,
        end_date: r.end_date,
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

const fetchLatestId = async () => {
  try {
    const res = await axios.get(`${apiBaseUrl}/getLatestNumber`, {
      params: { type: 'RentalEquipment'},
      headers: authHeaders(),
    });


    const numberId = res.data.value;
    console.log(numberId);
    form.value.ren_number = numberId;
  } catch (e) {
    console.error(e);
    form.value.ren_number = '';
  } finally {

  }
};

onMounted(async () => {
  await Promise.all([
    fetchProjects(),
    fetchCategories(),
    fetchLatestId()
  ])
})


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
