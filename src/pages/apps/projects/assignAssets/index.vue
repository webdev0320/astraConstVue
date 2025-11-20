<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <div>
        <h3 class="mb-1">Assets List</h3>
        <p v-if="project" class="text-sm text-gray">
          <strong>Project:</strong> {{ project.name }} &nbsp; | &nbsp;
          <strong>Code:</strong> {{ project.project_code }}
        </p>
      </div>

      <VBtn
        color="primary"
        @click="$router.push(`/dashboards/projects/${projectId}/assignAssets/create`)"
      >
        Add Asset
      </VBtn>
    </div>

    <!-- Loading -->
    <p v-if="loading">Loading...</p>

    <!-- Error -->
    <p v-else-if="errorMessage" class="text-error">{{ errorMessage }}</p>

    <!-- Table -->
    <VDataTable
      v-else-if="mappedAssets.length > 0"
      :headers="headers"
      :items="mappedAssets"
      :items-per-page="10"
    >
      <template #item.quantity="{ item }">
        {{ item.quantity ?? 0 }}
      </template>

      <template #item.created_at="{ item }">
        {{ formatDateTime(item.created_at) }}
      </template>

      <template v-slot:item.actions="{ item }">
        <div class="d-flex gap-2">
          <VBtn color="error" size="small" @click="deleteAsset(item.id)">
            Delete
          </VBtn>
        </div>
      </template>
    </VDataTable>

    <!-- Empty state -->
    <VCard v-else class="mt-6 pa-6 text-center" variant="tonal">
      <VCardTitle>No assets found</VCardTitle>
      <VCardText>
        This project does not have any assets yet. Add an asset to get started.
      </VCardText>
      <VBtn
        color="primary"
        @click="$router.push(`/dashboards/projects/${projectId}/assignAssets/create`)"
      >
        Add Asset
      </VBtn>
    </VCard>

    <VDialog v-model="detailsDialog" max-width="600px">
      <VCard>
        <VCardTitle class="font-weight-bold">
          Asset Details
        </VCardTitle>

        <VCardText>
          <div class="mb-2"><strong>ID:</strong> {{ selectedAsset?.id }}</div>
          <div class="mb-2"><strong>Asset Title:</strong> {{ selectedAsset?.asset_title }}</div>
          <div class="mb-2"><strong>Quantity:</strong> {{ selectedAsset?.quantity ?? 0 }}</div>
          <div class="mb-2"><strong>Created At:</strong> {{ formatDateTime(selectedAsset?.created_at) }}</div>

          <div class="mt-4">
            <strong>Description:</strong>
            <div class="mt-1 pa-2 bg-grey-lighten-4 rounded border text-sm">
              {{ selectedAsset?.asset_description || '—' }}
            </div>
          </div>
        </VCardText>

        <VCardActions>
          <VBtn color="primary" block @click="detailsDialog = false">
            Close
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup>
import axios from "axios";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { VBtn, VCard, VCardText, VCardTitle, VDataTable } from "vuetify/components";
import { VDialog, VCardActions } from "vuetify/components";

const route = useRoute();
const router = useRouter();

const projectId = computed(() => route.params.id);

const headers = [
  { title: "ID", key: "id", sortable: true },
  { title: "Category", key: "category_name", sortable: true },
  { title: "Subcategory", key: "sub_category_name", sortable: true },
  { title: "Asset", key: "asset_title", sortable: true },
  { title: "Quantity", key: "quantity", sortable: true },
  { title: "Actions", key: "actions", sortable: false },
];


const assets = ref([]);
const project = ref(null);
const loading = ref(true);
const errorMessage = ref("");

const detailsDialog = ref(false);
const selectedAsset = ref(null);

const viewDetails = (item) => {
  selectedAsset.value = item;
  detailsDialog.value = true;
};


const mappedAssets = computed(() =>
  (assets.value || []).map(a => ({
    id: a.id,
    asset_id: a.asset_id,
    category_name: a.asset?.category?.title ?? "-",
    sub_category_name: a.asset?.sub_category?.title ?? "-",
    asset_title: a.asset ? `${a.asset.title} - ${a.asset.code}` : "-",
    quantity: a.quantity ?? 0,
    created_at: a.created_at,
    asset_description: a.asset?.description ?? null,
    raw: a, // keep full object if needed later
  }))
);

// Fetch assets for the project from /api/projects/:project/get-assets
const fetchAssets = async () => {
  if (!projectId.value) {
    errorMessage.value = "Project ID is missing in the route.";
    loading.value = false;
    return;
  }

  loading.value = true;
  errorMessage.value = "";
  try {
    // adapt base url if your VITE env differs
    const res = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/projects/${encodeURIComponent(projectId.value)}/get-assets`,
      { headers: getAuthHeaders() }
    );

    // your response shape has `data` array
    assets.value = Array.isArray(res.data?.data) ? res.data.data : [];
  } catch (e) {
    errorMessage.value =
      e.response?.data?.message || "Failed to fetch assets.";
    console.error(e);
  } finally {
    loading.value = false;
  }
};

// ✅ Fetch project details (unchanged)
const fetchProjectDetails = async () => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/projects/${encodeURIComponent(projectId.value)}`,
      { headers: getAuthHeaders() }
    );
    project.value = res.data.data || res.data;
  } catch (e) {
    console.error("Failed to load project details:", e);
  }
};

onMounted(async () => {
  await fetchProjectDetails();
  await fetchAssets();
});

const getAuthHeaders = () => {
  const access = getCookie("accessToken");
  if (!access)
    throw new Error("Access token is missing. Please log in.");
  return {
    Authorization: `Bearer ${decodeURIComponent(access)}`,
    Accept: "application/json",
  };
};

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

function formatDateTime(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

const deleteAsset = async (id) => {
  if (!confirm("Are you sure you want to delete this asset?")) return;
  try {
    await axios.delete(
      `${import.meta.env.VITE_API_BASE_URL}/project-assets/${id}`,
      { headers: getAuthHeaders() }
    );
    await fetchAssets();
    alert("Asset deleted successfully!");
  } catch (e) {
    alert(e.response?.data?.message || "Failed to delete asset.");
  }
};
</script>

<style scoped>
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.gap-2 { gap: 8px; }
.mb-4 { margin-block-end: 16px; }
.text-error { color: #c62828; }
.text-sm { font-size: 0.9rem; }
.text-gray { color: #aaa; }
</style>
