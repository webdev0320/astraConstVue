<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <VBtn variant="text" @click="goBack">← Back</VBtn>
      <h3>Edit Asset Investment Request</h3>
    </div>

    <VCard class="pa-4">
      <VForm @submit.prevent="saveAll" ref="refForm">
        <VRow dense>
          <!-- Project -->
          <VCol cols="12" md="3">
            <VSelect
              v-model="selectedProjectId"
              :items="projects"
              item-title="name"
              item-value="id"
              label="Select Project"
              :error-messages="topErrors.project_id"
              :loading="loading.form"
              :disabled="loading.form"
              variant="outlined" density="compact" hide-details="auto" clearable
            />
          </VCol>

          <!-- Date -->
          <VCol cols="12" md="3">
            <VTextField
              v-model="date"
              type="date"
              label="Date"
              :error-messages="topErrors.date"
              :loading="loading.form"
              :disabled="loading.form"
              variant="outlined" density="compact" hide-details="auto"
            />
          </VCol>

          <!-- Category -->
          <VCol cols="12" md="3" class="py-5">
            <VSelect
              v-model="selectedCategoryId"
              :items="parentCategoryItems"
              item-title="title" item-value="id"
              label="Select Asset Category"
              :loading="loading.categories || loading.form"
              :disabled="loading.categories || loading.form"
              @update:modelValue="onCategoryChange"
              variant="outlined" density="compact" hide-details="auto" clearable
            />
          </VCol>

          <!-- Subcategory -->
          <VCol cols="12" md="3" class="py-5">
            <VSelect
              v-model="selectedSubCategoryId"
              :items="subcategoryItemsForCategory"
              item-title="title" item-value="id"
              label="Select Sub Asset Category"
              :disabled="!selectedCategoryId || loading.form"
              @update:modelValue="onSubCategoryChange"
              variant="outlined" density="compact" hide-details="auto" clearable
            />
          </VCol>

          <!-- Asset (optional) -->
          <VCol cols="12" md="3" class="py-5">
            <VSelect
              v-model="selectedAsset"
              :items="assets"
              item-title="code" item-value="id"
              label="Select Asset (Optional)"
              :loading="loading.assets || loading.form"
              :disabled="!selectedSubCategoryId || loading.assets || loading.form"
              return-object
              variant="outlined" density="compact" hide-details="auto" clearable
            />
          </VCol>

          <!-- Request Type -->
          <VCol cols="12" md="2" class="py-5">
            <VSelect
              v-model="line.request_type"
              :items="REQUEST_TYPE_OPTIONS"
              label="Request Type"
              variant="outlined" density="compact" hide-details="auto" clearable
            />
          </VCol>

          <!-- Qty -->
          <VCol cols="12" md="1">
            <VTextField v-model.number="line.quantity" label="Qty" type="number"
              min="1" step="1" variant="outlined" density="compact" hide-details="auto" />
          </VCol>

          <!-- Planned Cost -->
          <VCol cols="12" md="2">
            <VTextField v-model.number="line.planned_cost" label="Planned Cost" type="number"
              min="0" step="0.01" prefix="Rs"
              variant="outlined" density="compact" hide-details="auto" />
          </VCol>

          <!-- Description -->
          <VCol cols="12" md="4">
            <VTextField v-model="line.description" label="Description"
              variant="outlined" density="compact" hide-details="auto" clearable />
          </VCol>

          <!-- Reason -->
          <VCol cols="12" md="4">
            <VTextField v-model="line.reason" label="Reason"
              variant="outlined" density="compact" hide-details="auto" clearable />
          </VCol>

          <!-- Add -->
          <VCol cols="12" md="3" class="d-flex align-end">
            <VBtn color="primary" @click="addRecord" :disabled="!canAddLine || loading.form">Add</VBtn>
          </VCol>

          <!-- Summary -->
          <VCol cols="12" md="5" class="d-flex align-end justify-end">
            <div class="text-end">
              <div class="text-medium-emphasis">Records: <b>{{ records.length }}</b></div>
              <div class="text-medium-emphasis">Planned Total: <b>{{ formatAmount(plannedTotal) }}</b></div>
            </div>
          </VCol>
        </VRow>

        <!-- Chips -->
        <div v-if="records.length" class="mt-4">
          <VChip v-for="(r, idx) in records" :key="idx" class="ma-1" closable @click:close="removeRecord(r)">
            {{ r.asset_code }} — {{ r.request_type }} — Qty: {{ r.quantity }} — {{ formatAmount(r.planned_cost) }}
            <template v-if="r.description"> — {{ r.description }}</template>
          </VChip>
        </div>

        <!-- Table -->
        <VDataTable
          v-if="records.length"
          :headers="headers"
          :items="records"
          :items-per-page="5"
          class="mt-4"
        >
          <template #item.planned_cost="{ item }">
            {{ formatAmount(item.planned_cost) }}
          </template>
          <template #item.line_total="{ item }">
            {{ formatAmount(item.quantity * item.planned_cost) }}
          </template>
          <template #item.actions="{ item }">
            <VBtn color="error" size="small" @click="removeRecord(item)">Delete</VBtn>
          </template>
        </VDataTable>

        <!-- Save / Cancel -->
        <div class="d-flex gap-2 mt-4">
          <VBtn color="primary" @click="saveAll" :loading="loading.submit" :disabled="!canSave">Update Request</VBtn>
          <VBtn variant="tonal" @click="goBack" :disabled="loading.submit">Cancel</VBtn>
        </div>

        <div v-if="message" class="mt-4">{{ message }}</div>
      </VForm>
    </VCard>
  </div>
