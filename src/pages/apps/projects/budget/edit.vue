<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <h3>Edit Budget</h3>
    </div>

    <VCard class="pa-4 mt-5">
      <VForm @submit.prevent="saveBudget">
        <VRow dense>

          <!-- Category -->
          <VCol cols="12" md="3">
            <VSelect
              v-model="selectedCategoryId"
              :items="parentCategoryItems"
              item-title="title"
              item-value="id"
              label="Select Asset Category"
              :loading="loading.categories || loading.form"
              :disabled="loading.categories || loading.form"
              @update:modelValue="onCategoryChange"
              variant="outlined"
              clearable
              hide-details="auto"
            />
          </VCol>

          <!-- Subcategory -->
          <VCol cols="12" md="3">
            <VSelect
              v-model="selectedSubCategoryId"
              :items="subcategoryItemsForCategory"
              item-title="title"
              item-value="id"
              label="Select Sub Asset Category"
              :disabled="!selectedCategoryId || loading.form"
              @update:modelValue="onSubCategoryChange"
              variant="outlined"
              clearable
              hide-details="auto"
            />
          </VCol>

          <!-- Amount -->
          <VCol cols="12" md="2">
            <VTextField
              v-model.number="amount"
              label="Budget Amount"
              type="number"
              prefix="SAR"
              min="0"
              step="0.01"
              variant="outlined"
              hide-details="auto"
              :disabled="loading.form"
            />
          </VCol>

          <!-- Asset Description -->
          <VCol cols="12" md="12">
            <VTextField
              v-model="assetDescription"
              label="Other Asset Request"
              variant="outlined"
              clearable
              hide-details="auto"
              :disabled="loading.form"
            />
          </VCol>

          <!-- Save Button -->
          <VCol cols="12" class="d-flex justify-end mt-4">
            <VBtn variant="text" @click="$router.back()" :disabled="saving || loading.form">Cancel</VBtn>

            <VBtn
              color="primary"
              class="ml-2"
              @click="saveBudget"
              :loading="saving"
              :disabled="!isFormValid || loading.form"
            >
              Save Changes
            </VBtn>
          </VCol>

        </VRow>

        <VAlert
          v-if="formError"
          type="error"
          variant="tonal"
          class="mt-4"
        >
          {{ formError }}
        </VAlert>

      </VForm>
    </VCard>
  </div>
</template>


<script setup>
import axios from "axios";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const projectId = computed(() => route.params.id ?? route.params.projectId ?? route.query.projectId);
const budgetId  = computed(() => route.params.budgetId ?? route.params.bid ?? route.params.budget_id ?? route.params.budget ?? route.query.budgetId);

// ---------- state ----------
const loading = ref({ categories: false, assets: false, form: false });
const saving  = ref(false);
const formError = ref("");

// categories
const allCategories = ref([]);        // raw from /asset-categories
const parentCategoryItems = computed(() =>
  allCategories.value
    .filter(c => c.is_parent)
    .map(c => ({ id: Number(c.id), title: String(c.title ?? c.slug ?? `Category #${c.id}`) }))
);
const subcategoryItemsForCategory = computed(() => {
  if (!selectedCategoryId.value) return [];
  return allCategories.value
    .filter(c => !c.is_parent && Number(c.parent_id) === Number(selectedCategoryId.value))
    .map(c => ({ id: Number(c.id), title: String(c.title ?? c.slug ?? `Subcategory #${c.id}`) }));
});
const nameById = (id) => {
  const c = allCategories.value.find(x => Number(x.id) === Number(id));
  return c?.title ?? c?.slug ?? `#${id}`;
};

