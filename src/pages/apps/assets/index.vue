<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <h3>Assets List</h3>
      <VBtn color="primary" class="ms-auto" @click="$router.push('/dashboards/assets/create')">
        Create Asset
      </VBtn>
    </div>

    <VDataTable
      v-if="assets.length > 0"
      :headers="headers"
      :items="assets"
      :items-per-page="10"
    >
      <template #item.actions="{ item }">
        <div class="d-flex gap-2">
          <VBtn color="info" size="small" @click="openDepartmentModal(item.id)">
            Add Department
          </VBtn>
          <VBtn color="warning" size="small" @click="$router.push(`/dashboards/assets/edit/${item.id}`)">
            Edit
          </VBtn>
          <VBtn color="error" size="small" @click="deleteAsset(item.id)">
            Delete
          </VBtn>
        </div>
      </template>
    </VDataTable>

    <p v-else-if="errorMessage">{{ errorMessage }}</p>
    <p v-else>Loading...</p>

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
import { ref, onMounted } from "vue";
import {
  VBtn,
  VDataTable,
  VDialog,
  VCard,
  VCardTitle,
  VCardText,
  VCardActions,
  VSelect
} from "vuetify/components";

const apiBaseUrl = "https://dm.kreashionsoftwarehouse.com/astraConst/public/api";

// ---- Table headers ----
const headers = [
  { title: "ID", key: "id" },
  { title: "CODE", key: "code" },
  { title: "TYPE", key: "type" },
  { title: "ASSET TYPE", key: "asset_type" },
  { title: "CATEGORY ID", key: "asset_category_id" },
  { title: "SUB CATEGORY ID", key: "asset_sub_category_id" },
  { title: "MAKE", key: "make" },
  { title: "SERIAL #", key: "serial_number" },
  { title: "INSURANCE START", key: "insurance_start_date" },
  { title: "WARRANTY START", key: "warranty_start_date" },
  { title: "EXT. WARRANTY", key: "extended_warranty" },
  { title: "PURCHASE DATE", key: "purchase_date" },
  { title: "ACTIONS", key: "actions", sortable: false },
];

const assets = ref([]);
const errorMessage = ref("");

// Departments modal state
const departmentModal = ref(false);
const departments = ref([]);            // [{id, name}]
const selectedDepartments = ref([]);    // [ids] (UI selection)
const originalAssigned = ref([]);       // [ids] (snapshot on open)
const currentAssetId = ref(null);
const departmentsLoading = ref(false);

const page = ref(1);

// ---------------- Utils ----------------
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

// ---------------- Fetchers ----------------
const fetchAssets = async () => {
  try {
    const res = await axios.get(`${apiBaseUrl}/assets`, {
      headers: getAuthHeaders(),
      params: { page: page.value },
    });

    const rows = res?.data?.data?.data ?? [];

    assets.value = rows.map((a) => ({
      id: a.id,
      code: a.code,
      type: a.type,
      asset_type: a.asset_type,
      asset_category_id: a.asset_category_id,
      asset_sub_category_id: a.asset_sub_category_id,
      make: a.make ?? "—",
      serial_number: a.serial_number ?? "—",
      insurance_start_date: a.insurance_start_date ?? "—",
      warranty_start_date: a.warranty_start_date ?? "—",
      extended_warranty: a.extended_warranty ?? "—",
      purchase_date: a.purchase_date ?? "—",
    }));
  } catch (err) {
    console.error("Error fetching assets:", err);
    errorMessage.value = err.response?.data?.message || "Failed to fetch assets.";
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

// ---------------- Modal handlers ----------------
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

// ---------------- Mutations ----------------
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
.v-data-table { margin-top: 16px; }
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.ms-auto { margin-left: auto; }
.gap-2 { gap: 8px; }
.mb-4 { margin-bottom: 16px; }
</style>
