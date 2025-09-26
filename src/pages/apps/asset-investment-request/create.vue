<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <VBtn variant="text" @click="$router.back()">← Back</VBtn>
      <h3>Create Asset Investment Request</h3>
    </div>

    <VCard class="pa-4">
      <VForm @submit.prevent="saveAll" ref="refForm">
        <VRow dense>
          <!-- Project (RESTORED) -->
          <VCol cols="12" md="6" py-5>
            <VSelect
              v-model="selectedProjectId"
              :items="projects"
              item-title="name"
              item-value="id"
              label="PROJECT NAME"
              placeholder="Select Project"
              :error-messages="topErrors.project_id"
              variant="outlined"
              density="compact"
              hide-details="auto"
              clearable
            />
          </VCol>
          

          <!-- Date -->
          <VCol cols="12" md="6">
            <VTextField
              v-model="date"
              type="date"
              label="Date"
              variant="outlined"
              density="compact"
              hide-details="auto"
              :error-messages="topErrors.date"
            />
          </VCol>

          <!-- Description -->
          <VCol cols="12" md="12" class="py-5">
            <VTextarea
              v-model="line.description"
              label="Description"
              variant="outlined"
              density="compact"
              hide-details="auto"
              clearable
            />
          </VCol>

          <!-- Category -->
          <VCol cols="12" md="4" class="py-5">
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
          </VCol>

          <!-- Subcategory -->
          <VCol cols="12" md="4" class="py-5">
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
          </VCol>

          <!-- Asset (optional) -->
          <VCol cols="12" md="4" class="py-5">
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
          </VCol>

          <!-- Request Type -->
          <VCol cols="12" md="4" class="py-5">
            <VSelect
              v-model="line.request_type"
              :items="REQUEST_TYPE_OPTIONS"
              label="Request Type"
              variant="outlined"
              density="compact"
              hide-details="auto"
              clearable
            />
          </VCol>

          <!-- Quantity -->
          <VCol cols="12" md="4" class="py-5">
            <VTextField
              v-model.number="line.quantity"
              label="Qty"
              type="number"
              min="1"
              step="1"
              variant="outlined"
              density="compact"
              hide-details="auto"
            />
          </VCol>

          <!-- Planned Cost -->
          <VCol cols="12" md="4" class="py-5">
            <VTextField
              v-model.number="line.planned_cost"
              label="Planned Cost"
              type="number"
              min="0"
              step="0.01"
              prefix="Rs"
              variant="outlined"
              density="compact"
              hide-details="auto"
            />
          </VCol>

          <!-- Reason -->
          <VCol cols="12" md="12" class="py-5">
            <VTextarea
              v-model="line.reason"
              label="Reason"
              variant="outlined"
              density="compact"
              hide-details="auto"
              clearable
            />
          </VCol>

          <!-- Add Button -->
          <VCol cols="12" md="3" class="d-flex align-end">
            <VBtn color="primary" @click="addRecord" :disabled="!canAddLine">
              Add
            </VBtn>
          </VCol>

          <!-- Summary -->
          <VCol cols="12" md="5" class="d-flex align-end justify-end">
            <div class="text-end">
              <div class="text-medium-emphasis">Records: <b>{{ records.length }}</b></div>
              <div class="text-medium-emphasis">
                Planned Total:
                <b>{{ formatAmount(plannedTotal) }}</b>
              </div>
            </div>
          </VCol>
        </VRow>

        <!-- Chips -->
        <div v-if="records.length" class="mt-4">
          <VChip
            v-for="(r, idx) in records"
            :key="idx"
            class="ma-1"
            closable
            @click:close="removeRecord(r)"
          >
            {{ r.asset_code }} — {{ r.request_type }} — Qty: {{ r.quantity }} — {{ formatAmount(r.planned_cost) }}
            <template v-if="r.description"> — {{ r.description }}</template>
          </VChip>
        </div>

        <!-- Table -->
        <VDataTable
          v-if="records.length"
          :headers="headers"
          :items="records"
          :items-per-page="5"
          class="mt-4"
        >
          <template #item.planned_cost="{ item }">
            {{ formatAmount(item.planned_cost) }}
          </template>
          <template #item.line_total="{ item }">
            {{ formatAmount(item.quantity * item.planned_cost) }}
          </template>
          <template #item.actions="{ item }">
            <VBtn color="error" size="small" @click="removeRecord(item)">
              Delete
            </VBtn>
          </template>
        </VDataTable>

        <!-- Save -->
        <div class="d-flex gap-2 mt-4">
          <VBtn
            color="primary"
            @click="saveAll"
            :loading="saving"
            :disabled="!canSave"
          >
            Save All Requests
          </VBtn>
          <VBtn variant="text" @click="clearAll" :disabled="!records.length">Clear</VBtn>
        </div>
      </VForm>
    </VCard>
  </div>
