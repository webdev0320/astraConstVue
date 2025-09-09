<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <div class="d-flex gap-2 align-center">
        <VBtn variant="text" @click="$router.back()">← Back</VBtn>
        <h3>Budgets List</h3>
      </div>

      <VBtn
        color="primary"
        @click="$router.push(`/dashboards/projects/${projectId}/budgets/create`)"
      >
        Add Budget
      </VBtn>
    </div>

    <!-- Loading -->
    <p v-if="loading">Loading...</p>

    <!-- Error -->
    <p v-else-if="errorMessage" class="text-error">{{ errorMessage }}</p>

    <!-- Table -->
    <VDataTable
      v-else-if="mappedBudgets.length > 0"
      :headers="headers"
      :items="mappedBudgets"
      :items-per-page="10"
    >
      <template #item.amount="{ item }">
        {{ formatAmount(item.amount) }}
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex gap-2">
          <!--
          <VBtn color="warning" size="small" @click="editBudget(item.id)">
            Edit
          </VBtn>
          -->
          <VBtn color="error" size="small" @click="deleteBudget(item.id)">
            Delete
          </VBtn>
        </div>
      </template>
    </VDataTable>

    <!-- Empty state -->
    <VCard v-else class="mt-6 pa-6 text-center" variant="tonal">
      <VCardTitle>No budgets found</VCardTitle>
      <VCardText>
        This project does not have any budgets yet. Add a budget to get started.
      </VCardText>
      <VBtn
        color="primary"
        @click="$router.push(`/dashboards/projects/${projectId}/budgets/create`)"
      >
        Add Budget
      </VBtn>
    </VCard>
  </div>
</template>

<script setup>
import axios from "axios";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  VBtn,
  VCard, VCardText, VCardTitle,
  VDataTable,
} from "vuetify/components";

const route = useRoute();
const router = useRouter();

const projectId = computed(() => route.params.id);

const headers = [
  { title: "ID", key: "id", sortable: true },
  { title: "CATEGORY", key: "category", sortable: true },
  { title: "SUBCATEGORY", key: "subcategory", sortable: true },
  { title: "ASSET CODE", key: "asset", sortable: true },
  { title: "DESCRIPTION", key: "asset_description", sortable: false }, // NEW
  { title: "QTY", key: "quantity", sortable: true },                   // NEW
  { title: "AMOUNT", key: "amount", sortable: true },
  { title: "CREATED AT", key: "created_at", sortable: true },
  { title: "ACTIONS", key: "actions", sortable: false },
];

const budgets = ref([]);
const loading = ref(true);
const errorMessage = ref("");

// Map nested API fields for table
const mappedBudgets = computed(() =>
  (budgets.value || []).map(b => ({
    id: b.id,
    category: b.category?.title ?? "-",
    subcategory: b.subcategory?.title ?? "-",
    asset: b.asset?.code ?? "-",
    asset_description: b.asset_description ?? "—",                // NEW
    quantity: b.quantity != null ? Number(b.quantity) : 1,       // NEW (default 1)
    amount: b.amount,
    created_at: formatDateTime(b.created_at),
  }))
);

const fetchBudgets = async () => {
  if (!projectId.value) {
    errorMessage.value = "Project ID is missing in the route.";
    loading.value = false;
    return;
  }
  loading.value = true;
  errorMessage.value = "";
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/project-budgets`,
      {
        params: { project_id: projectId.value },
        headers: getAuthHeaders(),
      }
    );
    budgets.value = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
  } catch (e) {
    errorMessage.value = e.response?.data?.message || "Failed to fetch budgets.";
  } finally {
    loading.value = false;
  }
};

onMounted(fetchBudgets);

const getAuthHeaders = () => {
  const access = getCookie("accessToken");
  if (!access) throw new Error("Access token is missing. Please log in.");
  return { Authorization: `Bearer ${decodeURIComponent(access)}`, Accept: "application/json" };
};

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

function formatAmount(val) {
  if (val === null || val === undefined || val === "") return "-";
  const num = Number(val);
  if (Number.isNaN(num)) return String(val);
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDateTime(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

const editBudget = (id) => {
  router.push({
    name: "dashboards-project-budgets-edit",
    params: { id: projectId.value, budgetId: id },
  });
};

const deleteBudget = async (id) => {
  if (!confirm("Are you sure you want to delete this budget?")) return;
  try {
    await axios.delete(
      `${import.meta.env.VITE_API_BASE_URL}/project-budgets/${id}`,
      { headers: getAuthHeaders() }
    );
    await fetchBudgets();
    alert("Budget deleted successfully!");
  } catch (e) {
    alert(e.response?.data?.message || "Failed to delete budget.");
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
</style>
