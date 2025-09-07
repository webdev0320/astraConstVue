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
          <VCol cols="12" md="3">
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

          <!-- Subcategory -->
          <VCol cols="12" md="3">
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

          <!-- Asset (optional) -->
          <VCol cols="12" md="3">
            <VSelect
              v-model="selectedAsset"
              :items="assets"
              item-title="code"
              item-value="id"
              label="Select Asset (Optional)"
              :loading="loading.assets"
              :disabled="!selectedSubCategoryId || loading.assets"
              return-object
              hide-details="auto"
              variant="outlined"
              density="compact"
              clearable
            />
            <small class="text-medium-emphasis">(Optional) Asset na select karne par bhi record add ho jayega.</small>
          </VCol>

          <!-- Quantity (optional UI; defaults to 1) -->
          <VCol cols="12" md="1">
            <VTextField
              v-model.number="budget.quantity"
              label="Qty"
              type="number"
              min="1"
              step="1"
              variant="outlined"
              density="compact"
              hide-details="auto"
            />
          </VCol>

          <!-- Amount -->
          <VCol cols="12" md="2">
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

          <!-- Asset Description (optional) -->
          <VCol cols="12" md="3">
            <VTextField
              v-model="budget.asset_description"
              label="Asset Description (Optional)"
              variant="outlined"
              density="compact"
              hide-details="auto"
              clearable
            />
          </VCol>

          <!-- Add Button -->
          <VCol cols="12" md="4" class="d-flex align-end">
            <VBtn color="primary" @click="addBudgetRecord" :disabled="!isFormValid">
              Add
            </VBtn>
          </VCol>

          <!-- Summary -->
          <VCol cols="12" md="8" class="d-flex align-end justify-end">
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
            {{ r.asset_code }}{{ r.asset_description ? ` — ${r.asset_description}` : '' }} — Qty: {{ r.quantity }} — {{ formatAmount(r.amount) }}
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
import axios from "axios";
import { computed, ref } from "vue";
// import { useRoute } from "vue-router";
import { useRoute, useRouter } from "vue-router";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const route = useRoute();
const router = useRouter();
const projectId = computed(() => route.params.id ?? route.params.projectId ?? route.query.projectId);

// ---------------- State ----------------
const allCategories = ref([]); // raw list from /asset-categories
const loading = ref({ categories: false, assets: false });

const selectedCategoryId = ref(null);     // id only
const selectedSubCategoryId = ref(null);  // id only
const selectedAsset = ref(null);          // full object or null
const assets = ref([]);

// form bits (quantity default 1; asset_description optional)
const budget = ref({
  amount: 0,
  quantity: 1,
  asset_description: "",
});

const budgetRecords = ref([]);
const saving = ref(false);

// ------------- Headers (use names, not IDs) -------------
const headers = [
  { title: "Asset Code", key: "asset_code" },
  { title: "Category", key: "category_name" },
  { title: "Subcategory", key: "subcategory_name" },
  { title: "Description", key: "asset_description" },
  { title: "Qty", key: "quantity" },
  { title: "Amount", key: "amount" },
  { title: "Actions", key: "actions", sortable: false },
];

// ------------- Fetch Categories -------------
const fetchAssetCategories = async () => {
  loading.value.categories = true;
  try {
    let page = 1;
    let perPage = 15;
    let total = Infinity;
    const acc = [];

    while ((page - 1) * perPage < total) {
      const res = await axios.get(`${apiBaseUrl}/asset-categories`, {
        params: { page },
        headers: getAuthHeaders(),
      });

      const data  = res.data || {};
      const chunk = Array.isArray(data.categories)
        ? data.categories
        : Array.isArray(data.data)
          ? data.data
          : Array.isArray(data) ? data : [];

      acc.push(...chunk);

      total   = Number(data.total_records ?? total);
      perPage = Number(data.perPage ?? perPage);
      if (!chunk.length) break;
      page += 1;
    }

    allCategories.value = acc;
  } catch (e) {
    console.error(e);
    allCategories.value = [];
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
  if (!selectedCategoryId.value || !selectedSubCategoryId.value || !budget.value.amount) return;

  const a = selectedAsset.value || null;
  const qty = Number(budget.value.quantity || 1);
  const desc = (budget.value.asset_description || "").trim();

  // unique merge key so different descriptions don't merge
  const recordKey = [
    selectedCategoryId.value,
    selectedSubCategoryId.value,
    a?.id ?? 'none',
    desc.toLowerCase()
  ].join("|");

  const existing = budgetRecords.value.find(r => r.__key === recordKey);
  if (existing) {
    // same item → amount & quantity dono add ho jayen
    existing.amount   = Number(existing.amount) + Number(budget.value.amount);
    existing.quantity = Number(existing.quantity || 0) + qty;
  } else {
    budgetRecords.value.push({
      __key: recordKey,

      project_id: Number(projectId.value),
      asset_id: a?.id ?? null, // optional
      asset_category_id: Number(selectedCategoryId.value),
      asset_subcategory_id: Number(selectedSubCategoryId.value),
      asset_sub_category_id: Number(selectedSubCategoryId.value), // backend safety
      amount: Number(budget.value.amount),
      quantity: qty,
      asset_description: desc || null,

      // UI-only
      asset_code: a?.code ?? '—',
      category_name: categoryNameById(selectedCategoryId.value),
      subcategory_name: subcategoryNameById(selectedSubCategoryId.value),
    });
  }

  // reset form fields
  selectedCategoryId.value    = null;
  selectedSubCategoryId.value = null;
  selectedAsset.value         = null;
  assets.value                = [];
  budget.value.amount         = null;
  budget.value.quantity       = 1;
  budget.value.asset_description = "";
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
      asset_category_id: Number(r.asset_category_id),
      asset_subcategory_id: Number(r.asset_subcategory_id),
      asset_id: r.asset_id ?? null,                       // optional
      asset_description: r.asset_description ?? null,     // optional
      quantity: Number(r.quantity || 1),                  // send number; defaults to 1
      amount: Number(r.amount),
    }));

    const payload = { project_id: pid, budgets: budgetsPayload };

    const res = await axios.post(`${apiBaseUrl}/project-budgets`, payload, {
      headers: getAuthHeaders(),
    });

    // const ok = Array.isArray(res.data?.data) && res.data.data.length > 0;
    // alert(ok ? "All budgets saved successfully!" : res.data?.message ?? "Saved.");
    router.push(`/dashboards/projects/${projectId.value}/budgets`);

    // clearAll();
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
  !!(selectedCategoryId.value && selectedSubCategoryId.value && Number(budget.value.amount) > 0 && Number(budget.value.quantity || 1) > 0)
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
.mb-4 { margin-block-end: 16px; }
.text-medium-emphasis { opacity: 0.7; }

@media (min-width: 960px) { .pa-4 { padding: 24px !important; } }
</style>