</template>

<script setup>
import axios from "axios";
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const route = useRoute();
const router = useRouter();
const routeProjectId = computed(() => route.params.id ?? route.params.projectId ?? route.query.projectId);

const REQUEST_TYPE_OPTIONS = ["NEW", "LEASED", "USED"];
const today = new Date().toISOString().split("T")[0];

// ---------------- State ----------------
const projects = ref([]);
const selectedProjectId = ref(null); // (RESTORED)
const date = ref(today);
const refForm = ref(null);
const saving = ref(false);
const topErrors = ref({});

const allCategories = ref([]); // raw list from /asset-categories
const loading = ref({ categories: false, assets: false });

const selectedCategoryId = ref(null);
const selectedSubCategoryId = ref(null);
const selectedAsset = ref(null);
const assets = ref([]);

const line = ref({
  planned_cost: null,
  quantity: 1,
  request_type: "NEW",
  description: "",
  reason: "",
});

const records = ref([]);

// ------------- Headers -------------
const headers = [
  { title: "Asset Code", key: "asset_code" },
  { title: "Category", key: "category_name" },
  { title: "Subcategory", key: "subcategory_name" },
  { title: "Type", key: "request_type" },
  { title: "Description", key: "description" },
  { title: "Reason", key: "reason" },
  { title: "Qty", key: "quantity" },
  { title: "Planned Cost", key: "planned_cost" },
  { title: "Line Total", key: "line_total" },
  { title: "Actions", key: "actions", sortable: false },
];

// ------------- Fetch Projects (RESTORED) -------------
const fetchProjects = async () => {
  try {
    const res = await axios.get(`${apiBaseUrl}/projects`, { headers: getAuthHeaders() });
    projects.value = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
    // Preselect from route if present
    if (routeProjectId.value && !selectedProjectId.value) {
      const pidNum = Number(routeProjectId.value);
      if (projects.value.some(p => Number(p.id) === pidNum)) selectedProjectId.value = pidNum;
      else selectedProjectId.value = pidNum; // allow even if not in list yet
    }
  } catch (e) {
    console.error("Error fetching projects:", e);
  }
};

