<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <VBtn variant="text" @click="$router.back()">← Back</VBtn>
      <h3>Create Budget</h3>
    </div>

    <VCard class="pa-4">
      <VForm @submit.prevent="saveAllBudgets">
        <VRow dense>
          <!-- Category -->
          <VCol cols="12" md="4">
            <VSelect
              v-model="selectedCategoryId"
              :items="parentCategoryItems"
              item-title="title"
              item-value="id"
              label="Select Asset Category"
              :loading="loading.categories"
              :disabled="loading.categories"
              @update:modelValue="onCategoryChange"
              hide-details="auto"
              variant="outlined"
              density="compact"
              clearable
            />
            <small class="text-medium-emphasis">Category choose karen → subcategories load hongi</small>
          </VCol>

          <!-- Subcategory (from categories list, normalized to {id,title}) -->
          <VCol cols="12" md="4">
            <VSelect
              v-model="selectedSubCategoryId"
              :items="subcategoryItemsForCategory"
              item-title="title"
              item-value="id"
              label="Select Sub Asset Category"
              :disabled="!selectedCategoryId"
              @update:modelValue="onSubCategoryChange"
              hide-details="auto"
              variant="outlined"
              density="compact"
              clearable
            />
            <small class="text-medium-emphasis">Selected category ki related subcategories</small>
          </VCol>

          <!-- Asset -->
          <VCol cols="12" md="4">
            <VSelect
              v-model="selectedAsset"
              :items="assets"
              item-title="code"
              item-value="id"
              label="Select Asset"
              :loading="loading.assets"
              :disabled="!selectedSubCategoryId || loading.assets"
              return-object
              hide-details="auto"
              variant="outlined"
              density="compact"
              clearable
            />
            <small class="text-medium-emphasis">Selected subcategory ke assets</small>
          </VCol>

          <!-- Amount -->
          <VCol cols="12" md="4">
            <VTextField
              v-model.number="budget.amount"
              label="Budget Amount"
              type="number"
              min="0"
              step="0.01"
              prefix="Rs"
              variant="outlined"
              density="compact"
              hide-details="auto"
            />
          </VCol>

          <!-- Add Button -->
          <VCol cols="12" md="4" class="d-flex align-end">
            <VBtn color="primary" @click="addBudgetRecord" :disabled="!isFormValid">
              Add Budget
            </VBtn>
          </VCol>

          <!-- Summary -->
          <VCol cols="12" md="4" class="d-flex align-end justify-end">
            <div class="text-end">
              <div class="text-medium-emphasis">Records: <b>{{ budgetRecords.length }}</b></div>
              <div class="text-medium-emphasis">Total: <b>{{ formatAmount(totalAmount) }}</b></div>
            </div>
          </VCol>
        </VRow>

        <!-- Chips -->
        <div v-if="budgetRecords.length" class="mt-4">
          <VChip
            v-for="(r, idx) in budgetRecords"
            :key="idx"
            class="ma-1"
            closable
            @click:close="removeBudgetRecord(r)"
          >
            {{ r.asset_code }} — {{ formatAmount(r.amount) }}
          </VChip>
        </div>

        <!-- Table -->
        <VDataTable
          v-if="budgetRecords.length"
          :headers="headers"
          :items="budgetRecords"
          :items-per-page="5"
          class="mt-4"
        >
          <template #item.amount="{ item }">
            {{ formatAmount(item.amount) }}
          </template>
          <template #item.actions="{ item }">
            <VBtn color="error" size="small" @click="removeBudgetRecord(item)">
              Delete
            </VBtn>
          </template>
        </VDataTable>

        <!-- Save -->
        <div class="d-flex gap-2 mt-4">
          <VBtn color="primary" @click="saveAllBudgets" :loading="saving" :disabled="!budgetRecords.length">
            Save All Budgets
          </VBtn>
          <VBtn variant="text" @click="clearAll" :disabled="!budgetRecords.length">Clear</VBtn>
        </div>
      </VForm>
    </VCard>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const route = useRoute();
const projectId = computed(() => route.params.id ?? route.params.projectId ?? route.query.projectId);

// ---------------- State ----------------
const allCategories = ref([]);     // raw list from /asset-categories
const loading = ref({ categories: false, assets: false });

const selectedCategoryId = ref(null);     // id only (to avoid [object Object])
const selectedSubCategoryId = ref(null);  // id only
const selectedAsset = ref(null);          // full object
const assets = ref([]);

const budget = ref({ amount: 0 });
const budgetRecords = ref([]);
const saving = ref(false);

// ------------- Headers (use names, not IDs) -------------
const headers = [
  { title: "Asset Code", key: "asset_code" },
  { title: "Category", key: "category_name" },
  { title: "Subcategory", key: "subcategory_name" },
  { title: "Amount", key: "amount" },
  { title: "Actions", key: "actions", sortable: false },
];

// ------------- Fetch Categories -------------
const fetchAssetCategories = async () => {
  loading.value.categories = true;
  try {
    const res = await axios.get(`${apiBaseUrl}/asset-categories`, { headers: getAuthHeaders() });
    const list = res.data?.categories ?? res.data?.data ?? res.data ?? [];
    allCategories.value = Array.isArray(list) ? list : [];
  } catch (e) {
    console.error(e);
  } finally {
    loading.value.categories = false;
  }
};

