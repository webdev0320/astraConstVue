<template>
  <div class="container mt-4">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-4 flex-wrap gap-3">
      <h3 class="text-h5 font-weight-bold mb-0">Policy Waiver Forms</h3>

      <div class="d-flex flex-grow-1 gap-3 align-center">
        <VTextField
          v-model="search"
          placeholder="Search by Form No, Waiver Type, Department..."
          density="comfortable"
          variant="outlined"
          hide-details
          class="flex-grow-1"
          @keyup.enter="fetchForms"
        />

        <VBtn
          color="primary"
          class="shrink-0"
          @click="$router.push('/dashboards/policy-waiver-form/create')"
        >
          <VIcon icon="mdi-plus" class="me-2" /> Create Form
        </VBtn>
      </div>
    </div>

    <!-- Data Table -->
    <VCard>
      <VDataTable
        :headers="headers"
        :items="filteredForms"
        class="elevation-1"
        :items-per-page="10"
        density="comfortable"
      >
        <template #item.date="{ item }">
          {{ formatDate(item.date) }}
        </template>

        <template #item.department_name="{ item }">
          {{ item.department_name || '-' }}
        </template>

        <template #item.project_name="{ item }">
          {{ item.project_name || '-' }}
        </template>

        <template #item.user_name="{ item }">
          {{ item.user_name || '-' }}
        </template>

        <!-- Actions Menu -->
        <template #item.actions="{ item }">
          <VMenu :close-on-content-click="true">
            <template #activator="{ props, isActive }">
              <VBtn
                v-bind="props"
                size="small"
                color="primary"
                variant="elevated"
                class="d-flex align-center gap-1"
              >
                Actions
                <VIcon :icon="isActive ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
              </VBtn>
            </template>

            <VList density="compact">
              <VListItem @click="$router.push(`/dashboards/policy-waiver-form/detail/${item.id}`)">
                <template #prepend><VIcon icon="mdi-file-document" /></template>
                <VListItemTitle>Detail</VListItemTitle>
              </VListItem>

              <VListItem @click="deleteForm(item.id)">
                <template #prepend><VIcon icon="mdi-delete" /></template>
                <VListItemTitle>Delete</VListItemTitle>
              </VListItem>
            </VList>
          </VMenu>
        </template>

        <template #no-data>
          <div class="text-center py-5 text-medium-emphasis">
            No policy waiver forms found.
          </div>
        </template>
      </VDataTable>
    </VCard>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const forms = ref([])
const search = ref('')
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

// Cookie + Auth header logic
const getCookie = name => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
}

const getAuthHeaders = () => {
  const accessToken = getCookie('accessToken')
  if (!accessToken) throw new Error('Access token missing.')
  return {
    Authorization: `Bearer ${decodeURIComponent(accessToken)}`,
    Accept: 'application/json',
  }
}

// Table headers
const headers = [
  { title: 'Form No', key: 'form_no', sortable: true },
  { title: 'Waiver Type', key: 'waiver_type', sortable: true },
  { title: 'Date', key: 'date', sortable: true },
  { title: 'Department', key: 'department_name' },
  { title: 'Project', key: 'project_name' },
  { title: 'Prepared By', key: 'user_name' },
  { title: 'PO No', key: 'po_no' },
  { title: 'Actions', key: 'actions', sortable: false },
]

// Fetch data
const fetchForms = async () => {
  try {
    const res = await axios.get(`${apiBaseUrl}/policy-waiver-forms`, {
      headers: getAuthHeaders(),
    })
    // ✅ Extract data correctly
    forms.value = res.data.data || []
  } catch (err) {
    console.error('Error fetching forms:', err)
  }
}

// Delete form
const deleteForm = async id => {
  if (!confirm('Are you sure you want to delete this form?')) return
  try {
    await axios.delete(`${apiBaseUrl}/policy-waiver-forms/${id}`, {
      headers: getAuthHeaders(),
    })
    fetchForms()
  } catch (err) {
    console.error('Error deleting form:', err)
  }
}

// Search filter
const filteredForms = computed(() => {
  const term = search.value.toLowerCase()
  return forms.value.filter(f =>
    f.form_no?.toLowerCase().includes(term) ||
    f.waiver_type?.toLowerCase().includes(term) ||
    f.department_name?.toLowerCase().includes(term) ||
    f.project_name?.toLowerCase().includes(term) ||
    f.user_name?.toLowerCase().includes(term) ||
    f.po_no?.toLowerCase().includes(term)
  )
})

// Date formatter
const formatDate = date => (date ? new Date(date).toLocaleDateString() : '-')

onMounted(fetchForms)
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
