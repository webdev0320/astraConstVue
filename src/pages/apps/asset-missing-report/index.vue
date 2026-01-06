<template>
  <div>
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

    <!-- Loading -->
    <p v-if="isLoading">Loading...</p>

    <!-- Error -->
    <p v-else-if="errorMessage" class="text-error">{{ errorMessage }}</p>

    <!-- Table -->
    <VDataTable
      v-else-if="reports.length > 0"
      :headers="headers"
      :items="reports"
      :items-per-page="10"
      :search="search"
    >

      <!-- Actions -->
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

            <VListItem @click="$router.push(`/dashboards/asset-missing-report/edit/${item.id}`)">
              <template #prepend><VIcon icon="tabler-edit" /></template>
              <VListItemTitle>Edit</VListItemTitle>
            </VListItem>

            <VListItem @click="deleteReport(item.id)">
              <template #prepend><VIcon icon="tabler-trash" /></template>
              <VListItemTitle>Delete</VListItemTitle>
            </VListItem>
          </VList>
        </VMenu>
      </template>
    </VDataTable>

    <!-- Empty State -->
    <VCard v-else class="mt-6 pa-6 text-center" variant="tonal">
      <VCardTitle>No missing reports found</VCardTitle>
      <VCardText>
        You don’t have any missing reports yet. Create your first one to get started.
      </VCardText>
      <VBtn color="primary" @click="$router.push('/dashboards/asset-missing-report/create')">
        Create Report
      </VBtn>
    </VCard>
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


/* ---------- DELETE HANDLER ---------- */
import Swal from "sweetalert2";
/* ---------------- Mutations ---------------- */
const deleteReport = async (id) => {

  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This request will be permanently deleted!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    customClass: {
      title: 'swal-title-color',      // title text
      content: 'swal-content-color',  // message text
      confirmButton: 'swal-confirm-btn', // confirm button text
      cancelButton: 'swal-cancel-btn'    // cancel button text
    }
  });

  if (!result.isConfirmed) return;

  try {
    Swal.fire({
      title: "Deleting...",
      text: "Please wait",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    await axios.delete(`${apiBaseUrl}/asset-missing-reports/${id}`, {
        headers: getAuthHeaders(),
    });
    Swal.fire({
      title: "Deleted!",
      text: "Request deleted successfully.",
      icon: "success",
      customClass: {
        title: 'swal-title-color',      // title text
        content: 'swal-content-color',  // message text
        confirmButton: 'swal-confirm-btn', // confirm button text
        cancelButton: 'swal-cancel-btn'    // cancel button text
      }
    }).then(() => {
      // ✅ Reload the page
      window.location.reload();
    });;

  } catch (e) {
    console.error("Error deleting request:", e);

    Swal.fire({
      title: "Error!",
      text: e.response?.data?.message || "Failed to request.",
      icon: "error",
    });
  }

}

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
