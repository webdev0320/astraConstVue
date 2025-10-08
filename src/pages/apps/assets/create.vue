<template>
  <div class="d-flex justify-between align-center mb-4">
    <h3>Create Asset</h3>
  </div>

  <VForm ref="refForm" @submit.prevent="submitForm">
    <VRow>
      <!-- ===================== -->
      <!-- Basic Information     -->
      <!-- ===================== -->
      <VCol cols="12">
        <h4 class="section-title">Basic Information</h4>
        <VDivider class="my-3" />
      </VCol>

      <!-- Code (REQUIRED) -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="asset.code"
          label="Code"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.code"
          clearable
        />
      </VCol>

      <!-- Asset Investment Request (REQUIRED) -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="asset.asset_investment_requests_id"
          :items="investmentRequests"
          item-title="label"
          item-value="id"
          label="Asset Investment Request"
          :loading="loadingInvestmentRequests"
          :disabled="loadingInvestmentRequests"
          :error-messages="errorMessages.asset_investment_requests_id"
          clearable
        />
      </VCol>

      <!-- Title (REQUIRED) -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="asset.title"
          label="Title"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.title"
          clearable
        />
      </VCol>

      <!-- Category (REQUIRED) -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="asset.asset_category_id"
          :items="categories"
          item-title="name"
          item-value="id"
          label="Category"
          :rules="[requiredValidator]"
          :loading="loadingCategories"
          :disabled="loadingCategories"
          :error-messages="errorMessages.asset_category_id"
          clearable
        />
      </VCol>

      <!-- Sub Category (REQUIRED) -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="asset.asset_sub_category_id"
          :items="subCategories"
          item-title="name"
          item-value="id"
          label="Sub Category"
          :rules="[requiredValidator]"
          :loading="loadingSubCategories"
          :disabled="!asset.asset_category_id || loadingSubCategories"
          :error-messages="errorMessages.asset_sub_category_id"
          clearable
        />
      </VCol>

      <!-- Type (optional) -->
      <!-- <VCol cols="12" md="6">
        <VSelect
          v-model="asset.type"
          :items="TYPE_OPTIONS"
          label="Type"
          clearable
        />
      </VCol> -->

      <!-- Asset Type (optional) -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="asset.asset_type"
          :items="ASSET_TYPE_OPTIONS"
          label="Asset Type"
          clearable
        />
      </VCol>

      <!-- Location (optional) -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="asset.location_id"
          :items="locations"
          item-title="name"
          item-value="id"
          label="Location"
          :loading="loadingLocations"
          :disabled="loadingLocations"
          clearable
        />
      </VCol>

      <!-- Description (REQUIRED) -->
      <VCol cols="12">
        <VTextarea
          v-model="asset.description"
          label="Description"
          :rows="3"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.description"
        />
      </VCol>

      <!-- ===================== -->
      <!-- Make Information      -->
      <!-- ===================== -->
      <VCol cols="12">
        <h4 class="section-title">Make Information</h4>
        <VDivider class="my-3" />
      </VCol>

      <!-- Serial Number (optional) -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="asset.serial_number"
          label="Serial Number"
          :error-messages="errorMessages.serial_number"
          clearable
        />
      </VCol>

      <!-- Plate Number (optional) -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="asset.plate_number"
          label="Plate Number"
          :error-messages="errorMessages.plate_number"
          clearable
        />
      </VCol>

      <!-- Make (optional) -->
      <!-- <VCol cols="12" md="6">
        <VTextField
          v-model="asset.make"
          label="Make"
          :error-messages="errorMessages.make"
          clearable
        />
      </VCol> -->
      
      <!-- Brand (optional) -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="asset.brand"
          label="Brand"
          clearable
        />
      </VCol>

      <!-- Model (optional) -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="asset.model"
          label="Model"
          clearable
        />
      </VCol>

      <!-- Model Number (optional) -->
      <!-- <VCol cols="12" md="6">
        <VTextField
          v-model="asset.model_number"
          label="Model Number"
          clearable
        />
      </VCol> -->

      <!-- Manufacturing Year -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="asset.manufacturing_year"
          label="Manufacturing Year"
          type="date"
          :error-messages="errorMessages.manufacturing_year"
        />
      </VCol>

      <!-- ===================== -->
      <!-- Date Information      -->
      <!-- ===================== -->
      <VCol cols="12">
        <h4 class="section-title">Date Information</h4>
        <VDivider class="my-3" />
      </VCol>

      <!-- Insurance Start Date -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="asset.insurance_start_date"
          label="Insurance Start Date"
          type="date"
          :error-messages="errorMessages.insurance_start_date"
        />
      </VCol>

      <!-- Insurance End Date -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="asset.insurance_end_date"
          label="Insurance End Date"
          type="date"
          :error-messages="errorMessages.insurance_end_date"
        />
      </VCol>

      <!-- Warranty Start Date -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="asset.warranty_start_date"
          label="Warranty Start Date"
          type="date"
          :error-messages="errorMessages.warranty_start_date"
        />
      </VCol>

      <!-- Warranty End Date -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="asset.warranty_end_date"
          label="Warranty End Date"
          type="date"
          :error-messages="errorMessages.warranty_end_date"
        />
      </VCol>

      <!-- Extended Warranty -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="asset.extended_warranty"
          label="Extended Warranty Date"
          type="date"
          :error-messages="errorMessages.extended_warranty"
        />
      </VCol>

      <!-- Purchase Date -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="asset.purchase_date"
          label="Purchase Date"
          type="date"
          :error-messages="errorMessages.purchase_date"
        />
      </VCol>

      <!-- Production Date (optional) -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="asset.production_date"
          label="Production Date"
          type="date"
        />
      </VCol>

      <!-- Is Related to IT (REQUIRED) -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="asset.is_related_to_it"
          :items="yesNoOptions"
          item-title="title"
          item-value="value"
          label="Is Related to IT"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.is_related_to_it"
          clearable
        />
      </VCol>

      <!-- ===================== -->
      <!-- Price                 -->
      <!-- ===================== -->
      <VCol cols="12">
        <h4 class="section-title">Price</h4>
        <VDivider class="my-3" />
      </VCol>

      <VCol cols="12" md="4">
        <VTextField
          v-model="asset.depreciation_rate"
          type="number"
          label="Depreciation Rate (%)"
          :rules="[percentOptionalValidator]"
          clearable
        />
      </VCol>

      <VCol cols="12" md="4">
        <VTextField v-model="asset.price" type="number" label="Price" :rules="[numberOptionalValidator]" clearable />
      </VCol>

      <VCol cols="12" md="4">
        <VTextField v-model="asset.useful_life" type="number" label="Useful Life" :rules="[numberOptionalValidator]" clearable />
      </VCol>

      <VCol cols="12" md="4">
        <VTextField v-model="asset.replacement_cost" type="number" label="Replacement Cost" :rules="[numberOptionalValidator]" clearable />
      </VCol>

      <VCol cols="12" md="4">
        <VTextField v-model="asset.purchase_cost" type="number" label="Purchase Cost" :rules="[numberOptionalValidator]" clearable />
      </VCol>

      <VCol cols="12" md="4">
        <VTextField v-model="asset.nbv" type="number" label="Book Value (NBV)" :rules="[numberOptionalValidator]" clearable />
      </VCol>
      
      <!-- ===================== -->
      <!-- images                 -->
      <!-- ===================== -->
      <VCol cols="12">
        <h4 class="section-title">Images</h4>
        <VDivider class="my-3" />
      </VCol>

      <VCol cols="12">
        <VFileInput
          v-model="asset.images"
          label="Upload Images (optional)"
          multiple
          accept="image/*"
          show-size
          counter
          variant="outlined"
          density="comfortable"
          :hide-details="'auto'"
          :error-messages="errorMessages.images"
        />
      </VCol>

      <!-- Submit -->
      <VCol cols="12">
        <VBtn type="submit" color="primary" :loading="loading" :disabled="loading">Submit</VBtn>
      </VCol>
    </VRow>

    <div v-if="message" class="mt-4">{{ message }}</div>
  </VForm>
