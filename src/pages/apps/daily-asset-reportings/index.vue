<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <h3 class="shrink-0">Daily Asset Reportings</h3>

      <VTextField
        v-model="search"
        placeholder="Search by Operator, Equipment or Remarks..."
        density="comfortable"
        variant="outlined"
        hide-details
        class="mx-4 flex-grow-1"
        @keyup.enter="fetchReportings"
      />

      <VBtn
        color="primary"
        class="shrink-0"
        @click="$router.push('/dashboards/daily-asset-reportings/create')"
      >
        Create Reporting
      </VBtn>
    </div>

    <p v-if="isLoading">Loading...</p>
    <p v-else-if="errorMessage" class="text-error">{{ errorMessage }}</p>

    <!-- ✅ Data Table -->
    <VDataTable
      v-else-if="reportings.length > 0"
      :headers="headers"
      :items="reportings"
      :items-per-page="10"
      :search="search"
    >
      <!-- ✅ Remarks Popup Button -->
      <template #item.remarks="{ item }">
        <VBtn color="primary" size="small" @click="openRemarks(item.remarks)">
          View
        </VBtn>
      </template>
    </VDataTable>

    <!-- Empty State -->
    <VCard v-else class="mt-6 pa-6 text-center" variant="tonal">
      <VCardTitle>No daily asset reportings found</VCardTitle>
      <VCardText>
        You don’t have any reportings yet. Create your first one to get started.
      </VCardText>
      <VBtn color="primary" @click="$router.push('/dashboards/daily-asset-reportings/create')">
        Create Reporting
      </VBtn>
    </VCard>

    <!-- ✅ Remarks Dialog -->
    <VDialog v-model="remarksDialog" max-width="600px">
      <VCard>
        <VCardTitle class="text-lg font-weight-bold">Remarks</VCardTitle>
        <VCardText>
          <p v-if="selectedRemarks" class="text-body-1">{{ selectedRemarks }}</p>
          <p v-else class="text-grey">No remarks available.</p>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn color="primary" variant="tonal" @click="remarksDialog = false">Close</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted } from "vue";
import {
  VBtn,
  VCard,
  VCardText,
  VCardTitle,
  VDataTable,
  VDialog,
  VCardActions,
  VSpacer,
  VTextField,
} from "vuetify/components";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const reportings = ref([]);
const isLoading = ref(true);
const errorMessage = ref("");
const search = ref("");
const remarksDialog = ref(false);
const selectedRemarks = ref("");

// ✅ Headers
const headers = [
  { title: "Equipment Type", key: "equipment_type" },
  { title: "Supplier Name", key: "supplier_name" },
  { title: "Equipment Name", key: "equipment_name" },
  { title: "Expected End Date", key: "expected_end_date" },
  { title: "Operator", key: "operator" },
  { title: "QTY", key: "qty" },
  { title: "Plate No.", key: "plate_no" },
  { title: "Rent Type", key: "rent_type" },
  { title: "Equipment Status", key: "status" },
  { title: "Remarks", key: "remarks" }, // will show popup
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
  return { Authorization: `Bearer ${decodeURIComponent(accessToken)}`, Accept: "application/json" };
};

/* ---------- Fetch Data ---------- */
const fetchReportings = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const res = await axios.get(`${apiBaseUrl}/daily-asset-reportings`, {
      headers: getAuthHeaders(),
      params: { search: search.value },
    });

    const list = Array.isArray(res.data) ? res.data : [];

    reportings.value = list.map((d) => ({
      id: d.id,
      equipment_type: d.asset?.asset_type || "",
      supplier_name: d.asset?.brand || "",
      equipment_name: d.asset ? `${d.asset.code} — ${d.asset.title}` : "",
      expected_end_date: d.asset?.manufacturing_year || "",
      operator: d.operator ? `${d.operator.user_code} — ${d.operator.name}` : "",
      qty: d.asset?.quantity || "",
      plate_no: d.asset?.plate_number || "",
      rent_type: 'Month',//d.asset?.asset_type || "",
      status: d.status || "",
      remarks: d.remarks || "",
    }));
  } catch (err) {
    console.error("Error fetching daily asset reportings:", err);
    errorMessage.value = err.response?.data?.message || "Failed to fetch reportings.";
  } finally {
    isLoading.value = false;
  }
};

/* ---------- Open Remarks ---------- */
const openRemarks = (remarks) => {
  selectedRemarks.value = remarks || "No remarks available.";
  remarksDialog.value = true;
};

onMounted(fetchReportings);
</script>

<style>
.v-data-table { margin-block-start: 16px; }
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.text-error { color: #c62828; }
.v-table__wrapper{
  overflow: hidden;
}
</style>