</template>

<script setup>
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// Using Vuetify global registration like in your other files

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const route = useRoute()
const router = useRouter()

const id = route.params.id
const REQUEST_TYPE_OPTIONS = ['NEW', 'LEASED', 'USED']
const today = new Date().toISOString().split('T')[0]

/* -------- state -------- */
const projects = ref([])
const selectedProjectId = ref(null)
const date = ref(today)

const allCategories = ref([])
const loading = ref({ categories: false, assets: false, form: false, submit: false })
const assets = ref([])
const selectedCategoryId = ref(null)
const selectedSubCategoryId = ref(null)
const selectedAsset = ref(null)

const line = ref({
  planned_cost: null,
  quantity: 1,
  request_type: 'NEW',
  description: '',
  reason: '',
})

const records = ref([])

const topErrors = ref({})
const rowErrors = ref([]) // (optional) if you want to surface per-row server errors
const message = ref('')

/* -------- headers (table) -------- */
const headers = [
  { title: 'Asset Code', key: 'asset_code' },
  { title: 'Category', key: 'category_name' },
  { title: 'Subcategory', key: 'subcategory_name' },
  { title: 'Type', key: 'request_type' },
  { title: 'Description', key: 'description' },
  { title: 'Reason', key: 'reason' },
  { title: 'Qty', key: 'quantity' },
  { title: 'Planned Cost', key: 'planned_cost' },
  { title: 'Line Total', key: 'line_total' },
  { title: 'Actions', key: 'actions', sortable: false },
]

/* -------- auth helpers -------- */
const getCookie = (name) => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}
const getAuthHeaders = () => {
  const access = getCookie('accessToken')
  if (!access) throw new Error('Access token is missing. Please log in.')
  return { Authorization: `Bearer ${decodeURIComponent(access)}`, Accept: 'application/json', 'Content-Type': 'application/json' }
}

/* -------- lookups -------- */
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

const categoryNameById = (id) => {
  const c = allCategories.value.find(x => Number(x.id) === Number(id))
  return c?.title ?? c?.slug ?? `Category #${id}`
}
const subcategoryNameById = (id) => {
  const c = allCategories.value.find(x => Number(x.id) === Number(id))
  return c?.title ?? c?.slug ?? `Subcategory #${id}`
}

