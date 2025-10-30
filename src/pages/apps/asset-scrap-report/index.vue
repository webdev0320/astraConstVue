<template>
  <div class="container mt-4">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-4 flex-wrap gap-3">
      <h3 class="text-h5 font-weight-bold mb-0">Asset Scrap Reports</h3>

      <div class="d-flex flex-grow-1 gap-3 align-center">
        <VTextField
          v-model="search"
          placeholder="Search by Tag No or Project..."
          density="comfortable"
          variant="outlined"
          hide-details
          class="flex-grow-1"
          @keyup.enter="fetchReports"
        />

        <VBtn
          color="primary"
          class="shrink-0"
          @click="$router.push('/dashboards/asset-scrap-report/create')"
        >
          <VIcon icon="mdi-plus" class="me-2" /> Create Report
        </VBtn>
      </div>
    </div>

    <!-- Data Table -->
    <VCard>
      <VDataTable
        :headers="headers"
        :items="filteredReports"
        class="elevation-1"
        :items-per-page="10"
        density="comfortable"
      >
        <!-- Date Columns -->
        <template #item.report_date="{ item }">
          {{ formatDate(item.report_date) }}
        </template>

        <template #item.approval_date="{ item }">
          {{ formatDate(item.approval_date) }}
        </template>

        <!-- Action Menu -->
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
            <VListItem @click="$router.push(`/dashboards/asset-scrap-report/detail/${item.id}`)">
              <template #prepend><VIcon icon="mdi-file-document" /></template>
              <VListItemTitle>Detail</VListItemTitle>
            </VListItem>

<!--             <VListItem @click="$router.push(`/dashboards/asset-scrap-report/edit/${item.id}`)">
              <template #prepend><VIcon icon="mdi-pencil" /></template>
              <VListItemTitle>Edit</VListItemTitle>
            </VListItem>
 -->
            <VListItem @click="deleteReport(item.id)">
              <template #prepend><VIcon icon="mdi-delete" /></template>
              <VListItemTitle>Delete</VListItemTitle>
            </VListItem>
          </VList>
        </VMenu>
      </template>

        <!-- No data -->
        <template #no-data>
          <div class="text-center py-5 text-medium-emphasis">
            No scrap reports found.
          </div>
        </template>
      </VDataTable>
    </VCard>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const reports = ref([])
const search = ref('')
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

// ✅ Get cookie value
const getCookie = name => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
}

// ✅ Get Authorization headers
const getAuthHeaders = () => {
  const accessToken = getCookie('accessToken')
  if (!accessToken) throw new Error('Access token is missing.')
  const decodedToken = decodeURIComponent(accessToken)
  return { Authorization: `Bearer ${decodedToken}`, Accept: 'application/json' }
}

// ✅ Define table headers
const headers = [
  { title: 'Tag No', key: 'tag_no', sortable: true },
  { title: 'Project', key: 'project', sortable: true },
  { title: 'Scraped By', key: 'scraped_by_name' },
  { title: 'Manager', key: 'manager_name' },
  { title: 'Approval Manager', key: 'approval_manager_name' },
  { title: 'Report Date', key: 'report_date' },
  { title: 'Approval Date', key: 'approval_date' },
  { title: 'Actions', key: 'actions', sortable: false },

]

// ✅ Fetch reports
const fetchReports = async () => {
  try {
    const response = await axios.get(`${apiBaseUrl}/asset-scrap-reports`, {
      headers: getAuthHeaders(),
    })
    if (response.data.status) {
      reports.value = response.data.data
    }
  } catch (error) {
    console.error('Error fetching reports:', error)
  }
}

// ✅ Delete report
const deleteReport = async id => {
  if (!confirm('Are you sure you want to delete this report?')) return
  try {
    await axios.delete(`${apiBaseUrl}/asset-scrap-reports/${id}`, {
      headers: getAuthHeaders(),
    })
    fetchReports()
  } catch (error) {
    console.error('Error deleting report:', error)
  }
}

// ✅ Search filter
const filteredReports = computed(() => {
  const term = search.value.toLowerCase()
  return reports.value.filter(r =>
    (r.tag_no?.toLowerCase().includes(term)) ||
    (r.project?.toLowerCase().includes(term)) ||
    (r.manager_name?.toLowerCase().includes(term)) ||
    (r.approval_manager_name?.toLowerCase().includes(term))
  )
})

// ✅ Date format
const formatDate = date => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString()
}

onMounted(fetchReports)
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
