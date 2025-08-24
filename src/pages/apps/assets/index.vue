<script setup>
import axios from "axios";
import { ref, onMounted } from "vue";
import { VBtn, VDataTable } from "vuetify/components";

const apiBaseUrl = "https://dm.kreashionsoftwarehouse.com/astraConst/public/api";

// ---- Table headers aligned to your API fields ----
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

// (optional) simple pager state if you want to request other pages later
const page = ref(1);

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

const fetchAssets = async () => {
  try {
    const accessToken = getCookie("accessToken");
    if (!accessToken) throw new Error("Access token is missing. Please log in.");
    const decodedToken = decodeURIComponent(accessToken);

    const res = await axios.get(`${apiBaseUrl}/assets`, {
      headers: { Authorization: `Bearer ${decodedToken}` },
      params: { page: page.value }, // keep if you later add pagination controls
    });

    // Laravel paginator shape: { success, data: { data: [...] , ...meta } }
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

onMounted(fetchAssets);

const deleteAsset = async (id) => {
  if (!confirm("Are you sure you want to delete this asset?")) return;

  try {
    const accessToken = getCookie("accessToken");
    const decodedToken = decodeURIComponent(accessToken);

    await axios.delete(`${apiBaseUrl}/assets/${id}`, {
      headers: { Authorization: `Bearer ${decodedToken}` },
    });

    // Refresh list (or just remove locally)
    assets.value = assets.value.filter((row) => row.id !== id);
    alert("Asset deleted successfully!");
  } catch (err) {
    console.error("Error deleting asset:", err);
    alert(err.response?.data?.message || "Failed to delete asset.");
  }
};
</script>

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
  </div>
</template>

<style>
.v-data-table { margin-top: 16px; }
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.ms-auto { margin-left: auto; }
.gap-2 { gap: 8px; }
.mb-4 { margin-bottom: 16px; }
</style>
