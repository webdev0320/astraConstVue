<template>
  <div class="d-flex justify-between align-center mb-4">
    <h3>Edit Asset</h3>
  </div>

  <VForm ref="refForm" @submit.prevent="submitForm">
    <VRow>

      <!-- ===================== -->
      <!-- Base Information      -->
      <!-- ===================== -->
      <VCol cols="12">
        <h4 class="section-title">Base Information</h4>
        <VDivider class="my-3" />
      </VCol>

      <!-- Asset Investment Request (REQUIRED) -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="asset.asset_investment_requests_id"
          :items="investmentRequests"
          item-title="label"
          item-value="id"
          label="Asset Investment Request"
          :rules="[requiredValidator]"
          :loading="loadingInvestmentRequests"
          :disabled="loadingInvestmentRequests"
          :error-messages="errorMessages.asset_investment_requests_id"
          clearable
        />
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

      <!-- Name (REQUIRED - UI only; payload may be ignored by API) -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="asset.name"
          label="Name"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.name"
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
      <VCol cols="12" md="6">
        <VSelect
          v-model="asset.type"
          :items="TYPE_OPTIONS"
          label="Type"
          clearable
        />
      </VCol>

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
        <VTextField
          v-model="asset.location"
          label="Location"
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
      <!-- Make / Identity       -->
      <!-- ===================== -->
      <VCol cols="12">
        <h4 class="section-title">Make / Identity</h4>
        <VDivider class="my-3" />
      </VCol>

      <VCol cols="12" md="6"><VTextField v-model="asset.serial_number" label="Serial Number" clearable /></VCol>
      <VCol cols="12" md="6"><VTextField v-model="asset.plate_number"  label="Plate Number"  clearable /></VCol>
      <VCol cols="12" md="6"><VTextField v-model="asset.make"          label="Make"          clearable /></VCol>
      <VCol cols="12" md="6"><VTextField v-model="asset.model"         label="Model"         clearable /></VCol>
      <VCol cols="12" md="6"><VTextField v-model="asset.brand"         label="Brand"         clearable /></VCol>
      <VCol cols="12" md="6"><VTextField v-model="asset.model_number"  label="Model Number"  clearable /></VCol>

      <!-- ===================== -->
      <!-- Dates                 -->
      <!-- ===================== -->
      <VCol cols="12">
        <h4 class="section-title">Dates</h4>
        <VDivider class="my-3" />
      </VCol>

      <VCol cols="12" md="6"><VTextField v-model="asset.insurance_start_date" type="date" label="Insurance Start Date" /></VCol>
      <VCol cols="12" md="6"><VTextField v-model="asset.insurance_end_date"   type="date" label="Insurance End Date"   /></VCol>

      <VCol cols="12" md="6"><VTextField v-model="asset.warranty_start_date"  type="date" label="Warranty Start Date"  /></VCol>
      <VCol cols="12" md="6"><VTextField v-model="asset.warranty_end_date"    type="date" label="Warranty End Date"    /></VCol>

      <VCol cols="12" md="6"><VTextField v-model="asset.extended_warranty"    type="date" label="Extended Warranty Date" /></VCol>
      <VCol cols="12" md="6"><VTextField v-model="asset.purchase_date"        type="date" label="Purchase Date" /></VCol>
      <VCol cols="12" md="6"><VTextField v-model="asset.production_date"      type="date" label="Production Date" clearable /></VCol>

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
      <!-- Price / Financials    -->
      <!-- ===================== -->
      <VCol cols="12">
        <h4 class="section-title">Price / Financials</h4>
        <VDivider class="my-3" />
      </VCol>

      <!-- Note: depreciation_rate UI only; not sent if API doesn't accept -->
      <VCol cols="12" md="4">
        <VTextField v-model="asset.depreciation_rate" type="number" label="Depreciation Rate (%)" :rules="[percentOptionalValidator]" clearable />
      </VCol>

      <VCol cols="12" md="4"><VTextField v-model="asset.price"            type="number" label="Price"             :rules="[numberOptionalValidator]" clearable /></VCol>
      <VCol cols="12" md="4"><VTextField v-model="asset.useful_life"      type="number" label="Useful Life"       :rules="[numberOptionalValidator]" clearable /></VCol>
      <VCol cols="12" md="4"><VTextField v-model="asset.replacement_cost" type="number" label="Replacement Cost"  :rules="[numberOptionalValidator]" clearable /></VCol>
      <VCol cols="12" md="4"><VTextField v-model="asset.purchase_cost"    type="number" label="Purchase Cost"     :rules="[numberOptionalValidator]" clearable /></VCol>
      <!-- Book Value maps to API: book_value -->
      <VCol cols="12" md="4"><VTextField v-model="asset.nbv"              type="number" label="NBV / Book Value"  :rules="[numberOptionalValidator]" clearable /></VCol>

      <!-- Actions -->
      <VCol cols="12" class="d-flex gap-2">
        <VBtn type="submit" color="primary" :loading="loading" :disabled="loading">Update</VBtn>
        <VBtn variant="tonal" @click="goBack" :disabled="loading">Cancel</VBtn>
      </VCol>
    </VRow>

    <div v-if="message" class="mt-4">{{ message }}</div>
  </VForm>