function formatAmount(val) {
  if (val === null || val === undefined || val === "") return "-";
  const num = Number(val);
  if (Number.isNaN(num)) return String(val);
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// form fields
const selectedCategoryId    = ref(null);
const selectedSubCategoryId = ref(null);
const selectedAsset         = ref(null); // full object or null
const assets                = ref([]);   // assets for current subcategory
const amount                = ref(0);
const quantity              = ref(1);
const assetDescription      = ref("");

// ---------- helpers ----------
const getAuthHeaders = () => {
  const access = getCookie("accessToken");
  if (!access) throw new Error("Access token is missing. Please log in.");
  return { Authorization: `Bearer ${decodeURIComponent(access)}`, Accept: "application/json", "Content-Type": "application/json" };
};
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

// ---------- api ----------
const fetchCategories = async () => {
  loading.value.categories = true;
  try {
    const res = await axios.get(`${apiBaseUrl}/asset-categories`, { headers: getAuthHeaders() });
    const list = res.data?.categories ?? res.data?.data ?? res.data ?? [];
    allCategories.value = Array.isArray(list) ? list : [];
  } finally {
    loading.value.categories = false;
  }
};

const fetchAssetsBySub = async (subId) => {
  loading.value.assets = true;
  try {
    const res = await axios.get(`${apiBaseUrl}/assets`, {
      params: { asset_sub_category_id: subId, asset_subcategory_id: subId }, // support both spellings
      headers: getAuthHeaders(),
    });
    const list = res.data?.data?.data ?? res.data?.data ?? res.data ?? [];
    assets.value = Array.isArray(list) ? list : [];
  } finally {
    loading.value.assets = false;
  }
};

const fetchBudget = async () => {
  formError.value = "";
  loading.value.form = true;
  try {
    const res = await axios.get(`${apiBaseUrl}/project-budgets/${budgetId.value}`, { headers: getAuthHeaders() });
    const b = Array.isArray(res.data) ? res.data[0]
            : (Array.isArray(res.data?.data) ? res.data.data[0]
            : (res.data?.data ?? res.data));

    if (!b) throw new Error("Budget not found.");

    // prefill
    const catId   = Number(b.asset_category_id ?? b.category?.id);
    const subId   = Number(b.asset_subcategory_id ?? b.asset_sub_category_id ?? b.subcategory?.id);
    const assetId = Number(b.asset_id ?? b.asset?.id);
    const amt     = Number(b.amount ?? 0);
    const qty     = Number(b.quantity ?? 1);
    const desc    = b.asset_description ?? "";

    selectedCategoryId.value    = catId || null;
    selectedSubCategoryId.value = subId || null;
    amount.value                = Number.isFinite(amt) ? amt : 0;
    quantity.value              = Number.isFinite(qty) && qty > 0 ? qty : 1;
    assetDescription.value      = typeof desc === "string" ? desc : "";

    // load assets of subcategory, then select the asset (optional)
    if (selectedSubCategoryId.value) {
      await fetchAssetsBySub(selectedSubCategoryId.value);
      selectedAsset.value = assets.value.find(a => Number(a.id) === assetId)
        || (assetId ? { id: assetId, code: b.asset?.code ?? `#${assetId}` } : null);
    }
  } catch (e) {
    console.error(e);
    formError.value = e?.response?.data?.message || e.message || "Failed to load budget.";
  } finally {
    loading.value.form = false;
  }
};

// ---------- events ----------
const onCategoryChange = () => {
  selectedSubCategoryId.value = null;
  selectedAsset.value = null;
  assets.value = [];
};
const onSubCategoryChange = async (val) => {
  selectedAsset.value = null;
  assets.value = [];
  if (val) await fetchAssetsBySub(val);
};

// ---------- save ----------
const isFormValid = computed(() =>
  !!(projectId.value
     && budgetId.value
     && selectedCategoryId.value
     && selectedSubCategoryId.value
     && Number(amount.value) >= 0
     && Number(quantity.value || 0) > 0)
  // NOTE: selectedAsset is OPTIONAL
);

const saveBudget = async () => {
  if (!isFormValid.value) return;

  saving.value = true;
  formError.value = "";
  try {
    const payload = {
      project_id: Number(projectId.value),
      asset_category_id: Number(selectedCategoryId.value),
      asset_subcategory_id: Number(selectedSubCategoryId.value),
      amount: Number(amount.value),
      asset_description: assetDescription.value?.trim() || null // NEW
    };

    // Try PUT, fallback to PATCH if necessary
    try {
      await axios.put(`${apiBaseUrl}/project-budgets/${budgetId.value}`, payload, { headers: getAuthHeaders() });
    } catch (err) {
      if (err?.response?.status === 405) {
        await axios.patch(`${apiBaseUrl}/project-budgets/${budgetId.value}`, payload, { headers: getAuthHeaders() });
      } else {
        throw err;
      }
    }

    // Success → go back to budgets list
    router.push(`/dashboards/projects/${projectId.value}/budgets`);
  } catch (e) {
    const msg  = e?.response?.data?.message;
    const errs = e?.response?.data?.errors;
    let friendly = msg || "Failed to update budget.";
    if (errs && typeof errs === "object") friendly += "\n" + Object.values(errs).flat().join("\n");
    formError.value = friendly;
    alert(friendly);
    console.error("Update error:", e?.response ?? e);
  } finally {
    saving.value = false;
  }
};

// ---------- init ----------
onMounted(async () => {
  if (!projectId.value || !budgetId.value) {
    formError.value = "Invalid route: project or budget id missing.";
    return;
  }
  await fetchCategories();
  await fetchBudget();
});
</script>

<style scoped>
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.gap-2 { gap: 8px; }
.mb-4 { margin-block-end: 16px; }
.text-medium-emphasis { opacity: 0.7; }

@media (min-width: 960px) { .pa-4 { padding: 24px !important; } }
</style>
