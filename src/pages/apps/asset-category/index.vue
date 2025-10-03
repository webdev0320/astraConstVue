<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <h3>Asset Categories</h3>

      <div class="d-flex gap-2 ms-auto">
        <!-- Search (by slug) -->
        <VTextField
          v-model="search"
          placeholder="Search by slug…"
          density="comfortable"
          clearable
          hide-details
          style="max-inline-size: 260px;"
        />

        <!-- Status filter -->
        <VSelect
          v-model="statusFilter"
          :items="statusOptions"
          item-title="label"
          item-value="value"
          label="Status"
          density="comfortable"
          hide-details
          clearable
          style="max-inline-size: 180px;"
        />

        <!-- Parent filter -->
        <VSelect
          v-model="parentFilter"
          :items="parentOptions"
          item-title="label"
          item-value="value"
          label="Type"
          density="comfortable"
          hide-details
          clearable
          style="max-inline-size: 180px;"
        />

        <VBtn color="primary" @click="$router.push('/dashboards/assetcategories/create')">
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
      <!-- SLUG (safe access) -->
      <template #item.slug="{ item }">
        <div class="fw-600">{{ cell(item, 'slug') ?? '—' }}</div>
      </template>

      <!-- PARENT ID -->
      <template #item.parent_id="{ item }">
        {{ cell(item, 'parent_id') ?? '—' }}
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

      <!-- DESCRIPTION -->
      <template #item.description="{ item }">
        <div class="desc-cell clamp-2" :title="cell(item, 'description') || '—'">
          {{ truncateSmart(cell(item, 'description'), 20, 120) }}
        </div>
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
import axios from 'axios';
import { computed, onMounted, ref } from 'vue';
import {
  VBtn,
  VChip,
  VDataTable,
  VSelect,
  VTextField,
} from 'vuetify/components';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

/* ---------------- Table headers ---------------- */
const headers = [
  { title: 'Title', key: 'title' },
  { title: 'PARENT Name', key: 'parent_name', align: 'start', width: 120 },
  { title: 'IS PARENT', key: 'is_parent', width: 120 },
  { title: 'STATUS', key: 'status', width: 120 },
  { title: 'ACTIONS', key: 'actions', sortable: false, width: 160 },
]

/* ---------------- State ---------------- */
const rows = ref([])   // normalized categories for table
const loading = ref(false)
const errorMessage = ref('')

/* Filters */
const search = ref('')          // search by slug
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
/** Safely read a cell value regardless of Vuetify's internal item shape */
const cell = (it, key) => it?.raw?.[key] ?? it?.columns?.[key] ?? it?.[key] ?? null
const truthy = v => v === true || v === 1 || v === '1'

const getCookie = name => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

const truncateSmart = (text, wordLimit = 20, charFallback = 120) => {
  if (!text) return '—'
  const str = String(text).trim()
  const words = str.split(/\s+/).filter(Boolean)
  if (words.length > 1) {
    return words.length > wordLimit ? words.slice(0, wordLimit).join(' ') + '…' : str
  }
  return str.length > charFallback ? str.slice(0, charFallback) + '…' : str
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
      description: c.description,
      is_parent: !!c.is_parent,
      parent_name: c.parent_name, // null for root
      status: !!c.status,
    }))

    // sort by slug asc
    rows.value.sort((a, b) => (a.slug || '').localeCompare(b.slug || ''))
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

  // search (slug only)
  const q = (search.value || '').toLowerCase().trim()
  if (q) {
    data = data.filter(r => (r.slug || '').toLowerCase().includes(q))
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
</script>

<style>
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