// ------------- Fetch Categories -------------
const fetchAssetCategories = async () => {
  loading.value.categories = true;
  try {
    let page = 1, perPage = 15, total = Infinity;
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

// Normalize options
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

// Lookups
const categoryNameById = (id) => {
  const c = allCategories.value.find(x => Number(x.id) === Number(id));
  return c?.title ?? c?.slug ?? `Category #${id}`;
};
const subcategoryNameById = (id) => {
  const c = allCategories.value.find(x => Number(x.id) === Number(id));
  return c?.title ?? c?.slug ?? `Subcategory #${id}`;
};

// Events
const onCategoryChange = () => {
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

// Fetch assets by subcategory
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

// Auth helpers
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

// Add/Remove/Clear
const canAddLine = computed(() =>
  !!(
    selectedCategoryId.value &&
    selectedSubCategoryId.value &&
    Number(line.value.quantity || 1) > 0 &&
    Number(line.value.planned_cost) > 0 &&
    (line.value.request_type?.length > 0)
  )
);

const addRecord = () => {
  if (!canAddLine.value) return;

  const a    = selectedAsset.value || null;
  const qty  = Number(line.value.quantity || 1);
  const desc = (line.value.description || "").trim();
  const rsn  = (line.value.reason || "").trim();
  const type = line.value.request_type || "NEW";

  const recordKey = [
    selectedCategoryId.value,
    selectedSubCategoryId.value,
    a?.id ?? "none",
    type,
    desc.toLowerCase(),
    rsn.toLowerCase(),
  ].join("|");

  const existing = records.value.find(r => r.__key === recordKey);
  if (existing) {
    existing.planned_cost = Number(existing.planned_cost) + Number(line.value.planned_cost || 0);
    existing.quantity     = Number(existing.quantity || 0) + qty;
  } else {
    records.value.push({
      __key: recordKey,
      asset_category_id: Number(selectedCategoryId.value),
      asset_sub_category_id: Number(selectedSubCategoryId.value),
      asset_id: a?.id ?? null,
      description: desc || null,
      planned_cost: Number(line.value.planned_cost),
      request_type: type,
      quantity: qty,
      reason: rsn || null,

      asset_code: a?.code ?? "—",
      category_name: categoryNameById(selectedCategoryId.value),
      subcategory_name: subcategoryNameById(selectedSubCategoryId.value),
    });
  }

  // reset line inputs
  selectedCategoryId.value    = null;
  selectedSubCategoryId.value = null;
  selectedAsset.value         = null;
  assets.value                = [];
  line.value.planned_cost     = null;
  line.value.quantity         = 1;
  line.value.request_type     = "NEW";
  line.value.description      = "";
  line.value.reason           = "";
};

const removeRecord = (item) => {
  records.value = records.value.filter(r => r !== item);
};
const clearAll = () => { records.value = []; };

// Save
const canSave = computed(() => {
  const hasProject = Number(selectedProjectId.value) > 0
  const hasDate = !!date.value
  const hasAtLeastOneRecord = records.value.length > 0
  return hasProject && hasDate && hasAtLeastOneRecord
})

const saveAll = async () => {
  if (!canSave.value) return;
  saving.value = true;
  topErrors.value = {};

  try {
    const payload = {
      project_id: Number(selectedProjectId.value),
      date: date.value,
      data: records.value.map(r => ({
        asset_category_id: Number(r.asset_category_id),
        asset_sub_category_id: Number(r.asset_sub_category_id),
        asset_id: r.asset_id ?? null,
        description: r.description ?? null,
        planned_cost: Number(r.planned_cost),
        request_type: r.request_type,
        quantity: Number(r.quantity || 1),
        reason: r.reason ?? null,
      })),
    };

    await axios.post(`${apiBaseUrl}/asset-investment-requests`, payload, {
      headers: getAuthHeaders(),
    });

    router.push(`/dashboards/asset-investment-requests`);
  } catch (e) {
    const msg  = e?.response?.data?.message;
    const errs = e?.response?.data?.errors;
    if (errs?.project_id) topErrors.value.project_id = errs.project_id;
    if (errs?.date) topErrors.value.date = errs.date;
    let friendly = msg || "Failed to save requests.";
    if (errs && typeof errs === "object") {
      const flat = Object.entries(errs).map(([k, v]) => `${k}: ${[].concat(v).join(", ")}`).join("\n");
      friendly += "\n" + flat;
    }
    alert(friendly);
    console.error("Save error:", e?.response ?? e);
  } finally {
    saving.value = false;
  }
};

// Totals
const plannedTotal = computed(() =>
  records.value.reduce((sum, r) => sum + Number(r.planned_cost || 0) * Number(r.quantity || 1), 0)
);
function formatAmount(val) {
  if (val === null || val === undefined || val === "") return "-";
  const num = Number(val);
  if (Number.isNaN(num)) return String(val);
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Init
onMounted(async () => {
  await Promise.all([fetchProjects(), fetchAssetCategories()]);
  // if route had project id but projects fetched later, keep the preselection
  if (routeProjectId.value && !selectedProjectId.value) {
    selectedProjectId.value = Number(routeProjectId.value);
  }
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
