<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <!-- Heading -->
      <h3 class="shrink-0">Assets List</h3>

      <VTextField
        placeholder="Search assets..."
        density="comfortable"
        variant="outlined"
        hide-details
        class="mx-4 flex-grow-1"
        @input=""
      />

      <!-- Create Button -->
      <VBtn
        color="primary"
        class="shrink-0"
        @click="$router.push('/dashboards/assets/create')"
      >
        Create Asset
      </VBtn>
    </div>


    <!-- Loading -->
    <p v-if="isLoading">Loading...</p>

    <!-- Error -->
    <p v-else-if="errorMessage" class="text-error">{{ errorMessage }}</p>

    <!-- Table -->
    <VDataTable
      v-else-if="assets.length > 0"
      :headers="headers"
      :items="assets"
      :items-per-page="10"
    >
      <!-- QR Code image column -->
      <template #item.qr_code="{ item }">
        <template v-if="qrSrc(item)">
          <a :href="qrSrc(item)" target="_blank" rel="noopener">
            <VImg :src="qrSrc(item)" alt="QR Code" width="80" class="rounded" cover />
          </a>
        </template>
        <template v-else>—</template>
      </template>

      <!-- Actions -->
      <template #item.actions="{ item }">
        <VMenu :close-on-content-click="true">
          <!-- Activator with toggle arrow -->
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
            <VListItem @click="$router.push(`/dashboards/assets/detail/${item.raw?.id ?? item.id}`)">
              <template #prepend><VIcon icon="tabler-eye" /></template>
              <VListItemTitle>Detail</VListItemTitle>
            </VListItem>


            <VListItem @click="openDepartmentModal(item.raw?.id ?? item.id)">
              <template #prepend><VIcon icon="tabler-building" /></template>
              <VListItemTitle>Add Department</VListItemTitle>
            </VListItem>

            <VListItem @click="$router.push(`/dashboards/assets/edit/${item.raw?.id ?? item.id}`)">
              <template #prepend><VIcon icon="tabler-edit" /></template>
              <VListItemTitle>Edit</VListItemTitle>
            </VListItem>

            <!-- ✅ NEW BUTTONS -->
            <VListItem @click="approveAsset(item.raw?.id ?? item.id)">
              <template #prepend><VIcon icon="tabler-check" /></template>
              <VListItemTitle>Approve</VListItemTitle>
            </VListItem>

            <VListItem @click="rejectAsset(item.raw?.id ?? item.id)">
              <template #prepend><VIcon icon="tabler-player-stop" /></template>
              <VListItemTitle>Reject</VListItemTitle>
            </VListItem>

            <VListItem @click="deleteAsset(item.raw?.id ?? item.id)">
              <template #prepend><VIcon icon="tabler-trash" /></template>
              <VListItemTitle>Delete</VListItemTitle>
            </VListItem>

          </VList>
        </VMenu>
      </template>

    </VDataTable>

    <!-- Empty State -->
    <VCard v-else class="mt-6 pa-6 text-center" variant="tonal">
      <VCardTitle>No assets found</VCardTitle>
      <VCardText>
        You don’t have any assets yet. Create your first asset to get started.
      </VCardText>
      <VBtn color="primary" @click="$router.push('/dashboards/assets/create')">
        Create Asset
      </VBtn>
    </VCard>

    <!-- Department Modal -->
    <VDialog v-model="departmentModal" max-width="500px">
      <VCard>
        <VCardTitle>Select Departments</VCardTitle>
        <VCardText>
          <div v-if="departmentsLoading">Loading departments…</div>
          <div v-else>
            <VSelect
              v-model="selectedDepartments"
              :items="departments"
              item-title="name"
              item-value="id"
              label="Select Departments"
              multiple
              chips
              outlined
            />
          </div>
        </VCardText>
        <VCardActions>
          <VBtn text @click="departmentModal = false">Cancel</VBtn>
          <VBtn color="primary" @click="assignDepartments">Save</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>    
  </div>
