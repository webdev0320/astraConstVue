<template>
    <div class="d-flex justify-between align-center mb-4">
      <h3>Create Asset</h3>
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

      <!-- 2) Name -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="asset.name"
          label="Name"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.name"
          clearable
        />
      </VCol>

      <!-- 3) Category (top-level under Fixed Assets) -->
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

      <!-- 4) Sub Category (depends on category) -->
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
          :rules="[requiredValidator]"
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

      <!-- 11) Extended Warranty -->
      <VCol cols="12" md="6" class="d-flex align-center">
        <VSwitch v-model="asset.extended_warranty" inset label="Extended Warranty" />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField
          v-model="asset.extended_warranty"
          label="ExtendedWarranty Date"
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
          Submit
        </VBtn>
      </VCol>
    </VRow>

    <div v-if="message" class="mt-4">{{ message }}</div>
  </VForm>
</template>

<script setup>
import axios from 'axios'
import { ref, watch, onMounted } from 'vue'
import { VBtn, VCol, VForm, VRow, VSwitch, VTextField, VTextarea, VSelect } from 'vuetify/components'

/** Base URL from env with fallback */
const apiBaseUrl =
  'https://dm.kreashionsoftwarehouse.com/astraConst/public/api'

console.info('API base:', apiBaseUrl)

/* ---------------- State ---------------- */
const asset = ref({
  code: '',
  name: '',
  asset_category_id: null,       // selected parent category id (top-level under Fixed Assets)
  asset_sub_category_id: null,   // selected child id
  description: '',
  serial_number: '',
  plate_number: '',
  make: '',
  insurance_start_date: '',
  warranty_start_date: '',
  extended_warranty: '',
  purchase_date: '',
  is_related_to_it: null,
})

const yesNoOptions = [
  { title: 'Yes', value: 'yes' },
  { title: 'No',  value: 'no'  },
]


const categories = ref([])     // [{id, name, slug}]
const subCategories = ref([])  // [{id, name, slug}]

const loading = ref(false)
const loadingCategories = ref(false)
const loadingSubCategories = ref(false)

const refForm = ref()
const message = ref('')
const errorMessages = ref({})

/* ---------------- Utils ---------------- */
const requiredValidator = value => !!value || 'This field is required'

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
      // only send page; do NOT send perPage
      params: { page },
      headers: { ...authHeader() },
    })

    const list = Array.isArray(res.data?.categories) ? res.data.categories : []
    all = all.concat(list)

    // use server-provided totals
    total = Number(res.data?.total_records ?? all.length)
    perPageFromServer = Number(res.data?.perPage ?? perPageFromServer)
    page += 1

    // safety break if the API ever returns an empty page
    if (list.length === 0) break
  }

  return all
}

/**
 * Load top-level categories (under Fixed Assets)
 * Condition: is_parent === true AND parent_id === 1 AND status === true
 */
const fetchCategories = async () => {
  try {
    loadingCategories.value = true
    const raw = await fetchAllCategories()

    const parentsUnderFixedAssets = raw.filter(
      c => c && c.status === true && c.is_parent === true && Number(c.parent_id) === 1
    )

    categories.value = parentsUnderFixedAssets
      .map(c => ({
        id: c.id,
        slug: c.slug,
        name: c.title || slugToTitle(c.slug),
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  } catch (e) {
    console.error('Failed to load categories', e)
    categories.value = []
  } finally {
    loadingCategories.value = false
  }
}

/**
 * Sub-categories by **ID**
 * GET /api/asset-categories/:id
 * Response: { success, data: { ..., children: [...] } }
 */
const fetchSubCategories = async (parentId) => {
  if (!parentId) { 
    subCategories.value = []
    return
  }
  try {
    loadingSubCategories.value = true

    // ID direct pass karein; slug ki zaroorat nahi
    const res = await axios.get(`${apiBaseUrl}/asset-categories/${encodeURIComponent(parentId)}`, {
      headers: { ...authHeader() },
    })

    const children = res?.data?.data?.children || []

    subCategories.value = children
      .filter(ch => ch?.status !== false)
      .map(ch => ({
        id: ch.id,
        slug: ch.slug,                          // optional, future use
        name: ch.title || slugToTitle(ch.slug), // UI friendly label
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  } catch (e) {
    console.error('Failed to load sub categories', e)
    subCategories.value = []
  } finally {
    loadingSubCategories.value = false
  }
}

/* ---------------- Watchers ---------------- */
watch(
  () => asset.value.asset_category_id,
  async newVal => {
    asset.value.asset_sub_category_id = null
    await fetchSubCategories(newVal)
  }
)

/* ---------------- Submit ---------------- */
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

    const response = await axios.post(`${apiBaseUrl}/assets`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${decodedToken}`,
      },
    })

    message.value = response.data?.message || 'Asset created successfully!'

    // reset form
    Object.keys(asset.value).forEach(key => {
      asset.value[key] =
        typeof asset.value[key] === 'boolean'
          ? false
          : key.endsWith('_id')
            ? null
            : ''
    })
    subCategories.value = []
  } catch (error) {
    console.error('Error submitting form:', error)
    if (error.response?.data?.errors) {
      errorMessages.value = error.response.data.errors
      message.value = 'Please fix the highlighted errors.'
    } else {
      message.value = error.response?.data?.message || 'Failed to create asset.'
    }
  } finally {
    loading.value = false
  }
}

/* ---------------- Lifecycle ---------------- */
onMounted(() => {
  fetchCategories()
})
</script>