</template>

<script setup>
import axios from 'axios'
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { VBtn, VCol, VDivider, VFileInput, VForm, VRow, VSelect, VTextField, VTextarea } from 'vuetify/components'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const router = useRouter()

/* ---------------- Options ---------------- */
const TYPE_OPTIONS = ['Vehicle', 'IT Equipment', 'Machinery', 'Furniture', 'Other']
const ASSET_TYPE_OPTIONS = ['Owned', 'Rental', 'Leased', 'Used', 'New']
const today = new Date().toISOString().split('T')[0]

/* ---------------- State ---------------- */
const asset = ref({
  asset_investment_requests_id: null,
  code: '',
  title: '',
  asset_category_id: null,
  asset_sub_category_id: null,
  description: '',
  serial_number: '',
  plate_number: '',
  // make: '',
  brand: '',
  model: '',
  manufacturing_year: today,
  // model_number: '',

  // dates
  insurance_start_date: today,
  insurance_end_date: '',
  warranty_start_date: today,
  warranty_end_date: '',
  extended_warranty: '',
  purchase_date: today,
  production_date: today,

  // misc
  is_related_to_it: null,   // 'yes' | 'no'
  // location: '',          // ⟵ remove this line
  location_id: null,         // ⟵ NEW
  type: '',
  asset_type: '',

  // price-related (optional)
  depreciation_rate: '',
  price: '',
  useful_life: '',
  replacement_cost: '',
  purchase_cost: '',
  nbv: '',

  // files
  images: [],
})