</template>

<script setup>
import axios from "axios";
import { onMounted, ref } from "vue";
import {
  VBtn, VCard, VCardActions, VCardText, VCardTitle,
  VDataTable, VDialog, VImg, VSelect
} from "vuetify/components";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

/* ---- Headers exactly matching API keys ---- */
const headers = [
  // { title: "ID", key: "id" },
  { title: "CODE", key: "code" },
  { title: "Title", key: "title" },
  { title: "Category Name", key: "category_name" },
  { title: "SUB CATEGORY", key: "sub_category" },
  { title: "UNIT PRICE (SAR)", key: "unit_price" },
  { title: "QUANTITY", key: "quantity" },  
  { title: "ACTIONS", key: "actions", sortable: false },
];

const assets = ref([]);
const errorMessage = ref("");
const isLoading = ref(true);

// Departments modal state
const departmentModal = ref(false);
const departments = ref([]);            // [{id, name}]
const selectedDepartments = ref([]);    // [ids]
const originalAssigned = ref([]);       // snapshot
const currentAssetId = ref(null);
const departmentsLoading = ref(false);

const page = ref(1);

/* ---------- Detail modal state ---------- */
const detailModal = ref(false);
const detail = ref(null);
const detailLoading = ref(false);
const detailError = ref("");

/* ---------------- Utils ---------------- */
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

const getAuthHeaders = () => {
  const accessToken = getCookie("accessToken");
  if (!accessToken) throw new Error("Access token is missing. Please log in.");
  const decodedToken = decodeURIComponent(accessToken);
  return { Authorization: `Bearer ${decodedToken}`, Accept: "application/json" };
};

const show = (v) => (v === null || v === undefined || v === "" ? "—" : v);
const boolShow = (b) => (b === true ? "Yes" : b === false ? "No" : "—");

/** Resolve QR url from either item.raw or item */
const qrSrc = (item) => item?.raw?.qr_code ?? item?.qr_code ?? "";

/* ---------------- Fetchers ---------------- */
const fetchAssets = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const res = await axios.get(`${apiBaseUrl}/assets`, {
      headers: getAuthHeaders(),
      params: { page: page.value },
    });

    const rows = res?.data?.data?.data ?? res?.data?.data ?? res?.data ?? [];
    assets.value = Array.isArray(rows) ? rows : [];
  } catch (err) {
    console.error("Error fetching assets:", err);
    errorMessage.value = err.response?.data?.message || "Failed to fetch assets.";
  } finally {
    isLoading.value = false;
  }
};

/* ---------- DETAIL: fetch & open ---------- */
const openDetail = async (assetId) => {
  detailModal.value = true;
  detail.value = null;
  detailLoading.value = true;
  detailError.value = "";

  try {
    const res = await axios.get(`${apiBaseUrl}/assets/${assetId}`, {
      headers: getAuthHeaders(),
    });

    // API format: { success: true, data: { ... } }
    const d = res?.data?.data ?? res?.data ?? null;

    // Normalize images -> media (always an array of URLs)
    const imgs = Array.isArray(d?.images)
      ? d.images.filter(Boolean)
      : (d?.images ? [d.images] : []);

    // Optional: coerce some fields (safety)
    const normalized = {
      ...d,
      media: imgs,                                    // used by modal
      is_related_to_it: d?.is_related_to_it ?? null,  // keep null/boolean
      book_value: d?.book_value ?? d?.nbv ?? null,    // fallback if API changes
    };

    detail.value = normalized;
  } catch (e) {
    console.error("Error fetching asset detail:", e);
    detailError.value = e?.response?.data?.message || "Failed to load asset detail.";
  } finally {
    detailLoading.value = false;
  }
};

const fetchDepartments = async () => {
  try {
    const res = await axios.get(`${apiBaseUrl}/departments`, {
      headers: getAuthHeaders(),
    });
    const list = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
      ? res.data.data
      : [];
    departments.value = list.map((d) => ({ id: d.id, name: d.name }));
  } catch (error) {
    console.error("Error fetching departments:", error);
  }
};

