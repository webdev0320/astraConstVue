<template>
  <div class="d-flex justify-between align-center mb-4">
    <h3>Create Asset Investment Request</h3>
  </div>

  <VForm ref="refForm" @submit.prevent="submitForm" v-model="isFormValid">
    <VRow>
      <!-- Project -->
      <VCol cols="12" md="4">
        <VSelect
          v-model="form.project_id"
          :items="projects"
          item-title="name"
          item-value="id"
          label="Select Project"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.project_id"
          clearable
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
        />
      </VCol>

      <!-- Planned Cost -->
      <VCol cols="12" md="4">
        <VTextField
          v-model="form.planned_cost"
          type="number"
          label="Planned Cost"
          :rules="[requiredValidator, numberValidator]"
          :error-messages="errorMessages.planned_cost"
          min="0"
          step="0.01"
          prefix="Rs"
          clearable
        />
      </VCol>

      <!-- Request Type -->
      <VCol cols="12" md="4">
        <VSelect
          v-model="form.request_type"
          :items="REQUEST_TYPE_OPTIONS"
          label="Request Type"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.request_type"
          clearable
        />
      </VCol>

      <!-- Quantity -->
      <VCol cols="12" md="4">
        <VTextField
          v-model="form.quantity"
          type="number"
          label="Quantity"
          :rules="[requiredValidator, integerPositiveValidator]"
          :error-messages="errorMessages.quantity"
          min="1"
          step="1"
          clearable
        />
      </VCol>

      <!-- ===== Category / Subcategory / Asset (optional) ===== -->

      <!-- Asset Category -->
      <VCol cols="12" md="4">
        <VSelect
          v-model="selectedCategoryId"
          :items="parentCategoryItems"
          item-title="title"
          item-value="id"
          label="Select Asset Category"
          :loading="loading.categories"
          :disabled="loading.categories"
          @update:modelValue="onCategoryChange"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.asset_category_id"
          hide-details="auto"
          variant="outlined"
          density="compact"
          clearable
        />
        <small class="text-medium-emphasis">Category choose karen → subcategories load hongi</small>
      </VCol>

      <!-- Asset Subcategory -->
      <VCol cols="12" md="4">
        <VSelect
          v-model="selectedSubCategoryId"
          :items="subcategoryItemsForCategory"
          item-title="title"
          item-value="id"
          label="Select Sub Asset Category"
          :disabled="!selectedCategoryId || loading.categories"
          @update:modelValue="onSubCategoryChange"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.asset_sub_category_id"
          hide-details="auto"
          variant="outlined"
          density="compact"
          clearable
        />
        <small class="text-medium-emphasis">Selected category ki related subcategories</small>
      </VCol>

      <!-- Asset (Optional) -->
      <VCol cols="12" md="4">
        <VSelect
          v-model="selectedAsset"
          :items="assets"
          item-title="code"
          item-value="id"
          label="Select Asset (Optional)"
          :loading="loading.assets"
          :disabled="!selectedSubCategoryId || loading.assets"
          return-object
          hide-details="auto"
          variant="outlined"
          density="compact"
          clearable
        />
        <small class="text-medium-emphasis">
          (Optional) Asset na select karne par bhi request ban jayegi.
        </small>
      </VCol>

      <!-- Description -->
      <VCol cols="12">
        <VTextarea
          v-model="form.description"
          label="Description"
          :rows="3"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.description"
        />
      </VCol>

      <!-- Reason -->
      <VCol cols="12">
        <VTextarea
          v-model="form.reason"
          label="Reason"
          :rows="3"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.reason"
        />
      </VCol>

      <!-- Submit -->
      <VCol cols="12">
        <VBtn
          type="submit"
          color="primary"
          :loading="loading.submit"
          :disabled="loading.submit || !isFormValid"
        >
          Submit
        </VBtn>
      </VCol>
    </VRow>

    <div v-if="message" class="mt-4">{{ message }}</div>
  </VForm>
</template>

<script setup>
import axios from 'axios'
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  VBtn, VCol, VForm, VRow,
  VSelect, VTextField, VTextarea,
} from 'vuetify/components'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const router = useRouter()

const REQUEST_TYPE_OPTIONS = ['NEW', 'LEASED', 'USED']
const today = new Date().toISOString().split('T')[0]

const form = ref({
  project_id: null,
  date: today,
  description: '',
  planned_cost: '',
  request_type: 'NEW',
  quantity: 1,
  reason: '',
})

// === categories / assets state ===
const allCategories = ref([])          // FULL list via pagination (same as budgets)
const selectedCategoryId = ref(null)
const selectedSubCategoryId = ref(null)
const selectedAsset = ref(null)        // object or null
const assets = ref([])

const projects = ref([])
const refForm = ref()
const isFormValid = ref(false)
const loading = ref({ categories: false, assets: false, submit: false })
const message = ref('')
const errorMessages = ref({})

// validators
const requiredValidator = v => (!!v || v === 0) || 'This field is required'
const numberValidator   = v => (v === '' || isNaN(Number(v))) ? 'Enter a valid number' : true
const integerPositiveValidator = v => {
  if (v === '' || v === null || v === undefined) return 'This field is required'
  const n = Number(v)
  if (!Number.isInteger(n) || n < 1) return 'Enter a whole number ≥ 1'
  return true
}

const getCookie = name => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

const authHeaders = () => {
  const access = getCookie('accessToken')
  if (!access) throw new Error('Access token is missing. Please log in.')
  return { Authorization: `Bearer ${decodeURIComponent(access)}`, Accept: 'application/json' }
}