/* -------- events -------- */
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

/* -------- api: fetches -------- */
const fetchProjects = async () => {
  try {
    const res = await axios.get(`${apiBaseUrl}/projects`, { headers: getAuthHeaders() })
    projects.value = Array.isArray(res.data) ? res.data : (res.data?.data ?? [])
  } catch (e) {
    console.error('Error fetching projects:', e)
  }
}

const fetchAssetCategories = async () => {
  loading.value.categories = true
  try {
    let page = 1, perPage = 15, total = Infinity
    const acc = []
    while ((page - 1) * perPage < total) {
      const res = await axios.get(`${apiBaseUrl}/asset-categories`, {
        params: { page },
        headers: getAuthHeaders(),
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

const fetchAssetsBySubCategory = async (subId) => {
  loading.value.assets = true
  try {
    const res = await axios.get(`${apiBaseUrl}/assets`, {
      params: { asset_sub_category_id: subId, asset_subcategory_id: subId },
      headers: getAuthHeaders(),
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

/* -------- load existing master + lines -------- */
const loadRecord = async () => {
  loading.value.form = true
  try {
    const res = await axios.get(`${apiBaseUrl}/asset-investment-requests/${id}`, { headers: getAuthHeaders() })
    const p = res.data?.data ?? res.data ?? {}

    // top-level
    selectedProjectId.value = Number(p.project_id ?? p.project?.id ?? route.params.projectId ?? route.query.projectId) || null
    date.value = p.date ?? date.value

    // lines array (accept several keys to be safe)
    const rawLines =
      Array.isArray(p.data)  ? p.data  :
      Array.isArray(p.lines) ? p.lines :
      Array.isArray(p.items) ? p.items : []

    // map to UI records
    records.value = rawLines.map((r) => {
      const catId  = Number(r.asset_category_id ?? r.category_id ?? r.category?.id)
      const subId  = Number(r.asset_sub_category_id ?? r.asset_subcategory_id ?? r.subcategory_id ?? r.subcategory?.id)
      const assetId = Number(r.asset_id ?? r.asset?.id)

      return {
        __key: [catId, subId, assetId || 'none', (r.request_type || 'NEW'), (r.description || '').toLowerCase(), (r.reason || '').toLowerCase()].join('|'),
        asset_category_id: catId,
        asset_sub_category_id: subId,
        asset_id: assetId || null,
        description: r.description ?? null,
        planned_cost: Number(r.planned_cost ?? r.cost ?? 0),
        request_type: r.request_type || 'NEW',
        quantity: Number(r.quantity ?? 1),
        reason: r.reason ?? null,

        asset_code: r.asset?.code ?? '—',
        category_name: categoryNameById(catId),
        subcategory_name: subcategoryNameById(subId),
      }
    })
  } catch (e) {
    console.error('Error loading record:', e?.response?.data || e)
    message.value = e?.response?.data?.message || 'Failed to load record.'
  } finally {
    loading.value.form = false
  }
}

/* -------- add/remove/clear -------- */
const canAddLine = computed(() =>
  !!(
    selectedCategoryId.value &&
    selectedSubCategoryId.value &&
    Number(line.value.quantity || 1) > 0 &&
    Number(line.value.planned_cost) > 0 &&
    (line.value.request_type?.length > 0)
  )
)

const addRecord = () => {
  if (!canAddLine.value) return
  const a    = selectedAsset.value || null
  const qty  = Number(line.value.quantity || 1)
  const desc = (line.value.description || '').trim()
  const rsn  = (line.value.reason || '').trim()
  const type = line.value.request_type || 'NEW'

  const recordKey = [
    selectedCategoryId.value,
    selectedSubCategoryId.value,
    a?.id ?? 'none',
    type,
    desc.toLowerCase(),
    rsn.toLowerCase(),
  ].join('|')

  const existing = records.value.find(r => r.__key === recordKey)
  if (existing) {
    existing.planned_cost = Number(existing.planned_cost) + Number(line.value.planned_cost || 0)
    existing.quantity     = Number(existing.quantity || 0) + qty
  } else {
    records.value.push({
      __key: recordKey,
      asset_category_id: Number(selectedCategoryId.value),
      asset_sub_category_id: Number(selectedSubCategoryId.value),
      asset_id: a?.id ?? null,
      description: desc || null,
      planned_cost: Number(line.value.planned_cost),
      request_type: type,
      quantity: qty,
      reason: rsn || null,

      asset_code: a?.code ?? '—',
      category_name: categoryNameById(selectedCategoryId.value),
      subcategory_name: subcategoryNameById(selectedSubCategoryId.value),
    })
  }

  // reset inline inputs
  selectedCategoryId.value    = null
  selectedSubCategoryId.value = null
  selectedAsset.value         = null
  assets.value                = []
  line.value.planned_cost     = null
  line.value.quantity         = 1
  line.value.request_type     = 'NEW'
  line.value.description      = ''
  line.value.reason           = ''
}

const removeRecord = (item) => {
  records.value = records.value.filter(r => r !== item)
}
const clearAll = () => { records.value = [] }

/* -------- save (PUT/PATCH) -------- */
const canSave = computed(() => {
  const hasProject = Number(selectedProjectId.value) > 0
  const hasDate = !!date.value
  const hasRows = records.value.length > 0
  return hasProject && hasDate && hasRows
})

const saveAll = async () => {
  if (!canSave.value) return
  loading.value.submit = true
  topErrors.value = {}
  rowErrors.value = []

  try {
    const payload = {
      project_id: Number(selectedProjectId.value),
      date: date.value,
      data: records.value.map(r => ({
        asset_category_id: Number(r.asset_category_id),
        asset_sub_category_id: Number(r.asset_sub_category_id),
        asset_id: r.asset_id ?? null,
        description: r.description ?? null,
        planned_cost: Number(r.planned_cost),
        request_type: r.request_type,
        quantity: Number(r.quantity || 1),
        reason: r.reason ?? null,
      })),
    }

    const headers = getAuthHeaders()
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
  } catch (e) {
    const msg  = e?.response?.data?.message
    const errs = e?.response?.data?.errors
    if (errs?.project_id) topErrors.value.project_id = errs.project_id
    if (errs?.date) topErrors.value.date = errs.date

    // Map data.N.field style errors back to rows (optional)
    if (errs && typeof errs === 'object') {
      Object.entries(errs).forEach(([k, v]) => {
        const m = k.match(/^data\.(\d+)\.(.+)$/)
        if (m) {
          const idx = Number(m[1])
          if (!rowErrors.value[idx]) rowErrors.value[idx] = {}
          rowErrors.value[idx][m[2]] = Array.isArray(v) ? v : [String(v)]
        }
      })
    }

    alert(msg || 'Failed to update request.')
    console.error('Update error:', e?.response ?? e)
  } finally {
    loading.value.submit = false
  }
}

/* -------- totals -------- */
const plannedTotal = computed(() =>
  records.value.reduce((sum, r) => sum + Number(r.planned_cost || 0) * Number(r.quantity || 1), 0)
)
function formatAmount(val) {
  if (val === null || val === undefined || val === '') return '-'
  const num = Number(val)
  if (Number.isNaN(num)) return String(val)
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/* -------- nav -------- */
const goBack = () => router.push('/dashboards/asset-investment-requests')

/* -------- init -------- */
onMounted(async () => {
  await Promise.all([fetchProjects(), fetchAssetCategories()])
  await loadRecord()
})
</script>

<style scoped>
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.gap-2 { gap: 8px; }
.mb-4 { margin-block-end: 16px; }
.text-medium-emphasis { opacity: 0.7; }

@media (min-width: 960px) { .pa-4 { padding: 24px !important; } }
</style>
