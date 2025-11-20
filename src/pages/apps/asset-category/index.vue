<template>
  <div>
    <div class="mb-4">
      <!-- Title -->
      <h3 class="mb-3">Asset Categories</h3>

      <!-- Filter + Buttons Row -->
      <div class="d-flex gap-3 align-center filter-bar">
        <!-- Search -->
        <VTextField
          v-model="search"
          placeholder="Search by title…"
          variant="outlined"
          density="default"
          clearable
          hide-details
          class="filter-input"
        />

        <!-- Status -->
        <VSelect
          v-model="statusFilter"
          :items="statusOptions"
          item-title="label"
          item-value="value"
          label="Status"
          variant="outlined"
          density="default"
          hide-details
          clearable
          class="filter-input"
        />

        <!-- Parent -->
        <VSelect
          v-model="parentFilter"
          :items="parentOptions"
          item-title="label"
          item-value="value"
          label="Type"
          variant="outlined"
          density="default"
          hide-details
          clearable
          class="filter-input"
        />

        <!-- Export -->
        <VBtn color="primary" variant="outlined" :loading="exporting" class="filter-btn" @click="exportToExcel">
          Export to Excel
        </VBtn>

        <!-- Create -->
        <VBtn color="primary" class="filter-btn" @click="$router.push('/dashboards/assetcategories/create')">
          Create Asset Category
        </VBtn>
      </div>
    </div>


    <VDataTable
      v-if="rows.length"
      :headers="headers"
      :items="filteredRows"
      :items-per-page="10"
      :loading="loading"
      class="mt-3"
    >
      <!-- TITLE -->
      <template #item.title="{ item }">
        <div class="fw-600">{{ cell(item, 'title') ?? '—' }}</div>
      </template>

      <!-- PARENT NAME -->
      <template #item.parent_name="{ item }">
        {{ cell(item, 'parent_name') ?? '—' }}
      </template>

      <!-- IS PARENT -->
      <template #item.is_parent="{ item }">
        <VChip :color="truthy(cell(item, 'is_parent')) ? 'primary' : 'grey'" size="small" label>
          {{ truthy(cell(item, 'is_parent')) ? 'Yes' : 'No' }}
        </VChip>
      </template>

      <!-- STATUS -->
      <template #item.status="{ item }">
        <VChip :color="truthy(cell(item, 'status')) ? 'success' : 'error'" size="small" label>
          {{ truthy(cell(item, 'status')) ? 'Active' : 'Inactive' }}
        </VChip>
      </template>

      <!-- ACTIONS -->
      <template #item.actions="{ item }">
        <div class="d-flex gap-2">
          <VBtn
            color="warning"
            size="small"
            @click="$router.push(`/dashboards/assetcategories/edit/${cell(item, 'id')}`)"
          >
            Edit
          </VBtn>
          <VBtn color="error" size="small" @click="deleteCategory(cell(item, 'id'))">
            Delete
          </VBtn>
        </div>
      </template>
    </VDataTable>

    <p v-else-if="errorMessage" class="mt-4">{{ errorMessage }}</p>
    <p v-else class="mt-4">Loading…</p>
  </div>
</template>

<script setup>
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import {
  VBtn,
  VChip,
  VDataTable,
  VSelect,
  VTextField,
} from 'vuetify/components'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

/* ---------------- Table headers ---------------- */
const headers = [
  { title: 'Title', key: 'title' },
  { title: 'PARENT Name', key: 'parent_name', align: 'start', width: 160 },
  { title: 'IS PARENT', key: 'is_parent', width: 120 },
  { title: 'STATUS', key: 'status', width: 120 },
  { title: 'ACTIONS', key: 'actions', sortable: false, width: 160 },
]

/* ---------------- State ---------------- */
const rows = ref([])   // normalized categories for table
const loading = ref(false)
const exporting = ref(false)
const errorMessage = ref('')

/* Filters */
const search = ref('')          // search by title
const statusFilter = ref(null)  // true/false/null
const parentFilter = ref(null)  // 'parent' | 'child' | null

const statusOptions = [
  { label: 'Active', value: true },
  { label: 'Inactive', value: false },
]
const parentOptions = [
  { label: 'Parents only', value: 'parent' },
  { label: 'Children only', value: 'child' },
]

/* ---------------- Utils ---------------- */
const cell = (it, key) => it?.raw?.[key] ?? it?.columns?.[key] ?? it?.[key] ?? null
const truthy = v => v === true || v === 1 || v === '1'

const getCookie = name => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

