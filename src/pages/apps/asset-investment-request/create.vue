<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <VBtn variant="text" @click="$router.back()">← Back</VBtn>
      <h3>Create Asset Investment Request</h3>
    </div>

    <VCard class="pa-4">
      <VForm @submit.prevent="saveAll" ref="refForm">
        <!-- === TOP: PROJECT / IR No / DATE (Box) === -->
        <div class="form-box">
          <div class="box-title">PROJECT/NAME:</div>
          <VRow dense class="box-body">
            <VCol cols="12" md="6">
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

            <VCol cols="12" md="3">
              <VTextField
                v-model="formTop.req_number"
                label="INVESTMENT REQUEST NUMBER"
                placeholder="(Auto/Manual)"
                variant="outlined"
                density="compact"
                hide-details="auto"
              />
            </VCol>

            <VCol cols="12" md="3">
              <VTextField
                v-model="date"
                type="date"
                label="DATE"
                variant="outlined"
                density="compact"
                hide-details="auto"
                :error-messages="topErrors.date"
              />
            </VCol>
          </VRow>
        </div>

        <!-- === DETAILED ASSET DESCRIPTION (Box) — top-only === -->
        <div class="form-box">
          <div class="box-title">DETAILED ASSET DESCRIPTION: <span class="sub">(As Per Quotation)</span></div>
          <div class="box-body">
            <VTextarea
              v-model="formTop.asset_description"
              label="Description"
              variant="outlined"
              density="compact"
              hide-details="auto"
              clearable
            />
          </div>
        </div>

        <!-- === (REMOVED) PLANNED COST + REQUEST TYPE BOX to avoid duplicates === -->

        <!-- === FINANCE + CHECKED BY FINANCE (Two columns Box) === -->
        <div class="form-box">
          <VRow dense class="box-body">
            <VCol cols="12" md="6" class="right-border">
              <div class="box-title thin">THIS PART TO BE FILLED BY FINANCE</div>
              <VTextField
                v-model="finance.asset_life_period"
                label="Asset Life/Period"
                placeholder="e.g. 6–8 Years"
                variant="outlined"
                density="compact"
                hide-details="auto"
              />
            </VCol>

            <VCol cols="12" md="6">
              <div class="box-title thin">CHECKED BY FINANCIAL DEPARTMENT</div>
              <VRow dense>
                <VCol cols="12" md="8">
                  <VTextField
                    v-model="finance.checked_by_name"
                    label="Name"
                    placeholder="Finance Representative"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </VCol>
                <VCol cols="12" md="4">
                  <VTextField
                    v-model="finance.checked_date"
                    type="date"
                    label="Date"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </VCol>
              </VRow>
            </VCol>
          </VRow>
        </div>

        <!-- === SIGNATURES + BUDGET COMPLIANCE (Two columns Box) === -->
        <div class="form-box">
          <VRow dense class="box-body">
            <!-- LEFT: Signatures / Approvals -->
            <VCol cols="12" md="6" class="right-border">
              <div class="box-title thin">SIGNATURES: Approval</div>

              <div class="sig-row">
                <div class="sig-label">NAME:</div>
                <div class="sig-value">
                  <VTextField
                    v-model="signatures.ceo_name"
                    placeholder="Eng. Baher Jaber (CEO)"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </div>
                <div class="sig-date">
                  <VTextField
                    v-model="signatures.ceo_date"
                    type="date"
                    label="Date"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </div>
              </div>

              <div class="sig-row">
                <div class="sig-label">NAME:</div>
                <div class="sig-value">
                  <VTextField
                    v-model="signatures.bod_name"
                    placeholder="BOD Signature (As per Authority Matrix)"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </div>
                <div class="sig-date">
                  <VTextField
                    v-model="signatures.bod_date"
                    type="date"
                    label="Date"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </div>
              </div>

              <div class="sig-row">
                <div class="sig-label">Requesting Department Head</div>
                <div class="sig-value">
                  <VTextField
                    v-model="signatures.req_dept_head"
                    placeholder="Name"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </div>
                <div class="sig-date">
                  <VTextField
                    v-model="signatures.req_dept_date"
                    type="date"
                    label="Date"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </div>
              </div>
            </VCol>

            <!-- RIGHT: Budget compliance -->
            <VCol cols="12" md="6">
              <div class="box-title thin">In accordance with budget:</div>
              <VRadioGroup v-model="finance.in_budget" inline>
                <VRadio label="Yes" :value="true" />
                <VRadio label="No"  :value="false" />
              </VRadioGroup>

              <VRow dense class="mt-2">
                <VCol cols="12" md="8">
                  <VTextField
                    v-model="finance.dceo_name"
                    label="Name"
                    placeholder="Mr. Mohammed Irfan (D-CEO)"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </VCol>
                <VCol cols="12" md="4">
                  <VTextField
                    v-model="finance.dceo_date"
                    type="date"
                    label="Date"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                  />
                </VCol>
              </VRow>
            </VCol>
          </VRow>
        </div>

        <!-- === ENTRY AREA (Category/Sub/Asset/Qty/UnitCost/PlannedCost/Reason) === -->
        <VRow dense class="mt-4">
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

          <!-- Request Type (per-line) -->
          <VCol cols="12" md="6" class="py-5">
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
          <VCol cols="12" md="6" class="py-5">
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

          <!-- Planned Cost (total for the line) -->
          <VCol cols="12" md="6" class="py-5">
            <VTextField
              v-model.number="line.planned_cost"
              label="Planned Cost (Total)"
              type="number"
              min="0"
              step="0.01"
              prefix="SAR "
              variant="outlined"
              density="compact"
              hide-details="auto"
            />
          </VCol>

          <!-- Unit Cost (NEW) -->
          <VCol cols="12" md="6" class="py-5">
            <VTextField
              v-model.number="line.unit_cost"
              label="Unit Cost"
              type="number"
              min="0"
              step="0.01"
              prefix="SAR "
              variant="outlined"
              density="compact"
              hide-details="auto"
            />
          </VCol>

          <!-- Per-line Description -->
          <VCol cols="12" md="12" class="py-5">
            <VTextarea
              v-model="line.description"
              label="Description (per-line)"
              variant="outlined"
              density="compact"
              hide-details="auto"
              clearable
            />
          </VCol>

          <!-- Reason (optional per-line) -->
          <VCol cols="12" md="12" class="py-5">
            <VTextarea
              v-model="line.reason"
              label="Reason (per-line)"
              variant="outlined"
              density="compact"
              hide-details="auto"
              clearable
            />
          </VCol>

          <!-- Add Button + Summary -->
          <VCol cols="12" md="3" class="d-flex align-end">
            <VBtn color="primary" @click="addRecord" :disabled="!canAddLine">
              Add
            </VBtn>
          </VCol>
          <VCol cols="12" md="5" class="d-flex align-end justify-end">
            <div class="text-end">
              <div class="text-medium-emphasis">Records: <b>{{ records.length }}</b></div>
              <div class="text-medium-emphasis">
                Planned Total: <b>{{ formatAmount(plannedTotal) }}</b>
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
            {{ r.asset_code }} — {{ r.request_type }} — Qty: {{ r.quantity }} — Unit: {{ formatAmount(r.unit_cost) }} — {{ formatAmount(r.planned_cost) }}
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
          <template #item.unit_cost="{ item }">
            {{ formatAmount(item.unit_cost) }}
          </template>
          <template #item.planned_cost="{ item }">
            {{ formatAmount(item.planned_cost) }}
          </template>
          <template #item.line_total="{ item }">
            {{ formatAmount(item.quantity * (item.unit_cost || item.planned_cost)) }}
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

