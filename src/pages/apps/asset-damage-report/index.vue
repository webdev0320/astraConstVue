<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <!-- Heading -->
      <h3 class="shrink-0">Asset Damage Reports</h3>

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
        @click="$router.push('/dashboards/asset-damage-report/create')"
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
            <VListItem @click="$router.push(`/dashboards/asset-damage-report/detail/${item.id}`)">
              <template #prepend><VIcon icon="tabler-eye" /></template>
              <VListItemTitle>Detail</VListItemTitle>
            </VListItem>

            <VListItem @click="$router.push(`/dashboards/asset-damage-report/edit/${item.id}`)">
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
      <VCardTitle>No damage reports found</VCardTitle>
      <VCardText>
        You don’t have any damage reports yet. Create your first one to get started.
      </VCardText>
      <VBtn color="primary" @click="$router.push('/dashboards/asset-damage-report/create')">
        Create Report
      </VBtn>
    </VCard>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted } from "vue";
import {
  VBtn, VCard, VCardText, VCardTitle,
  VDataTable, VChip, VIcon, VList, VListItem,
  VListItemTitle, VMenu, VTextField,
} from "vuetify/components";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const reports = ref([]);
const isLoading = ref(true);
const errorMessage = ref("");
const search = ref("");

const headers = [
  { title: "ID", key: "id" },
  { title: "Project", key: "project" },
  { title: "Tag No", key: "tag_no" },
  { title: "Report Date", key: "report_date" },
  { title: "Damaged On", key: "damaged_asset_reported_on" },
  { title: "Asset Damage By", key: "asset_damaged_by" },
  { title: "Assessed By", key: "assessed_by" },
  { title: "Actions", key: "actions", sortable: false },
];

/* ---------- Auth helper ---------- */
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

const getAuthHeaders = () => {
  const accessToken = getCookie("accessToken");
  if (!accessToken) throw new Error("Access token is missing.");
  const decodedToken = decodeURIComponent(accessToken);
  return { Authorization: `Bearer ${decodedToken}`, Accept: "application/json" };
};

/* ---------- Fetch Data ---------- */
const fetchReports = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const res = await axios.get(`${apiBaseUrl}/asset-damage-reports`, {
      headers: getAuthHeaders(),
      params: { search: search.value },
    });

    reports.value = Array.isArray(res?.data?.data)
      ? res.data.data
      : Array.isArray(res?.data)
      ? res.data
      : [];
  } catch (err) {
    console.error("Error fetching damage reports:", err);
    errorMessage.value = err.response?.data?.message || "Failed to fetch reports.";
  } finally {
    isLoading.value = false;
  }
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

    await axios.delete(`${apiBaseUrl}/asset-damage-reports/${id}`, {
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



onMounted(fetchReports);
</script>

<style>
.v-data-table { margin-block-start: 16px; }
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.text-error { color: #c62828; }
</style>
