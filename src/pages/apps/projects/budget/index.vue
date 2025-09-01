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

    <VDataTable
      v-if="!loading && mappedBudgets.length > 0"
      :headers="headers"
      :items="mappedBudgets"
      :items-per-page="10"
    >
      <template #item.actions="{ item }">
        <div class="d-flex gap-2">
          <!-- <VBtn color="warning" size="small" @click="editBudget(item.id)">
            Edit
          </VBtn> -->
          <VBtn color="error" size="small" @click="deleteBudget(item.id)">
            Delete
          </VBtn>
        </div>
      </template>
    </VDataTable>

    <p v-else-if="!loading && errorMessage">{{ errorMessage }}</p>
    <p v-else>Loading...</p>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { VBtn, VDataTable } from "vuetify/components";

const route = useRoute();
const router = useRouter();

const projectId = computed(() => route.params.id);
const budgetId  = computed(() => route.params.budgetId);

const headers = [
  { title: "ID", key: "id", sortable: true },
  { title: "CATEGORY", key: "category", sortable: true },
  { title: "SUBCATEGORY", key: "subcategory", sortable: true },
  { title: "ASSET CODE", key: "asset", sortable: true },
  { title: "AMOUNT", key: "amount", sortable: true },
  { title: "CREATED AT", key: "created_at", sortable: true },
  { title: "ACTIONS", key: "actions", sortable: false },
];

const budgets = ref([]);       // raw API array
const loading = ref(false);
const errorMessage = ref("");

// Map/flatten nested API fields for the table
const mappedBudgets = computed(() =>
  (budgets.value || []).map(b => ({
    id: b.id,
    category: b.category?.title ?? "-",
    subcategory: b.subcategory?.title ?? "-",
    asset: b.asset?.code ?? "-",
    amount: formatAmount(b.amount),
    created_at: formatDateTime(b.created_at),
  }))
);

// Fetch budgets from {{baseUrl}}/api/project-budgets?project_id={id}
const fetchBudgets = async () => {
  if (!projectId.value) {
    errorMessage.value = "Project ID is missing in the route.";
    return;
  }
  loading.value = true;
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/project-budgets`,
      {
        params: { project_id: projectId.value },
        headers: getAuthHeaders(),
      }
    );
    // Your sample shows an array at root:
    // [
    //   { id, project_id, amount, category: {...}, subcategory: {...}, asset: {...}, user: {...} }
    // ]
    budgets.value = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
    errorMessage.value = budgets.value.length ? "" : "No budgets found for this project.";
  } catch (e) {
    errorMessage.value = e.response?.data?.message || "Failed to fetch budgets.";
  } finally {
    loading.value = false;
  }
};

onMounted(fetchBudgets);

// Auth header helpers
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

// Formatters
function formatAmount(val) {
  if (val === null || val === undefined || val === "") return "-";
  const num = Number(val);
  if (Number.isNaN(num)) return String(val);
  // No specific currency provided; keep it generic
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

// Actions
 const editBudget = (id) => {
   router.push({
     name: 'dashboards-project-budgets-edit',
     params: { id: projectId.value, budgetId: id },
   });
 };

// Delete a budget
const deleteBudget = async (id) => {
  if (!confirm("Are you sure you want to delete this budget?")) return;
  try {
    await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/project-budgets/${id}`, { headers: getAuthHeaders() });
    fetchBudgets();  // Refresh after deletion
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
.mb-4 { margin-bottom: 16px; }
</style>