/* -------- Projects -------- */
const fetchProjects = async () => {
  try {
    const res = await axios.get(`${apiBaseUrl}/projects`, { headers: authHeaders() })
    projects.value = Array.isArray(res.data) ? res.data : (res.data?.data ?? [])
  } catch (error) {
    console.error('Error fetching projects:', error)
  }
}

/* -------- Categories (pagination loop like budgets/create) -------- */
const fetchAssetCategories = async () => {
  loading.value.categories = true
  try {
    let page = 1
    let perPage = 15
    let total = Infinity
    const acc = []

    while ((page - 1) * perPage < total) {
      const res = await axios.get(`${apiBaseUrl}/asset-categories`, {
        params: { page },
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      })

      const data  = res.data || {}
      const chunk = Array.isArray(data.categories)
        ? data.categories
        : Array.isArray(data.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : []

      acc.push(...chunk)

      // update loop bounds from server response (defensive)
      total   = Number(data.total_records ?? total)
      perPage = Number(data.perPage ?? perPage)

      if (!chunk.length) break
      page += 1
    }

    allCategories.value = acc
  } catch (e) {
    console.error('Error fetching categories:', e)
    allCategories.value = []
  } finally {
    loading.value.categories = false
  }
}

/* -------- Parent/Subcategory computed (same as budgets) -------- */
const parentCategoryItems = computed(() =>
  allCategories.value
    .filter(c => c.is_parent)
    .map(c => ({ id: Number(c.id), title: String(c.title ?? c.slug ?? `Category #${c.id}`) }))
)

const subcategoryItemsForCategory = computed(() => {
  if (!selectedCategoryId.value) return []
  return allCategories.value
    .filter(c => !c.is_parent && Number(c.parent_id) === Number(selectedCategoryId.value))
    .map(c => ({ id: Number(c.id), title: String(c.title ?? c.slug ?? `Subcategory #${c.id}`) }))
})

/* -------- Asset list by subcategory -------- */
const onCategoryChange = () => {
  selectedSubCategoryId.value = null
  selectedAsset.value = null
  assets.value = []
}

const onSubCategoryChange = async (val) => {
  selectedAsset.value = null
  assets.value = []
  if (!val) return
  await fetchAssetsBySubCategory(val)
}

const fetchAssetsBySubCategory = async (subId) => {
  loading.value.assets = true
  try {
    const res = await axios.get(`${apiBaseUrl}/assets`, {
      params: { asset_sub_category_id: subId, asset_subcategory_id: subId }, // support both spellings
      headers: authHeaders(),
    })
    const list = res.data?.data?.data ?? res.data?.data ?? res.data ?? []
    assets.value = Array.isArray(list) ? list : []
  } catch (e) {
    console.error('Error fetching assets:', e)
    assets.value = []
  } finally {
    loading.value.assets = false
  }
}

onMounted(async () => {
  await Promise.all([fetchProjects(), fetchAssetCategories()])
})

/* -------- UX helpers -------- */
const scrollToFirstError = () => {
  nextTick(() => {
    const el = document.querySelector('[aria-invalid="true"]')
    if (el?.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

/* -------- Submit -------- */
const submitForm = async () => {
  loading.value.submit = true
  message.value = ''
  errorMessages.value = {}

  try {
    const { valid } = (await refForm.value?.validate?.()) ?? { valid: true }
    if (!valid) {
      loading.value.submit = false
      message.value = 'Please fix the highlighted errors.'
      scrollToFirstError()
      return
    }

    // manual required checks (asset optional)
    if (!selectedCategoryId.value) {
      errorMessages.value.asset_category_id = ['Asset category is required']
    }
    if (!selectedSubCategoryId.value) {
      errorMessages.value.asset_sub_category_id = ['Asset subcategory is required']
    }
    if (errorMessages.value.asset_category_id || errorMessages.value.asset_sub_category_id) {
      loading.value.submit = false
      message.value = 'Please fix the highlighted errors.'
      scrollToFirstError()
      return
    }

    const headers = { ...authHeaders(), 'Content-Type': 'application/json' }

    const payload = {
      project_id: form.value.project_id,
      date: form.value.date,
      asset_category_id: Number(selectedCategoryId.value),
      asset_sub_category_id: Number(selectedSubCategoryId.value),
      asset_subcategory_id: Number(selectedSubCategoryId.value), // compat
      asset_id: selectedAsset.value?.id ?? null, // OPTIONAL
      description: form.value.description,
      planned_cost: form.value.planned_cost === '' ? null : Number(form.value.planned_cost),
      request_type: form.value.request_type,
      quantity: form.value.quantity === '' ? null : Number(form.value.quantity),
      reason: form.value.reason,
    }

    await axios.post(`${apiBaseUrl}/asset-investment-requests`, payload, { headers })
    router.push('/dashboards/asset-investment-requests')
  } catch (error) {
    console.error('Error submitting form:', error?.response?.data || error)
    if (error.response?.status === 422 && error.response?.data?.errors) {
      errorMessages.value = error.response.data.errors
      message.value = 'Please fix the highlighted errors.'
      scrollToFirstError()
    } else {
      message.value = error.response?.data?.message || 'Failed to create request.'
    }
  } finally {
    loading.value.submit = false
  }
}
</script>

<style>
.mb-4 { margin-block-end: 16px; }
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.text-medium-emphasis { opacity: 0.7; }
</style>
