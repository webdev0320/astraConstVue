<template>
  <div class="container mt-4">
  
    <div class="d-flex justify-between align-center mb-4">
      <!-- Heading -->
      <h3 class="shrink-0">Asset Missing Reports</h3>

      <!-- Search -->
      <VTextField
        v-model="search"
        placeholder="Search by Tag No or Project..."
        density="comfortable"
        variant="outlined"
        hide-details
        class="mx-4 flex-grow-1"
        @keyup.enter="fetchReports"
      />

      <!-- Create Button -->
      <VBtn
        color="primary"
        class="shrink-0"
        @click="$router.push('/dashboards/asset-missing-report/create')"
      >
        Create Report
      </VBtn>
    </div>


    <!-- Data Table -->
    <VDataTable
      :headers="headers"
      :items="filteredReports"
      :loading="loading"
      class="elevation-1"
      hover
    >
      
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
              <VIcon :icon="isActive ? 'tabler-caret-up' : 'tabler-caret-down'" />
            </VBtn>
          </template>

          <VList density="compact">
            <VListItem @click="$router.push(`/dashboards/asset-missing-report/detail/${item.id}`)">
              <template #prepend><VIcon icon="tabler-eye" /></template>
              <VListItemTitle>Detail</VListItemTitle>
            </VListItem>

<!--             <VListItem @click="$router.push(`/dashboards/asset-damage-reports/edit/${item.id}`)">
              <template #prepend><VIcon icon="tabler-edit" /></template>
              <VListItemTitle>Edit</VListItemTitle>
            </VListItem>
 -->
            <VListItem @click="deleteReport(item.id)">
              <template #prepend><VIcon icon="tabler-trash" /></template>
              <VListItemTitle>Delete</VListItemTitle>
            </VListItem>
          </VList>
        </VMenu>
      </template>

      <template #no-data>
        <div class="text-center text-muted py-4">No asset missing reports found.</div>
      </template>
    </VDataTable>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import {
  VDataTable,
  VBtn,
  VChip,
  VTextField,
  VIcon,
} from "vuetify/components";

// ✅ Helper to extract cookie
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
};

// ✅ Auth headers
const getAuthHeaders = () => {
  const token = getCookie("accessToken");
  if (!token) throw new Error("Access token missing");
  return {
    Authorization: `Bearer ${decodeURIComponent(token)}`,
    Accept: "application/json",
  };
};

const router = useRouter();
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const reports = ref([]);
const loading = ref(false);
const search = ref("");

// ✅ Table headers
const headers = [
  { title: "ID", key: "id", sortable: true },
  { title: "Project", key: "project_name" },
  { title: "Tag No", key: "tag_no" },
  { title: "Reported By", key: "reported_by_name" },
  { title: "Issued To", key: "asset_issue_to_name" },
  { title: "Assessed By", key: "assessed_by_name" },
  { title: "Manager", key: "manager_name" },
  { title: "Approval Manager", key: "approval_manager_name" },
  { title: "Report Date", key: "report_date" },
  { title: "Actions", key: "actions", sortable: false },
];

// ✅ Fetch data
const fetchReports = async () => {
  loading.value = true;
  try {
    const { data } = await axios.get(`${apiBaseUrl}/asset-missing-reports`, {
      headers: getAuthHeaders(),
    });
    if (data.status) {
      reports.value = data.data;
    }
  } catch (error) {
    console.error("Error fetching asset missing reports:", error);
  } finally {
    loading.value = false;
  }
};

// ✅ Computed for search
const filteredReports = computed(() => {
  if (!search.value) return reports.value;
  const keyword = search.value.toLowerCase();
  return reports.value.filter((r) =>
    Object.values(r).some((v) => String(v).toLowerCase().includes(keyword))
  );
});

// ✅ Navigate to detail page
const viewDetail = (id) => {
  router.push({ name: "asset-missing-report-detail", params: { id } });
};

// ✅ Lifecycle
onMounted(fetchReports);
</script>

<style scoped>
.container {
  max-width: 1200px;
}

.v-data-table {
  border-radius: 8px;
  overflow: hidden;
}

.v-btn {
  text-transform: none;
}
</style>