</template>

<script setup>
import axios from 'axios'
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { VBtn, VCol, VDivider, VForm, VRow, VSelect, VTextField, VTextarea } from 'vuetify/components'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const route = useRoute()
const router = useRouter()
const id = route.params.id // /dashboards/assets/edit/:id

/* ---------------- Options ---------------- */
const TYPE_OPTIONS = ['Vehicle', 'IT Equipment', 'Machinery', 'Furniture', 'Other']
const ASSET_TYPE_OPTIONS = ['Owned', 'Rental', 'Leased', 'Used', 'New']

/* ---------------- State ---------------- */
const asset = ref({
  asset_investment_requests_id: null, // REQUIRED
  code: '',
  name: '',
  asset_category_id: null,
  asset_sub_category_id: null,
  description: '',

  // Identity / make
  serial_number: '',
  plate_number: '',
  make: '',
  model: '',
  brand: '',
  model_number: '',

  // dates
  insurance_start_date: '',
  insurance_end_date: '',
  warranty_start_date: '',
  warranty_end_date: '',
  extended_warranty: '',   // API key
  purchase_date: '',
  production_date: '',

  // misc
  is_related_to_it: null,  // 'yes' | 'no' (UI) -> boolean in payload
  location: '',
  type: '',
  asset_type: '',

  // financials
  depreciation_rate: '',
  price: '',
  useful_life: '',
  replacement_cost: '',
  purchase_cost: '',
  nbv: '',                 // maps to API: book_value
})