// Normalize: parents as [{id,title}]
const parentCategoryItems = computed(() =>
  allCategories.value
    .filter(c => c.is_parent)
    .map(c => ({ id: Number(c.id), title: String(c.title ?? c.slug ?? `Category #${c.id}`) }))
);

// Normalize: children of selected parent as [{id,title}]
const subcategoryItemsForCategory = computed(() => {
  if (!selectedCategoryId.value) return [];
  return allCategories.value
    .filter(c => !c.is_parent && Number(c.parent_id) === Number(selectedCategoryId.value))
    .map(c => ({ id: Number(c.id), title: String(c.title ?? c.slug ?? `Subcategory #${c.id}`) }));
});

// Handy name lookups
const categoryNameById = (id) => {
  const c = allCategories.value.find(x => Number(x.id) === Number(id));
  return c?.title ?? c?.slug ?? `Category #${id}`;
};
const subcategoryNameById = (id) => {
  const c = allCategories.value.find(x => Number(x.id) === Number(id));
  return c?.title ?? c?.slug ?? `Subcategory #${id}`;
};

// ------------- Events -------------
const onCategoryChange = async () => {
  selectedSubCategoryId.value = null;
  selectedAsset.value = null;
  assets.value = [];
};

const onSubCategoryChange = async (val) => {
  selectedAsset.value = null;
  assets.value = [];
  if (!val) return;
  await fetchAssetsBySubCategory(val);
};

// ------------- Fetch Assets by Subcategory -------------
const fetchAssetsBySubCategory = async (subId) => {
  loading.value.assets = true;
  try {
    // accept both param spellings
    const res = await axios.get(`${apiBaseUrl}/assets`, {
      params: { asset_sub_category_id: subId, asset_subcategory_id: subId },
      headers: getAuthHeaders(),
    });
    const list = res.data?.data?.data ?? res.data?.data ?? res.data ?? [];
    assets.value = Array.isArray(list) ? list : [];
  } catch (e) {
    console.error(e);
    assets.value = [];
  } finally {
    loading.value.assets = false;
  }
};

// ------------- Auth helpers -------------
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

// ------------- Actions -------------
const addBudgetRecord = () => {
  if (!selectedAsset.value || !selectedCategoryId.value || !selectedSubCategoryId.value || !budget.value.amount) return;

  const a = selectedAsset.value;

  const existing = budgetRecords.value.find(r => r.asset_id === a.id);
  if (existing) {
    existing.amount = Number(existing.amount) + Number(budget.value.amount);
  } else {
    budgetRecords.value.push({
      project_id: Number(projectId.value),
      asset_id: a.id,
      asset_category_id: Number(selectedCategoryId.value),
      asset_subcategory_id: Number(selectedSubCategoryId.value),   // response-style
      asset_sub_category_id: Number(selectedSubCategoryId.value),  // request-style (just in case)
      amount: Number(budget.value.amount),

      // UI only
      asset_code: a.code,
      category_name: categoryNameById(selectedCategoryId.value),
      subcategory_name: subcategoryNameById(selectedSubCategoryId.value),
    });
  }

  selectedAsset.value = null;
  budget.value.amount = 0;
};


const removeBudgetRecord = (item) => {
  budgetRecords.value = budgetRecords.value.filter(r => r !== item);
};

const clearAll = () => { budgetRecords.value = []; };

// ------------- Save: POST /api/project-budgets -------------
const saveAllBudgets = async () => {
  if (!budgetRecords.value.length) return;
  saving.value = true;
  try {
  const pid = Number(projectId.value);
  const budgetsPayload = budgetRecords.value.map(r => ({
    project_id: Number(r.project_id ?? pid),
    asset_id: Number(r.asset_id),
    asset_category_id: Number(r.asset_category_id),
    asset_subcategory_id: Number(r.asset_subcategory_id),
    asset_sub_category_id: Number(r.asset_sub_category_id), // if backend expects this key
    amount: Number(r.amount),
  }));

    const payload = {
    project_id: Number(projectId.value),
      budgets: budgetsPayload,
    };

    const res = await axios.post(`${apiBaseUrl}/project-budgets`, payload, {
      headers: getAuthHeaders(),
    });

    const ok = Array.isArray(res.data?.data) && res.data.data.length > 0;
    alert(ok ? "All budgets saved successfully!" : res.data?.message ?? "Saved.");
    clearAll();
  } catch (e) {
    const msg = e?.response?.data?.message;
    const errs = e?.response?.data?.errors;
    let friendly = msg || "Failed to save budgets.";
    if (errs && typeof errs === "object") friendly += "\n" + Object.values(errs).flat().join("\n");
    alert(friendly);
    console.error("Save error:", e?.response ?? e);
  } finally {
    saving.value = false;
  }
};


// ------------- Validation + totals -------------
const isFormValid = computed(() =>
  !!(selectedCategoryId.value && selectedSubCategoryId.value && selectedAsset.value && Number(budget.value.amount) > 0)
);
const totalAmount = computed(() =>
  budgetRecords.value.reduce((sum, r) => sum + Number(r.amount || 0), 0)
);

function formatAmount(val) {
  if (val === null || val === undefined || val === "") return "-";
  const num = Number(val);
  if (Number.isNaN(num)) return String(val);
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ------------- Init -------------
fetchAssetCategories();
</script>

<style scoped>
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.gap-2 { gap: 8px; }
.mb-4 { margin-bottom: 16px; }
.text-medium-emphasis { opacity: .7; }
@media (min-width: 960px) { .pa-4 { padding: 24px !important; } }
</style>