/* ---------------- Fetch all pages ---------------- */
const fetchAllCategories = async () => {
  let page = 1
  let total = Infinity
  let perPageFromServer = 15
  let all = []

  while ((page - 1) * perPageFromServer < total) {
    const res = await axios.get(`${apiBaseUrl}/asset-categories`, {
      params: { page },
      headers: { Authorization: `Bearer ${decodeURIComponent(getCookie('accessToken') || '')}` },
    })

    const list = Array.isArray(res.data?.categories) ? res.data.categories : []
    total = Number(res.data?.total_records ?? all.length + list.length)
    perPageFromServer = Number(res.data?.perPage ?? perPageFromServer)
    page += 1

    all = all.concat(list)

    if (list.length === 0) break
  }

  return all
}

/* ---------------- Load + normalize ---------------- */
const load = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    const token = getCookie('accessToken')
    if (!token) throw new Error('Access token is missing. Please log in.')

    const raw = await fetchAllCategories()

    rows.value = raw.map(c => ({
      id: c.id,
      title: c.title,
      description: c.description ?? '',
      is_parent: !!c.is_parent,
      parent_name: c.parent_name ?? null, // null for root
      status: !!c.status,
    }))

    // sort by title asc
    rows.value.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
  } catch (e) {
    console.error('Error loading asset categories:', e)
    errorMessage.value = e.response?.data?.message || 'Failed to fetch asset categories.'
  } finally {
    loading.value = false
  }
}

onMounted(load)

/* ---------------- Filters ---------------- */
const filteredRows = computed(() => {
  let data = rows.value

  // search (title)
  const q = (search.value || '').toLowerCase().trim()
  if (q) {
    data = data.filter(r => (r.title || '').toLowerCase().includes(q))
  }

  // status
  if (statusFilter.value === true || statusFilter.value === false) {
    data = data.filter(r => r.status === statusFilter.value)
  }

  // parent/child
  if (parentFilter.value === 'parent') {
    data = data.filter(r => r.is_parent === true)
  } else if (parentFilter.value === 'child') {
    data = data.filter(r => r.is_parent === false)
  }

  return data
})

/* ---------------- Delete ---------------- */
const deleteCategory = async (id) => {
  if (!confirm('Are you sure you want to delete this category?')) return
  try {
    const accessToken = getCookie('accessToken')
    const decodedToken = decodeURIComponent(accessToken || '')
    await axios.delete(`${apiBaseUrl}/asset-categories/${id}`, {
      headers: { Authorization: `Bearer ${decodedToken}`, Accept: 'application/json' },
    })
    rows.value = rows.value.filter(r => r.id !== id)
    alert('Category deleted successfully!')
  } catch (error) {
    console.error('Error deleting category:', error)
    alert(error.response?.data?.message || 'Failed to delete category.')
  }
}

/* ---------------- Export to Excel (filtered rows) ---------------- */
const exportToExcel = async () => {
  try {
    exporting.value = true
    const data = filteredRows.value

    if (!data.length) {
      alert('No rows to export.')
      return
    }

    // Shape rows for Excel (human-readable)
    const excelRows = data.map(r => ({
      ID: r.id,
      Title: r.title || '',
      'Parent Name': r.parent_name || '',
      'Is Parent': r.is_parent ? 'Yes' : 'No',
      Status: r.status ? 'Active' : 'Inactive',
    }))

    // dynamic import to keep bundle light
    const xlsx = await import('xlsx')
    const ws = xlsx.utils.json_to_sheet(excelRows, {
      header: ['Title', 'Parent Name'],
      skipHeader: false,
    })
    const wb = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(wb, ws, 'Asset Categories')

    const stamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, '-')
    const filename = `asset-categories-${stamp}.xlsx`

    xlsx.writeFile(wb, filename)
  } catch (err) {
    console.error('Export failed:', err)
    alert('Failed to export Excel.')
  } finally {
    exporting.value = false
  }
}
</script>

<style>
.filter-bar {
  display: flex;
  flex-wrap: nowrap;  /* ek hi line me rakhega */
  align-items: center;
}

.filter-input {
  block-size: 44px;
  max-inline-size: 240px;
  min-inline-size: 200px;
}

.filter-btn {
  display: flex;
  align-items: center;
  block-size: 44px;
}

.v-data-table { margin-block-start: 16px; }
.fw-600 { font-weight: 600; }

.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.ms-auto { margin-inline-start: auto; }
.gap-2 { gap: 8px; }
.mb-4 { margin-block-end: 16px; }

/* Clamp + long text safety */
.desc-cell {
  overflow: hidden;
  max-inline-size: 480px;
  overflow-wrap: anywhere;
  text-overflow: ellipsis;
  word-break: break-word;
}

.clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>