const locations = ref([])          // ⟵ NEW
const loadingLocations = ref(false) // ⟵ NEW


const yesNoOptions = [
  { title: 'Yes', value: 'yes' },
  { title: 'No', value: 'no' },
]

const categories = ref([])
const subCategories = ref([])
const investmentRequests = ref([])

const loading = ref(false)
const loadingCategories = ref(false)
const loadingSubCategories = ref(false)
const loadingInvestmentRequests = ref(false)

const refForm = ref()
const message = ref('')
const errorMessages = ref({})

/* ---------------- Validators ---------------- */
const requiredValidator = value => !!value || 'This field is required'
const numberOptionalValidator = value =>
  (value === '' || value === null || value === undefined)
    ? true
    : (!isNaN(Number(value)) || 'Enter a valid number')
const percentOptionalValidator = value => {
  if (value === '' || value === null || value === undefined) return true
  const n = Number(value)
  if (isNaN(n)) return 'Enter a valid number'
  if (n < 0 || n > 100) return 'Enter a value between 0 and 100'
  return true
}

/* ---------------- Utils ---------------- */
const getCookie = title => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${title}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}
const authHeader = () => {
  const token = decodeURIComponent(getCookie('accessToken') || '')
  return token ? { Authorization: `Bearer ${token}` } : {}
}
const slugToTitle = slug =>
  (slug || '')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/(^|\s)\S/g, s => s.toUpperCase())

