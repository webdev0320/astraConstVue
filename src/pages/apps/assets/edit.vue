<template>
    <div class="d-flex justify-between align-center mb-4">
      <h3>Edit Asset</h3>
    </div>
  <VForm ref="refForm" @submit.prevent="submitForm">
    <VRow>
      <!-- 1) Code -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="asset.code"
          label="Code"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.code"
          clearable
        />
      </VCol>

      <!-- 2) Name (optional if API supports) -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="asset.name"
          label="Name"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.name"
          clearable
        />
      </VCol>

      <!-- 3) Category -->
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

      <!-- 4) Sub Category -->
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

      <!-- 5) Description -->
      <VCol cols="12">
        <VTextarea
          v-model="asset.description"
          label="Description"
          :rows="3"
          :error-messages="errorMessages.description"
        />
      </VCol>

      <!-- 6) Serial Number -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="asset.serial_number"
          label="Serial Number"
          :error-messages="errorMessages.serial_number"
          clearable
        />
      </VCol>

      <!-- 7) Plate Number -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="asset.plate_number"
          label="Plate Number"
          :error-messages="errorMessages.plate_number"
          clearable
        />
      </VCol>

      <!-- 8) Make -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="asset.make"
          label="Make"
          :error-messages="errorMessages.make"
          clearable
        />
      </VCol>

      <!-- 9) Insurance Start Date -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="asset.insurance_start_date"
          label="Insurance Start Date"
          type="date"
          :error-messages="errorMessages.insurance_start_date"
        />
      </VCol>

      <!-- 10) Warranty Start Date -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="asset.warranty_start_date"
          label="Warranty Start Date"
          type="date"
          :error-messages="errorMessages.warranty_start_date"
        />
      </VCol>

      <!-- 11) Extended Warranty (API shows this as a DATE) -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="asset.extended_warranty"
          label="Extended Warranty (End Date)"
          type="date"
          :error-messages="errorMessages.extended_warranty"
        />
      </VCol>

      <!-- 12) Purchase Date -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="asset.purchase_date"
          label="Purchase Date"
          type="date"
          :error-messages="errorMessages.purchase_date"
        />
      </VCol>

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

      <VCol cols="12">
        <VBtn type="submit" color="primary" :loading="loading" :disabled="loading">
          Update
        </VBtn>
      </VCol>
    </VRow>

    <div v-if="message" class="mt-4">{{ message }}</div>
  </VForm>
</template>

<script setup>
import axios from 'axios'
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { VBtn, VCol, VForm, VRow, VTextField, VTextarea, VSelect } from 'vuetify/components'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const route = useRoute()
const router = useRouter()
const assetId = Number(route.params.id) // expects route like /dashboards/assets/edit/:id

/* ---------------- State ---------------- */
const asset = ref({
  code: '',
  name: '',
  asset_category_id: null,
  asset_sub_category_id: null,
  description: '',
  serial_number: '',
  plate_number: '',
  make: '',
  insurance_start_date: '',
  warranty_start_date: '',
  extended_warranty: '',   // your API uses date string (e.g., 2025-11-19)
  purchase_date: '',
  is_related_to_it: null,
})

const yesNoOptions = [
  { title: 'Yes', value: 'yes' },
  { title: 'No', value: 'no' },
]

const categories = ref([])     // [{id, name, slug}]
const subCategories = ref([])  // [{id, name, slug}]

const loading = ref(false)
const loadingCategories = ref(false)
const loadingSubCategories = ref(false)
const message = ref('')
const errorMessages = ref({})

/* ---------------- Utils ---------------- */
const requiredValidator = v => !!v || 'This field is required'
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

/* ---------------- Categories ---------------- */
const fetchAllCategories = async () => {
  let page = 1
  let all = []
  let total = Infinity
  let perPageFromServer = 15

  while ((page - 1) * perPageFromServer < total) {
    const res = await axios.get(`${apiBaseUrl}/asset-categories`, {
      params: { page },
      headers: { ...authHeader() },
    })
    const list = Array.isArray(res.data?.categories) ? res.data.categories : []
    all = all.concat(list)

    total = Number(res.data?.total_records ?? all.length)
    perPageFromServer = Number(res.data?.perPage ?? perPageFromServer)
    page += 1
    if (list.length === 0) break
  }
  return all
}

