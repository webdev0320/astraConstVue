<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <h3>Add Assets</h3>
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
              clearable
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
              :disabled="!selectedCategoryId"
              @update:modelValue="onSubCategoryChange"
              hide-details="auto"
              variant="outlined"
              clearable
            />

            <small v-if="selectedSubCategoryId">
              Remaining Budget: 
              {{
                subcategoryItemsForCategory.find(sc => sc.id === selectedSubCategoryId)?.remainingBudget ?? 0
              }}
            </small>

          </VCol>

          <!-- Asset (optional) -->
         <VCol cols="12" md="3">
  <VSelect
    v-model="selectedAsset"
    :items="assets"
    :item-title="asset => `${asset.code} - ${asset.title}`"
    item-value="id"
    label="Select Asset"
    :loading="loading.assets"
    :disabled="!selectedSubCategoryId || loading.assets"
    return-object
    hide-details="auto"
    variant="outlined"
    clearable
  />

  <!-- Show selected asset price below field -->
  <small v-if="selectedAsset" class="text-muted">
    Price: SAR {{ Number(selectedAsset.unit_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
  </small>
</VCol>


          <!-- Quantity (optional UI; defaults to 1) -->
         <VCol cols="12" md="3">
            <VTextField
              v-model.number="budget.quantity"
              label="Available Quantity"
              type="number"
              :min="1"
              :max="selectedAsset?.remaining_quantity || 99999"
              step="1"
              variant="outlined"
              hide-details="auto"
              @input="checkQuantity"
            />
            <small v-if="selectedAsset" class="text-muted">
              Remaining: {{ selectedAsset.remaining_quantity }}
            </small>

             <small v-if="selectedAsset" class="text-muted totalAmountAfterCalculation">
                Total: SAR {{
                  selectedAssetTotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })
                }}
              </small>
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
              <div class="text-medium-emphasis">Total: <b>SAR {{ formatAmount(totalAmount) }}</b></div>
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
            {{ r.asset_code }} — Qty: {{ r.quantity }}
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
         
          <template #item.unit_price="{ item }">
            SAR {{ Number(item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
          </template>

          <template #item.subtotal="{ item }">
            SAR {{ Number(item.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
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
            Save All
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
  quantity: 1,
});

const budgetRecords = ref([]);
const saving = ref(false);

// ------------- Headers (use names, not IDs) -------------
const headers = [
  { title: "Asset Code", key: "asset_code" },
  { title: "Category", key: "category_name" },
  { title: "Subcategory", key: "subcategory_name" },
  { title: "Qty", key: "quantity" },
  { title: "Unit Price", key: "unit_price" },
  { title: "Subtotal", key: "subtotal" },
  { title: "Actions", key: "actions", sortable: false },
];

const categoryBudgets = ref({}); // { "categoryId|subCategoryId": remainingAmount }
const fetchAssetCategories = async () => {
  loading.value.categories = true;
  try {
    const res = await axios.get(`${apiBaseUrl}/project-budgets`, {
      params: { project_id: projectId.value },
      headers: getAuthHeaders(),
    });

    const apiData = res.data?.data || [];

    allCategories.value = []; // reset
    categoryBudgets.value = {}; // reset

    if (!apiData.length) return;

    // Group by category + subcategory
    const grouped = {};
    apiData.forEach(item => {
      const catId = item.asset_category_id;
      const subId = item.asset_subcategory_id;

      // Save category/subcategory structure
      if (!grouped[catId]) {
        grouped[catId] = {
          id: catId,
          name: item.asset_category_name || "Unnamed Category",
          subcategories: [],
        };
      }

      grouped[catId].subcategories.push({
        id: subId,
        name: item.asset_subcategory_name || "Unnamed Subcategory",
        quantity: 0, // you can keep quantity for other purposes
      });

      // Save remaining budget
      const key = `${catId}|${subId}`;
      categoryBudgets.value[key] = (categoryBudgets.value[key] || 0) + Number(item.remainingBudget || 0);
    });

    allCategories.value = Object.values(grouped);

  } catch (e) {
    console.error("❌ Error fetching categories:", e);
    allCategories.value = [];
  } finally {
    loading.value.categories = false;
  }
};


// Parent categories (main categories)
const parentCategoryItems = computed(() =>
  allCategories.value.map(c => ({
    id: Number(c.id),
    title: String(c.name ?? `Category #${c.id}`),
  }))
);

// Subcategories for selected category
const subcategoryItemsForCategory = computed(() => {
  const category = allCategories.value.find(c => Number(c.id) === Number(selectedCategoryId.value));
  if (!category) return [];

  return category.subcategories.map(sc => {
    const key = `${category.id}|${sc.id}`;
    const remainingBudget = categoryBudgets.value[key] ?? 0;

    return {
      id: Number(sc.id),
      title: String(sc.name ?? `Subcategory #${sc.id}`),
      quantity: sc.quantity ?? 0,
      remainingBudget, // attach the remaining budget
    };
  });
});


const selectedAssetTotal = computed(() => {
  if (!selectedAsset.value) return 0;

  const price = Number(selectedAsset.value.unit_price || 0);
  const qty = Number(budget.value.quantity || 0);

  return price * qty;
});


// Handy name lookups
const categoryNameById = (id) => {
  const c = allCategories.value.find(x => Number(x.id) === Number(id));
  return c?.name ?? c?.slug ?? `Category #${id}`;
};
const subcategoryNameById = (id) => {
  let foundSubcategory = null;

  for (const category of allCategories.value) {
    const sub = category.subcategories?.find(
      (s) => Number(s.id) === Number(id)
    );
    if (sub) {
      foundSubcategory = sub;
      break;
    }
  }

  return foundSubcategory?.name ?? `Subcategory #${id}`;
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
  if (!selectedCategoryId.value || !selectedSubCategoryId.value) return;

  const a = selectedAsset.value;
  const qty = Number(budget.value.quantity || 1);
  const key = `${selectedCategoryId.value}|${selectedSubCategoryId.value}`;

  const totalBudget = Number(categoryBudgets.value[key] || 0);

  // Total used already for this category+subcategory
  let alreadyUsed = 0;
  budgetRecords.value.forEach(r => {
    if (
      r.asset_category_id === selectedCategoryId.value &&
      r.asset_subcategory_id === selectedSubCategoryId.value
    ) {
      alreadyUsed += Number(r.quantity || 0) * Number(r.unit_price || a.unit_price || 0);
    }
  });

  if ((alreadyUsed + qty * a.unit_price) > totalBudget) {
    alert("Cannot add more than remaining budget for this category/subcategory.");
    return;
  }

  const recordKey = [
    selectedCategoryId.value,
    selectedSubCategoryId.value,
    a?.id ?? 'none',
  ].join("|");

  const existing = budgetRecords.value.find(r => r.__key === recordKey);
  if (existing) {
    existing.quantity = Number(existing.quantity || 0) + qty;
  } else {
      budgetRecords.value.push({
      __key: recordKey,
      project_id: Number(projectId.value),
      asset_id: a.id,
      asset_category_id: Number(selectedCategoryId.value),
      asset_subcategory_id: Number(selectedSubCategoryId.value),
      quantity: qty,
      unit_price: Number(a.unit_price || 0),
      subtotal: qty * Number(a.unit_price || 0),

      asset_code: `${a.title}-${a.code}`,
      category_name: categoryNameById(selectedCategoryId.value),
      subcategory_name: subcategoryNameById(selectedSubCategoryId.value),
    });

  }

  // reset form
  selectedCategoryId.value = null;
  selectedSubCategoryId.value = null;
  selectedAsset.value = null;
  assets.value = [];
  budget.value.quantity = 1;
};



// Whenever selectedAsset changes, update budget.quantity
watch(selectedAsset, (newAsset) => {
  if (newAsset && typeof newAsset.remaining_quantity === "number") {
    budget.value.quantity = newAsset.remaining_quantity;
  } else {
    budget.value.quantity = 1; // fallback default
  }
});


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

    // build payload
    const payload = {
      assets: budgetRecords.value.map(r => ({
        asset_id: r.asset_id ?? null,
        quantity: Number(r.quantity || 1),
      })),
    };

    // ✅ call /projects/:project/sync-assets
    const res = await axios.post(`${apiBaseUrl}/projects/${pid}/sync-assets`, payload, {
      headers: getAuthHeaders(),
    });

    alert(res.data?.message || "Assets synced successfully!");
    router.push(`/dashboards/projects/${pid}/assignAssets`);


  } catch (e) {
    const msg = e?.response?.data?.message;
    const errs = e?.response?.data?.errors;
    let friendly = msg || "Failed to sync assets.";
    if (errs && typeof errs === "object") {
      friendly += "\n" + Object.values(errs).flat().join("\n");
    }

    console.error("Sync error:", e?.response ?? e);
  } finally {
    saving.value = false;
  }
};


/*// ------------- Validation + totals -------------
const isFormValid = computed(() =>
  !!(selectedCategoryId.value && selectedSubCategoryId.value && Number(budget.value.amount) > 0 && Number(budget.value.quantity || 1) > 0)
);*/

const isFormValid = computed(() => {
  const hasCategory = !!selectedCategoryId.value;
  const hasSubCategory = !!selectedSubCategoryId.value;
  const hasQty = Number(budget.value.quantity || 1) > 0;

  return hasCategory && hasSubCategory && hasQty;
});
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
