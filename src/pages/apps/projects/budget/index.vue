<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <div>
        <h3 class="mb-1">Budgets List</h3>
        <p v-if="project" class="text-sm text-gray">
          <strong>Project:</strong> {{ project.name }} &nbsp; | &nbsp;
          <strong>Code:</strong> {{ project.project_code }}
        </p>
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

      <template v-slot:item.actions="{ item }">
            <div class="d-flex gap-2">
              <VBtn color="primary" size="small" @click="viewDetails(item)">
                Details
              </VBtn>

              <!-- <VBtn color="primary" size="small" @click="editBudget(item.id)">
                Edit
              </VBtn> -->

              <VBtn color="error" size="small" @click="deleteBudget(item.id)">
                Delete
              </VBtn>
            </div>
          </template>

    </VDataTable>


      <!-- Budget Details Dialog -->
      
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

    <VDialog v-model="detailsDialog" max-width="600px">
        <VCard>
          <VCardTitle class="font-weight-bold">
            Budget Details
          </VCardTitle>

          <VCardText>
            <div class="mb-2"><strong>ID:</strong> {{ selectedBudget?.id }}</div>
            <div class="mb-2"><strong>Category:</strong> {{ selectedBudget?.category }}</div>
            <div class="mb-2"><strong>Subcategory:</strong> {{ selectedBudget?.subcategory }}</div>
            <div class="mb-2"><strong>Amount (SAR):</strong> {{ formatAmount(selectedBudget?.amount) }}</div>
            <div class="mb-2"><strong>Created At:</strong> {{ selectedBudget?.created_at }}</div>

            <div class="mt-4">
              <strong>Description:</strong>
              <div class="mt-1 pa-2 bg-grey-lighten-4 rounded border text-sm">
                {{ selectedBudget?.asset_description || '—' }}
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
  { title: "BUDGET ID", key: "id", sortable: true },
  { title: "CATEGORY", key: "category", sortable: true },
  { title: "SUBCATEGORY", key: "subcategory", sortable: true },
  { title: "AMOUNT (SAR)", key: "amount", sortable: true },
  { title: "CREATED AT", key: "created_at", sortable: true },
  { title: "ACTIONS", key: "actions", sortable: false },
];

const budgets = ref([]);
const project = ref(null);
const loading = ref(true);
const errorMessage = ref("");

const detailsDialog = ref(false);
const selectedBudget = ref(null);

const viewDetails = (item) => {
  selectedBudget.value = item;
  detailsDialog.value = true;
};

const mappedBudgets = computed(() =>
  (budgets.value || []).map(b => ({
    id: b.id,
    category: b.asset_category_name ?? "-",
    subcategory: b.asset_subcategory_name ?? "-",
    asset_description: b.asset_description ?? "—",
    amount: b.amount,
    created_at: b.created_at,
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
    budgets.value = Array.isArray(res.data)
      ? res.data
      : (res.data?.data ?? []);
  } catch (e) {
    errorMessage.value =
      e.response?.data?.message || "Failed to fetch budgets.";
  } finally {
    loading.value = false;
  }
};

// ✅ Fetch project details
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
  await fetchBudgets();
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

function formatAmount(val) {
  if (val === null || val === undefined || val === "") return "-";
  const num = Number(val);
  if (Number.isNaN(num)) return String(val);
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
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
.text-sm { font-size: 0.9rem; }
.text-gray { color: #aaa; }
</style>
