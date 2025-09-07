<template>
  <div class="d-flex justify-between align-center mb-4">
    <h3>Edit Asset Investment Request</h3>
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

      <!-- ===== Category / Subcategory / Asset (asset optional) ===== -->

      <!-- Asset Category -->
      <VCol cols="12" md="4">
        <VSelect
          v-model="selectedCategoryId"
          :items="parentCategoryItems"
          item-title="title"
          item-value="id"
          label="Select Asset Category"
          :loading="loading.categories || loading.form"
          :disabled="loading.categories || loading.form"
          @update:modelValue="onCategoryChange"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.asset_category_id"
          hide-details="auto"
          variant="outlined"
          density="compact"
          clearable
        />
        <small class="text-medium-emphasis">Category select karen → subcategories load hongi</small>
      </VCol>

      <!-- Asset Subcategory -->
      <VCol cols="12" md="4">
        <VSelect
          v-model="selectedSubCategoryId"
          :items="subcategoryItemsForCategory"
          item-title="title"
          item-value="id"
          label="Select Sub Asset Category"
          :disabled="!selectedCategoryId || loading.form"
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
          :loading="loading.assets || loading.form"
          :disabled="!selectedSubCategoryId || loading.assets || loading.form"
          return-object
          hide-details="auto"
          variant="outlined"
          density="compact"
          clearable
        />
        <small class="text-medium-emphasis">Asset optional hai — bina asset ke bhi update ho jayega.</small>
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

      <!-- Actions -->
      <VCol cols="12" class="d-flex gap-2">
        <VBtn type="submit" color="primary" :loading="loading.submit" :disabled="loading.submit || !isFormValid">
          Update
        </VBtn>
        <VBtn variant="tonal" @click="goBack" :disabled="loading.submit">Cancel</VBtn>
      </VCol>
    </VRow>

    <div v-if="message" class="mt-4">{{ message }}</div>
  </VForm>
</template>

<script setup>
import axios from 'axios'
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { VBtn, VCol, VForm, VRow, VSelect, VTextField, VTextarea } from 'vuetify/components'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const router = useRouter()
const route = useRoute()

const id = route.params.id // /asset-investment-requests/edit/:id
const REQUEST_TYPE_OPTIONS = ['NEW', 'LEASED', 'USED']

// ----- form -----
const form = ref({
  project_id: null,
  date: '',
  description: '',
  planned_cost: '',
  request_type: 'NEW',
  quantity: 1,
  reason: '',
})

// categories/assets state
const allCategories = ref([])
const selectedCategoryId = ref(null)
const selectedSubCategoryId = ref(null)
const selectedAsset = ref(null) // object or null
const assets = ref([])

// ui state
const projects = ref([])
const refForm = ref()
const isFormValid = ref(false)
const loading = ref({ categories: false, assets: false, form: false, submit: false })
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

const goBack = () => router.push('/dashboards/asset-investment-requests')

/* -------- Projects -------- */
const fetchProjects = async () => {
  try {
    const res = await axios.get(`${apiBaseUrl}/projects`, { headers: authHeaders() })
    projects.value = Array.isArray(res.data) ? res.data : (res.data?.data ?? [])
  } catch (e) {
    console.error('Error fetching projects:', e)
  }
}

/* -------- Categories (pagination like budgets/create) -------- */
const fetchAssetCategories = async () => {
  loading.value.categories = true
  try {
    let page = 1, perPage = 15, total = Infinity
    const acc = []
    while ((page - 1) * perPage < total) {
      const res = await axios.get(`${apiBaseUrl}/asset-categories`, {
        params: { page },
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      })
      const data = res.data || {}
      const chunk = Array.isArray(data.categories) ? data.categories
                  : Array.isArray(data.data) ? data.data
                  : Array.isArray(data) ? data : []
      acc.push(...chunk)
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

// parent items
const parentCategoryItems = computed(() =>
  allCategories.value
    .filter(c => c.is_parent)
    .map(c => ({ id: Number(c.id), title: String(c.title ?? c.slug ?? `Category #${c.id}`) }))
)

// subcategory items
const subcategoryItemsForCategory = computed(() => {
  if (!selectedCategoryId.value) return []
  return allCategories.value
    .filter(c => !c.is_parent && Number(c.parent_id) === Number(selectedCategoryId.value))
    .map(c => ({ id: Number(c.id), title: String(c.title ?? c.slug ?? `Subcategory #${c.id}`) }))
})

/* -------- Assets by subcategory -------- */
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
      params: { asset_sub_category_id: subId, asset_subcategory_id: subId },
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

/* -------- Load existing record -------- */
const loadRecord = async () => {
  loading.value.form = true
  try {
    const res = await axios.get(`${apiBaseUrl}/asset-investment-requests/${id}`, {
      headers: authHeaders(),
    })
    const p = res.data?.data ?? res.data

    // Prefill main form
    form.value = {
      project_id: p.project_id ?? p.project?.id ?? null,
      date: p.date ?? '',
      description: p.description ?? '',
      planned_cost: p.planned_cost !== undefined && p.planned_cost !== null
        ? String(p.planned_cost).replace(/\.00$/, '')
        : '',
      request_type: p.request_type ?? 'NEW',
      quantity: p.quantity !== undefined && p.quantity !== null ? Number(p.quantity) : 1,
      reason: p.reason ?? '',
    }

    // Prefill category / subcategory / asset (asset optional)
    selectedCategoryId.value    = Number(p.asset_category_id ?? p.category?.id) || null
    selectedSubCategoryId.value = Number(p.asset_sub_category_id ?? p.asset_subcategory_id ?? p.subcategory?.id) || null

    if (selectedSubCategoryId.value) {
      await fetchAssetsBySubCategory(selectedSubCategoryId.value)
      const assetId = Number(p.asset_id ?? p.asset?.id)
      selectedAsset.value = assets.value.find(a => Number(a.id) === assetId)
        || (assetId ? { id: assetId, code: p.asset?.code ?? `#${assetId}` } : null)
    }
  } catch (e) {
    console.error('Error loading record:', e?.response?.data || e)
    message.value = 'Failed to load record.'
  } finally {
    loading.value.form = false
  }
}

/* -------- init -------- */
onMounted(async () => {
  await Promise.all([fetchProjects(), fetchAssetCategories()])
  await loadRecord()
})

/* -------- helpers -------- */
const scrollToFirstError = () => {
  nextTick(() => {
    const el = document.querySelector('[aria-invalid="true"]')
    if (el?.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

/* -------- submit -------- */
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

    // manual checks: category & subcategory required; asset optional
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

    // Prefer PUT; fallback to PATCH on 405
    try {
      await axios.put(`${apiBaseUrl}/asset-investment-requests/${id}`, payload, { headers })
    } catch (err) {
      if (err?.response?.status === 405) {
        await axios.patch(`${apiBaseUrl}/asset-investment-requests/${id}`, payload, { headers })
      } else {
        throw err
      }
    }

    router.push('/dashboards/asset-investment-requests')
  } catch (error) {
    console.error('Error updating record:', error?.response?.data || error)
    if (error.response?.status === 422 && error.response?.data?.errors) {
      errorMessages.value = error.response.data.errors
      message.value = 'Please fix the highlighted errors.'
      scrollToFirstError()
    } else {
      message.value = error.response?.data?.message || 'Failed to update request.'
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
.gap-2 { gap: 8px; }
.text-medium-emphasis { opacity: 0.7; }
</style>