const fetchAssetDepartments = async (assetId) => {
  const res = await axios.get(`${apiBaseUrl}/assets/${assetId}/departments`, {
    headers: getAuthHeaders(),
  });

  const attached = Array.isArray(res.data)
    ? res.data
    : Array.isArray(res.data?.data)
    ? res.data.data
    : [];

  const ids = attached.map((d) => d.id);
  selectedDepartments.value = ids;
  originalAssigned.value = [...ids];
};

/* ---------------- Modal handlers ---------------- */
const openDepartmentModal = async (assetId) => {
  try {
    departmentsLoading.value = true;
    currentAssetId.value = assetId;
    selectedDepartments.value = [];
    originalAssigned.value = [];

    await fetchDepartments();
    await fetchAssetDepartments(assetId);

    departmentModal.value = true;
  } catch (e) {
    console.error("Error preparing department modal:", e);
    alert(e.response?.data?.message || "Failed to prepare department selection.");
  } finally {
    departmentsLoading.value = false;
  }
};

// Save = attach new + detach removed
const assignDepartments = async () => {
  if (!currentAssetId.value) return;

  const headers = getAuthHeaders();
  const current = [...new Set(selectedDepartments.value)];
  const prev = originalAssigned.value;

  const toAdd = current.filter((id) => !prev.includes(id));
  const toRemove = prev.filter((id) => !current.includes(id));

  try {
    if (!toAdd.length && !toRemove.length) {
      departmentModal.value = false;
      return;
    }

    const jobs = [];

    if (toAdd.length) {
      jobs.push(
        axios.post(
          `${apiBaseUrl}/assets/${currentAssetId.value}/departments`,
          { department_ids: toAdd },
          { headers }
        )
      );
    }

    for (const depId of toRemove) {
      jobs.push(
        axios.delete(
          `${apiBaseUrl}/assets/${currentAssetId.value}/departments/${depId}`,
          { headers }
        )
      );
    }

    await Promise.all(jobs);

    originalAssigned.value = [...current];
    alert("Departments updated successfully!");
    departmentModal.value = false;
  } catch (error) {
    console.error("Error updating departments:", error);
    if (error.response?.status === 422 && error.response.data?.errors) {
      const errs = error.response.data.errors;
      const firstMsg = Object.values(errs)[0]?.[0] || "Validation error.";
      alert(firstMsg);
    } else {
      alert(error.response?.data?.message || "Failed to update departments.");
    }
  }
};

onMounted(fetchAssets);

/* ---------------- Mutations ---------------- */
const deleteAsset = async (id) => {
  if (!confirm("Are you sure you want to delete this asset?")) return;

  try {
    await axios.delete(`${apiBaseUrl}/assets/${id}`, {
      headers: getAuthHeaders(),
    });

    assets.value = assets.value.filter((row) => row.id !== id);
    alert("Asset deleted successfully!");
  } catch (err) {
    console.error("Error deleting asset:", err);
    alert(err.response?.data?.message || "Failed to delete asset.");
  }
};
</script>

<style>
.v-data-table { margin-block-start: 16px; }
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.ms-auto { margin-inline-start: auto; }
.gap-2 { gap: 8px; }
.mb-4 { margin-block-end: 16px; }
.text-error { color: #c62828; }

/* Detail modal layout */
.detail-grid {
  display: grid;
  gap: 12px 24px;
  grid-template-columns: 1fr 1fr;
}

.grid-left,
.grid-right { display: grid; gap: 8px; }
.kv { display: grid; gap: 8px; grid-template-columns: 180px 1fr; }
.k { color: rgba(0, 0, 0, 60%); font-weight: 600; }
.v { word-break: break-word; }

.media-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
}
.media-item { overflow: hidden; border-radius: 8px; }
</style>