const yesNoOptions = [
  { title: 'Yes', value: 'yes' },
  { title: 'No',  value: 'no'  },
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
  (value === '' || value === null || value === undefined) ? true : (!isNaN(Number(value)) || 'Enter a valid number')
const percentOptionalValidator = value => {
  if (value === '' || value === null || value === undefined) return true
  const n = Number(value)
  if (isNaN(n)) return 'Enter a valid number'
  if (n < 0 || n > 100) return 'Enter a value between 0 and 100'
  return true
}

/* ---------------- Utils ---------------- */
const getCookie = name => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
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

/* Load existing asset */
const loadRecord = async () => {
  try {
    loading.value = true
    const token = getCookie('accessToken')
    if (!token) throw new Error('Access token is missing. Please log in.')
    const decodedToken = decodeURIComponent(token)

    const res = await axios.get(`${apiBaseUrl}/assets/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${decodedToken}`, Accept: 'application/json' },
    })

    const p = res.data?.data ?? res.data

    // map backend -> UI fields (with sensible fallbacks)
    asset.value = {
      asset_investment_requests_id: p.asset_investment_requests_id ?? p.asset_investment_request_id ?? null,
      code: p.code ?? '',
      name: p.name ?? '',

      asset_category_id: p.asset_category_id ?? p.category_id ?? null,
      asset_sub_category_id: p.asset_sub_category_id ?? p.sub_category_id ?? null,

      description: p.description ?? '',

      serial_number: p.serial_number ?? '',
      plate_number:  p.plate_number  ?? '',
      make:          p.make          ?? '',
      model:         p.model         ?? '',
      brand:         p.brand         ?? '',
      model_number:  p.model_number  ?? '',

      insurance_start_date: p.insurance_start_date ?? '',
      insurance_end_date:   p.insurance_end_date   ?? '',
      warranty_start_date:  p.warranty_start_date  ?? '',
      warranty_end_date:    p.warranty_end_date    ?? '',
      extended_warranty:    p.extended_warranty    ?? (p.extended_warranty_date ?? ''), // legacy fallback
      purchase_date:        p.purchase_date        ?? '',
      production_date:      p.production_date      ?? '',

      // boolean -> 'yes'/'no'
      is_related_to_it: (p.is_related_to_it === true) ? 'yes' : (p.is_related_to_it === false) ? 'no' : null,

      location:   p.location   ?? '',
      type:       p.type       ?? '',
      asset_type: p.asset_type ?? '',

      depreciation_rate: p.depreciation_rate ?? '',
      price:            p.price            ?? '',
      useful_life:      p.useful_life      ?? '',
      replacement_cost: p.replacement_cost ?? '',
      purchase_cost:    p.purchase_cost    ?? '',
      nbv:              (p.book_value ?? p.nbv ?? ''), // show in UI
    }

    // ensure subcategories list for current category
    if (asset.value.asset_category_id) {
      await fetchSubCategories(asset.value.asset_category_id)
    }
  } catch (error) {
    console.error('Error loading asset:', error?.response?.data || error)
    message.value = 'Failed to load asset.'
  } finally {
    loading.value = false
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

/* Actions */
const goBack = () => router.push('/dashboards/assets')

/* Submit (PUT) */
const submitForm = async () => {
  try {
    loading.value = true
    errorMessages.value = {}

    const { valid } = (await refForm.value?.validate?.()) ?? { valid: true }
    if (!valid) {
      message.value = 'Please fix the highlighted errors.'
      loading.value = false
      return
    }

    const token = getCookie('accessToken')
    if (!token) throw new Error('Access token is missing. Please log in.')
    const decodedToken = decodeURIComponent(token)

    // UI 'yes'/'no' -> boolean
    const itBool = asset.value.is_related_to_it === 'yes' ? true
                 : asset.value.is_related_to_it === 'no'  ? false
                 : null

    const payload = {
      asset_category_id: Number(asset.value.asset_category_id),
      asset_sub_category_id: Number(asset.value.asset_sub_category_id),
      asset_investment_requests_id: Number(asset.value.asset_investment_requests_id),

      // optional enums/text
      type: asset.value.type || null,
      asset_type: asset.value.asset_type || null,

      // required in UI
      code: asset.value.code,
      description: asset.value.description,

      // identity
      serial_number: asset.value.serial_number || null,
      plate_number:  asset.value.plate_number  || null,
      model_number:  asset.value.model_number  || null,
      make: asset.value.make || null,
      model: asset.value.model || null,
      brand: asset.value.brand || null,

      // dates
      insurance_start_date: asset.value.insurance_start_date || null,
      insurance_end_date:   asset.value.insurance_end_date   || null,
      warranty_start_date:  asset.value.warranty_start_date  || null,
      warranty_end_date:    asset.value.warranty_end_date    || null,
      extended_warranty:    asset.value.extended_warranty    || null,
      purchase_date:        asset.value.purchase_date        || null,
      production_date:      asset.value.production_date      || null,

      // boolean
      is_related_to_it: itBool,

      // misc
      location: asset.value.location || null,

      // numbers
      price:            asset.value.price            === '' ? null : Number(asset.value.price),
      replacement_cost: asset.value.replacement_cost === '' ? null : Number(asset.value.replacement_cost),
      purchase_cost:    asset.value.purchase_cost    === '' ? null : Number(asset.value.purchase_cost),
      book_value:       asset.value.nbv              === '' ? null : Number(asset.value.nbv),
      useful_life:      asset.value.useful_life      === '' ? null : Number(asset.value.useful_life),

      // NOTE: name & depreciation_rate intentionally omitted unless backend supports them.
      // If your API accepts 'name', you can include: name: asset.value.name,
      // If API accepts 'depreciation_rate', include:
      // depreciation_rate: asset.value.depreciation_rate === '' ? null : Number(asset.value.depreciation_rate),
    }

    await axios.put(`${apiBaseUrl}/assets/${encodeURIComponent(id)}`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${decodedToken}`,
        Accept: 'application/json',
      },
    })

    // alert('Asset updated successfully!')
    goBack()
  } catch (error) {
    console.error('Error updating asset:', error?.response?.data || error)
    if (error.response?.status === 422 && error.response?.data?.errors) {
      errorMessages.value = error.response.data.errors
      message.value = 'Please fix the highlighted errors.'
    } else {
      message.value = error.response?.data?.message || 'Failed to update asset.'
      alert(message.value)
    }
  } finally {
    loading.value = false
  }
}

/* Lifecycle */
onMounted(async () => {
  await fetchCategories()
  await fetchInvestmentRequests()
  await loadRecord()
})
</script>

<style>
.mb-4 { margin-block-end: 16px; }
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.section-title { font-weight: 600; }
.my-3 { margin-block: 12px; margin-inline: 0; }
.gap-2 { gap: 8px; }
</style>