const fetchCategories = async () => {
  try {
    loadingCategories.value = true
    const raw = await fetchAllCategories()
    // Show direct children of Fixed Assets (id=1)
    const parentsUnderFixedAssets = raw.filter(
      c => c && c.status === true && c.is_parent === true && Number(c.parent_id) === 1
    )
    categories.value = parentsUnderFixedAssets
      .map(c => ({ id: c.id, slug: c.slug, name: c.title || slugToTitle(c.slug) }))
      .sort((a, b) => a.name.localeCompare(b.name))
  } catch (e) {
    console.error('Failed to load categories', e)
    categories.value = []
  } finally {
    loadingCategories.value = false
  }
}

const fetchSubCategories = async parentId => {
  if (!parentId) { subCategories.value = []; return }
  try {
    loadingSubCategories.value = true
    const res = await axios.get(`${apiBaseUrl}/asset-categories/${encodeURIComponent(parentId)}`, {
      headers: { ...authHeader() },
    })
    const children = res?.data?.data?.children || []
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

/* ---------------- Load existing asset ---------------- */
const loadAsset = async id => {
  const res = await axios.get(`${apiBaseUrl}/assets/${id}`, {
    headers: { ...authHeader() },
  })
  // Handle common shapes: {success, data:{...}} or {data:{data:{...}}} or plain object
  const a = res?.data?.data?.data || res?.data?.data || res?.data?.asset || res?.data

  // Fill basic fields
  asset.value.code = a.code ?? ''
  asset.value.name = a.name ?? ''
  asset.value.description = a.description ?? ''
  asset.value.serial_number = a.serial_number ?? ''
  asset.value.plate_number = a.plate_number ?? ''
  asset.value.make = a.make ?? ''
  asset.value.insurance_start_date = a.insurance_start_date ?? ''
  asset.value.warranty_start_date = a.warranty_start_date ?? ''
  asset.value.extended_warranty = a.extended_warranty ?? '' // API shows a date string
  asset.value.purchase_date = a.purchase_date ?? ''

  // Preselect category & sub-category
  asset.value.asset_category_id = a.asset_category_id ?? null
  await fetchSubCategories(asset.value.asset_category_id) // populate sub-cats before setting child
  asset.value.asset_sub_category_id = a.asset_sub_category_id ?? null
}

/* ---------------- Watchers ---------------- */
watch(
  () => asset.value.asset_category_id,
  async newVal => {
    // When user changes the parent, reset child and reload options
    asset.value.asset_sub_category_id = null
    await fetchSubCategories(newVal)
  }
)

/* ---------------- Submit (UPDATE) ---------------- */
const submitForm = async () => {
  try {
    loading.value = true
    errorMessages.value = {}

    const token = getCookie('accessToken')
    if (!token) throw new Error('Access token is missing. Please log in.')
    const decodedToken = decodeURIComponent(token)

    const payload = {
      code: asset.value.code,
      name: asset.value.name,
      asset_category_id: asset.value.asset_category_id,
      asset_sub_category_id: asset.value.asset_sub_category_id,
      description: asset.value.description,
      serial_number: asset.value.serial_number,
      plate_number: asset.value.plate_number,
      make: asset.value.make,
      insurance_start_date: asset.value.insurance_start_date,
      warranty_start_date: asset.value.warranty_start_date,
      extended_warranty: asset.value.extended_warranty,
      purchase_date: asset.value.purchase_date,
      is_related_to_it: asset.value.is_related_to_it,

    }

    await axios.put(`${apiBaseUrl}/assets/${assetId}`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${decodedToken}`,
      },
    })

    message.value = 'Asset updated successfully.'
    router.push('/dashboards/assets')
  } catch (error) {
    console.error('Error updating asset:', error)
    if (error.response?.data?.errors) {
      errorMessages.value = error.response.data.errors
      message.value = 'Please fix the highlighted errors.'
    } else {
      message.value = error.response?.data?.message || 'Failed to update asset.'
    }
  } finally {
    loading.value = false
  }
}

/* ---------------- Init ---------------- */
onMounted(async () => {
  await fetchCategories()        // load parent list first
  await loadAsset(assetId)       // then load asset and its sub-cats
})
</script>