/* ===== meta (for top/finance/signatures) ===== */
const formTop = ref({
  req_number: "",
  asset_description: "",   // top description only
});
const finance = ref({
  asset_life_period: "",
  checked_by_name: "",
  checked_date: today,
  in_budget: true,
  dceo_name: "",
  dceo_date: today,
});
const signatures = ref({
  ceo_name: "",
  ceo_date: today,
  bod_name: "",
  bod_date: today,
  req_dept_head: "",
  req_dept_date: today,
});

// ---------------- State ----------------
const projects = ref([]);
const selectedProjectId = ref(null);
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

/* per-line inputs */
const line = ref({
  unit_cost: null,       // NEW
  planned_cost: null,    // total for the line; auto = unit_cost * quantity if unit_cost given
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
  { title: "Unit Cost", key: "unit_cost" },          // NEW
  { title: "Planned Cost (Total)", key: "planned_cost" },
  { title: "Line Total", key: "line_total" },
  { title: "Actions", key: "actions", sortable: false },
];

// ------------- Fetch Projects -------------
const fetchProjects = async () => {
  try {
    const res = await axios.get(`${apiBaseUrl}/projects`, { headers: getAuthHeaders() });
    projects.value = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
    if (routeProjectId.value && !selectedProjectId.value) {
      const pidNum = Number(routeProjectId.value);
      if (projects.value.some(p => Number(p.id) === pidNum)) selectedProjectId.value = pidNum;
      else selectedProjectId.value = pidNum;
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
const canAddLine = computed(() => {
  const qtyOk = Number(line.value.quantity || 1) > 0;
  const hasCost = Number(line.value.planned_cost) > 0 || Number(line.value.unit_cost) > 0;
  return !!(
    selectedCategoryId.value &&
    selectedSubCategoryId.value &&
    qtyOk &&
    hasCost &&
    (line.value.request_type?.length > 0)
  );
});

const addRecord = () => {
  if (!canAddLine.value) return;

  const a    = selectedAsset.value || null;
  const qty  = Number(line.value.quantity || 1);
  const unit = Number(line.value.unit_cost || 0);
  let   totalPlanned = Number(line.value.planned_cost || 0);

  // If unit_cost given, compute total
  if (unit > 0) {
    totalPlanned = unit * qty;
  }

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
    // Merge by summing quantities and recomputing totals
    const newQty = Number(existing.quantity || 0) + qty;
    const baseUnit = unit || existing.unit_cost || 0;
    existing.quantity = newQty;
    existing.unit_cost = baseUnit || null;
    if (baseUnit > 0) {
      existing.planned_cost = baseUnit * newQty;
    } else {
      existing.planned_cost = Number(existing.planned_cost) + totalPlanned;
    }
  } else {
    records.value.push({
      __key: recordKey,
      asset_category_id: Number(selectedCategoryId.value),
      asset_sub_category_id: Number(selectedSubCategoryId.value),
      asset_id: a?.id ?? null,
      description: desc || null,
      unit_cost: unit || null,                 // NEW
      planned_cost: Number(totalPlanned),      // total for the line
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
  line.value.unit_cost        = null;
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
      meta: {
        req_number: formTop.value.req_number || null,
        asset_description: formTop.value.asset_description || null, // include top description
        finance: {
          asset_life_period: finance.value.asset_life_period || null,
          checked_by_name: finance.value.checked_by_name || null,
          checked_date: finance.value.checked_date || null,
          in_budget: finance.value.in_budget,
          dceo_name: finance.value.dceo_name || null,
          dceo_date: finance.value.dceo_date || null,
        },
        signatures: {
          ceo_name: signatures.value.ceo_name || null,
          ceo_date: signatures.value.ceo_date || null,
          bod_name: signatures.value.bod_name || null,
          bod_date: signatures.value.bod_date || null,
          req_dept_head: signatures.value.req_dept_head || null,
          req_dept_date: signatures.value.req_dept_date || null,
        },
      },
      data: records.value.map(r => ({
        asset_category_id: Number(r.asset_category_id),
        asset_sub_category_id: Number(r.asset_sub_category_id),
        asset_id: r.asset_id ?? null,
        description: r.description ?? null,
        unit_cost: r.unit_cost !== null ? Number(r.unit_cost) : null,   // NEW
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
  records.value.reduce((sum, r) => {
    const unit = Number(r.unit_cost || 0);
    const qty  = Number(r.quantity || 1);
    const total = unit > 0 ? unit * qty : Number(r.planned_cost || 0);
    return sum + total;
  }, 0)
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
  if (routeProjectId.value && !selectedProjectId.value) {
    selectedProjectId.value = Number(routeProjectId.value);
  }
});
</script>

<style scoped>
/* layout helpers */
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.gap-2 { gap: 8px; }
.mb-4 { margin-block-end: 16px; }
.text-medium-emphasis { opacity: 0.7; }

/* === print-like boxes === */
.form-box {
  border: 1px solid #000;
  border-radius: 2px;
  margin-block: 10px;
}

.box-title {
  background: #e3e3e3;
  border-block-end: 1px solid #000;
  font-weight: 700;
  line-height: 1.2;
  padding-block: 6px;
  padding-inline: 10px;
}

.box-title.thin { font-weight: 600; }

.box-title .sub {
  font-size: 0.9rem;
  font-weight: 400;
}

.box-body { padding: 10px; }
.right-border { border-inline-end: 1px solid #000; }

/* signature rows (label | value | date) */
.sig-row {
  display: grid;
  align-items: center;
  gap: 8px;
  grid-template-columns: 130px 1fr 180px;
  margin-block: 6px;
}
.sig-label { font-weight: 600; }

/* tighter paddings on large screens so it looks like the form */
@media (min-width: 960px) {
  .pa-4 { padding: 24px !important; }
}
</style>