/* ---------------- API: fetch ALL pages ---------------- */
const fetchAllCategories = async () => {
  let page = 1
  let all = []
  let total = Infinity
  let perPageFromServer = 15

  while ((page - 1) * perPageFromServer < total) {
    const res = await axios.get(`${apiBaseUrl}/asset-categories`, {
      params: { page },
      headers: { ...authHeader(), Accept: 'application/json' },
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

/* Load top-level categories where parent_id is null */
const fetchCategories = async () => {
  try {
    loadingCategories.value = true
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
  } finally {
    loadingCategories.value = false
  }
}

/* Sub-categories by parent ID */
const fetchSubCategories = async (parentId) => {
  if (!parentId) {
    subCategories.value = []
    return
  }
  try {
    loadingSubCategories.value = true
    const res = await axios.get(`${apiBaseUrl}/asset-categories/${encodeURIComponent(parentId)}`, {
      headers: { ...authHeader(), Accept: 'application/json' },
    })
    const children = res?.data?.data?.children || res?.data?.children || []
    subCategories.value = children
      .filter(ch => ch?.status !== false)
      .map(ch => ({ id: ch.id, slug: ch.slug, name: ch.title || slugToTitle(ch.slug) }))
      .sort((a, b) => a.name.localeCompare(b.name))
  } catch (e) {
    console.error('Failed to load sub categories', e)
    subCategories.value = []
  } finally {
    loadingSubCategories.value = false
  }
}

/* Locations */
const fetchLocations = async () => {
  try {
    loadingLocations.value = true
    const res = await axios.get(`${apiBaseUrl}/locations`, {
      headers: { ...authHeader(), Accept: 'application/json' },
    })

    // API could be { data: [...] } or plain array — handle both
    const list = Array.isArray(res.data?.data) ? res.data.data
               : Array.isArray(res.data) ? res.data
               : []

    // Normalize: only id & name needed for VSelect
    locations.value = list
      .filter(l => l && l.id && l.name)
      .map(l => ({ id: l.id, name: l.name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  } catch (e) {
    console.error('Failed to load locations', e)
    locations.value = []
  } finally {
    loadingLocations.value = false
  }
}

/* Investment Requests (for required select) */
const formatIRLabel = ir => {
  const proj = ir?.project?.name ? `• ${ir.project.name}` : ''
  const type = ir?.request_type || ''
  const qty  = ir?.quantity ?? ''
  const cost = ir?.planned_cost ?? ''
  const date = ir?.date || ''
  return `#${ir.id} ${type} ${date} ${proj} (qty ${qty}, cost ${cost})`.trim()
}

const fetchInvestmentRequests = async () => {
  try {
    loadingInvestmentRequests.value = true
    const res = await axios.get(`${apiBaseUrl}/asset-investment-requests`, {
      headers: { ...authHeader(), Accept: 'application/json' },
    })
    const list = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : []
    investmentRequests.value = list.map(ir => ({
      id: ir.id,
      label: formatIRLabel(ir),
    }))
  } catch (e) {
    console.error('Failed to load asset investment requests', e)
    investmentRequests.value = []
  } finally {
    loadingInvestmentRequests.value = false
  }
}

/* Watchers */
watch(
  () => asset.value.asset_category_id,
  async newVal => {
    asset.value.asset_sub_category_id = null
    await fetchSubCategories(newVal)
  }
)

/* Submit */
const submitForm = async () => {
  try {
    loading.value = true
    errorMessages.value = {}

    // basic required checks
    if (!asset.value.code ||
        !asset.value.title ||
        !asset.value.asset_category_id ||
        !asset.value.asset_sub_category_id ||
        !asset.value.description ||
        !asset.value.is_related_to_it) {
      throw new Error('Please fill all required fields.')
    }

    const token = getCookie('accessToken')
    if (!token) throw new Error('Access token is missing. Please log in.')
    const decodedToken = decodeURIComponent(token)

    const itBool =
      asset.value.is_related_to_it === 'yes' ? true
      : asset.value.is_related_to_it === 'no' ? false
      : null

    const fd = new FormData()

    // helper to append only if present
    const safeAppend = (key, val) => {
      if (val === null || val === undefined || val === '') return
      fd.append(key, String(val))
    }

    // required + ids
    safeAppend('asset_category_id', Number(asset.value.asset_category_id))
    safeAppend('asset_sub_category_id', Number(asset.value.asset_sub_category_id))
    if (asset.value.asset_investment_requests_id) {
      safeAppend('asset_investment_requests_id', Number(asset.value.asset_investment_requests_id))
    }

    safeAppend('code', asset.value.code)
    safeAppend('title', asset.value.title)
    safeAppend('description', asset.value.description)

    // optional enums/text
    safeAppend('type', asset.value.type || '')
    safeAppend('asset_type', asset.value.asset_type || '')

    // identity & make
    safeAppend('serial_number', asset.value.serial_number || '')
    safeAppend('plate_number', asset.value.plate_number || '')
    // safeAppend('model_number', asset.value.model_number || '')
    // safeAppend('make', asset.value.make || '')
    safeAppend('brand', asset.value.brand || '')
    safeAppend('model', asset.value.model || '')
    safeAppend('manufacturing_year', asset.value.manufacturing_year || '')


    // dates
    safeAppend('insurance_start_date', asset.value.insurance_start_date || '')
    safeAppend('insurance_end_date', asset.value.insurance_end_date || '')
    safeAppend('warranty_start_date', asset.value.warranty_start_date || '')
    safeAppend('warranty_end_date', asset.value.warranty_end_date || '')
    safeAppend('extended_warranty', asset.value.extended_warranty || '')
    safeAppend('purchase_date', asset.value.purchase_date || '')
    safeAppend('production_date', asset.value.production_date || '')

    // booleans & misc
    if (itBool !== null) safeAppend('is_related_to_it', itBool ? '1' : '0')

    // ⟵ NEW: Location via dropdown
    if (asset.value.location_id) {
      safeAppend('location_id', Number(asset.value.location_id))
      // (Optional backward-compat) — if API abhi 'location' name bhi accept karta ho
      const loc = (locations.value || []).find(l => l.id === asset.value.location_id)
      if (loc?.name) safeAppend('location', loc.name)
    }

    // numbers
    const numOrEmpty = v => (v === '' || v === null || v === undefined) ? '' : String(Number(v))
    safeAppend('price', numOrEmpty(asset.value.price))
    safeAppend('replacement_cost', numOrEmpty(asset.value.replacement_cost))
    safeAppend('purchase_cost', numOrEmpty(asset.value.purchase_cost))
    safeAppend('book_value', numOrEmpty(asset.value.nbv))
    safeAppend('useful_life', numOrEmpty(asset.value.useful_life))
    // (optional) agar chahen to depreciation_rate bhi bhej dein:
    // safeAppend('depreciation_rate', numOrEmpty(asset.value.depreciation_rate))

    // IMAGES
    ;(asset.value.images || []).forEach(file => {
      if (file instanceof File || (file && typeof file === 'object' && 'size' in file)) {
        fd.append('images[]', file)
      }
    })

    const response = await axios.post(`${apiBaseUrl}/assets`, fd, {
      headers: {
        // DO NOT set Content-Type; browser will set multipart boundary
        Authorization: `Bearer ${decodedToken}`,
        Accept: 'application/json',
      },
    })

    message.value = response.data?.message || 'Asset created successfully!'
    router.push(`/dashboards/assets`)
  } catch (error) {
    console.error('Error submitting form:', error?.response?.data || error)
    if (error.response?.data?.errors) {
      errorMessages.value = error.response.data.errors
      message.value = 'Please fix the highlighted errors.'
    } else {
      message.value = error.response?.data?.message || (error.message ?? 'Failed to create asset.')
    }
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  const keepKeys = Object.keys(asset.value)
  for (const k of keepKeys) asset.value[k] = ''
  asset.value.asset_investment_requests_id = null
  asset.value.asset_category_id = null
  asset.value.asset_sub_category_id = null
  asset.value.is_related_to_it = null
  asset.value.images = []
  asset.value.location_id = null
  subCategories.value = []
}

/* Lifecycle */
onMounted(() => {
  fetchCategories()
  fetchInvestmentRequests()
  fetchLocations()
})
</script>

<style>
.mb-4 { margin-block-end: 16px; }
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.section-title { font-weight: 600; }
.my-3 { margin-block: 12px; margin-inline: 0; }
</style>
