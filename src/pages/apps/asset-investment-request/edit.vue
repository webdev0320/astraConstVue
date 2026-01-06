<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-between align-center mb-4">
      <VBtn variant="text" @click="$router.back()">← Back</VBtn>
      <h3>Edit Asset Investment Request</h3>
    </div>

    <VCard class="pa-4">
      <VForm @submit.prevent="saveAll" ref="refForm">
        <VRow dense>
          <!-- AIR Number -->
          <VCol cols="12" md="4">
            <VTextField
              v-model="air_number"
              label="AIR Number"
              :error-messages="topErrors.air_number"
              clearable
            />
          </VCol>

          <!-- Project -->
          <VCol cols="12" md="4" py-5>
            <VSelect
              v-model="selectedProjectId"
              :items="projectItems"
              item-title="title"
              item-value="id"
              label="Project Name"
              placeholder="Select Project"
              :error-messages="topErrors.project_id"
              variant="outlined"
              hide-details="auto"
              clearable
            />
          </VCol>

          <!-- Date -->
          <VCol cols="12" md="4">
            <VTextField
              v-model="date"
              type="date"
              label="Asset Required Date"
              variant="outlined"
              hide-details="auto"
              :error-messages="dateError"
            />
          </VCol>

          <!-- Request Type -->
          <VCol cols="12" md="3" class="py-5">
            <VSelect
              v-model="line.request_type"
              :items="REQUEST_TYPE_OPTIONS"
              label="Request Type"
              variant="outlined"
              hide-details="auto"
              clearable
            />
          </VCol>

          <!-- Category -->
          <VCol cols="12" md="3" class="py-5">
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
          <VCol cols="12" md="3" class="py-5">
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
          </VCol>

          <!-- Asset -->
          <VCol cols="12" md="3" class="py-5">
            <VSelect
              v-model="selectedAsset"
              :items="assets"
              :item-title="asset => `${asset.code} - ${asset.title}`"
              item-value="id"
              label="Select Asset (Optional)"
              :loading="loading.assets"
              :disabled="!selectedSubCategoryId || loading.assets"
              return-object
              hide-details="auto"
              variant="outlined"
              clearable
            />
          </VCol>

          <!-- Quantity -->
          <VCol cols="12" md="3" class="py-5">
            <VTextField
              v-model.number="line.quantity"
              label="Qty"
              type="number"
              min="1"
              step="1"
              variant="outlined"
              hide-details="auto"
            />
          </VCol>

          <!-- Asset Life Period -->
          <VCol cols="12" md="3" class="py-5">
            <VTextField
              v-model.number="line.asset_life_period"
              label="Asset Life Period"
              type="number"
              variant="outlined"
              hide-details="auto"
            />
          </VCol>

          <!-- Unit Cost -->
          <VCol cols="12" md="3" class="py-5">
            <VTextField
              v-model.number="line.unit_cost"
              label="Unit Cost"
              type="number"
              prefix="SAR"
              min="0"
              step="0.01"
              variant="outlined"
              hide-details="auto"
            />
          </VCol>

          <!-- Planned Cost -->
          <VCol cols="12" md="3" class="py-5">
            <VTextField
              :model-value="line.planned_cost"
              label="Planned Cost (auto)"
              type="number"
              prefix="SAR"
              variant="outlined"
              hide-details="auto"
              readonly
            />
          </VCol>

          <!-- Description -->
          <VCol cols="12" md="12" class="py-5">
            <VTextarea
              v-model="line.description"
              label="Detailed Asset Description"
              variant="outlined"
              hide-details="auto"
              clearable
              maxlength="1000"
              :counter="1000"
            />
          </VCol>

          <!-- Reason -->
          <VCol cols="12" md="12" class="py-5">
            <VTextarea
              v-model="line.reason"
              label="Reasons/Purpose of the Investment"
              variant="outlined"
              hide-details="auto"
              clearable
              maxlength="1000"
              :counter="1000"
            />
          </VCol>

        </VRow>

        <!-- Save -->
        <div class="d-flex gap-2 mt-4">
          <VBtn color="primary" type="submit" :loading="saving">
            Update Request
          </VBtn>
        </div>
      </VForm>
    </VCard>
  </div>
</template>

<script setup>
import axios from "axios";
import { computed, ref, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const route = useRoute();
const router = useRouter();

const REQUEST_TYPE_OPTIONS = ["NEW", "LEASED", "USED"];
const today = new Date().toISOString().split("T")[0];

/* ---------------- State ---------------- */
const projects = ref([]);
const selectedProjectId = ref(null);
const date = ref(today);
const refForm = ref(null);
const saving = ref(false);
const topErrors = ref({});

const allCategories = ref([]);
const loading = ref({ categories: false, assets: false });

const selectedCategoryId = ref(null);
const selectedSubCategoryId = ref(null);
const selectedAsset = ref(null);
const air_number = ref(null);
const first = ref([]);
const assets = ref([]);

const line = ref({
  asset_life_period: null,
  unit_cost: null,
  planned_cost: null,
  quantity: 1,
  request_type: "NEW",
  description: "",
  reason: "",
});

const dateError = ref("");

watch(date, (val) => {
  if (!val) return;
  const today = new Date().setHours(0,0,0,0);
  const selected = new Date(val).setHours(0,0,0,0);
  dateError.value = selected < today ? "Start date is older than today." : "";
});

/* =============== Load Existing AIR =============== */
const loadRequest = async () => {
  try {
    const id = route.params.id;
    const res = await axios.get(`${apiBaseUrl}/asset-investment-requests/${id}`, {
      headers: getAuthHeaders()
    });

    const data = res.data.data;

    selectedProjectId.value = Number(data.project_id);
    air_number.value = data.air_number;
    date.value = data.date;

    first.value = data.items?.[0] ?? {};

    selectedCategoryId.value = Number(first.value.asset_category_id);
    selectedSubCategoryId.value = Number(first.value.asset_sub_category_id);

    line.value = {
      request_type: first.value.request_type,
      quantity: Number(first.value.quantity),
      unit_cost: Number(first.value.unit_cost),
      asset_life_period: Number(first.value.asset_life_period),
      planned_cost: Number(first.value.planned_cost),
      description: first.value.description,
      reason: first.value.reason,
    };

    // Load assets for subcategory
    if (selectedSubCategoryId.value) {
      await fetchAssetsBySubCategory(selectedSubCategoryId.value);
      selectedAsset.value = assets.value.find(a => Number(a.id) === Number(first.value.asset_id)) || null;
    }

  } catch (err) {
    console.error(err);
  }
};

/* ---------------- Projects ---------------- */
const fetchProjects = async () => {
  try {
    const res = await axios.get(`${apiBaseUrl}/projects`, { headers: getAuthHeaders() });
    projects.value = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
  } catch (e) {
    console.error("Error fetching projects:", e);
  }
};

const projectItems = computed(() =>
  (projects.value || []).map((p) => ({
    id: Number(p.id),
    title: `${p.project_code ?? p.code ?? '—'} — ${p.name ?? p.project_name ?? 'Untitled'}`,
  }))
);

/* ---------------- Categories ---------------- */
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

      const d = res.data || {};
      const chunk = Array.isArray(d.categories) ? d.categories :
                    Array.isArray(d.data)       ? d.data :
                    Array.isArray(d)            ? d : [];

      acc.push(...chunk);
      total   = Number(d.total_records ?? total);
      perPage = Number(d.perPage ?? perPage);

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

const parentCategoryItems = computed(() =>
  allCategories.value
    .filter(c => c.is_parent)
    .map(c => ({ id: Number(c.id), title: c.title }))
);

const subcategoryItemsForCategory = computed(() =>
  allCategories.value
    .filter(c => !c.is_parent && Number(c.parent_id) === Number(selectedCategoryId.value))
    .map(c => ({ id: Number(c.id), title: c.title }))
);

const onCategoryChange = () => {
  selectedSubCategoryId.value = null;
  selectedAsset.value = null;
  assets.value = [];
};

const onSubCategoryChange = async (val) => {
  selectedAsset.value = null;
  assets.value = [];
  if (val) await fetchAssetsBySubCategory(val);
};

/* ---------------- Assets ---------------- */
const fetchAssetsBySubCategory = async (subId) => {
  loading.value.assets = true;
  try {
    const res = await axios.get(`${apiBaseUrl}/assets`, {
      params: { asset_sub_category_id: subId, requestType: line.value.request_type },
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

watch(selectedAsset, (asset) => {
  if (asset) {
    line.value.asset_life_period = asset.useful_life;
    line.value.unit_cost = asset.price;
  }
});

/* Auto recalc planned cost */
watch(
  () => [line.value.unit_cost, line.value.quantity],
  ([uc, qty]) => {
    line.value.planned_cost = Number(((Number(uc) || 0) * (Number(qty) || 0)).toFixed(2));
  },
  { immediate: true }
);

/* ---------------- Save Update ---------------- */
const saveAll = async () => {
  saving.value = true;
  topErrors.value = {};

  try {
    const id = route.params.id;

    const payload = {
      project_id: Number(selectedProjectId.value),
      air_number: air_number.value,
      date: date.value,
      data: [
        {
          itemId: first.value.id,
          asset_category_id: Number(selectedCategoryId.value),
          asset_sub_category_id: Number(selectedSubCategoryId.value),
          asset_id: selectedAsset.value?.id ?? null,
          description: line.value.description,
          asset_life_period: line.value.asset_life_period,
          unit_cost: Number(line.value.unit_cost),
          planned_cost: Number(line.value.planned_cost),
          request_type: line.value.request_type,
          quantity: Number(line.value.quantity),
          reason: line.value.reason,
        }
      ]
    };

    await axios.put(`${apiBaseUrl}/asset-investment-requests/${id}`, payload, {
      headers: getAuthHeaders(),
    });

    router.push(`/dashboards/asset-investment-requests`);
  } catch (e) {
    const msg = e?.response?.data?.message || "Failed to update request.";
    topErrors.value = e?.response?.data?.errors || {};
    alert(msg);
  } finally {
    saving.value = false;
  }
};

/* ---------------- Helpers ---------------- */
const getAuthHeaders = () => {
  const access = getCookie("accessToken");
  return {
    Authorization: `Bearer ${decodeURIComponent(access)}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
};

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

/* ---------------- Init ---------------- */
onMounted(async () => {
  await Promise.all([fetchProjects(), fetchAssetCategories()]);
  await loadRequest();
});
</script>

<style scoped>
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.gap-2 { gap: 8px; }
.mb-4 { margin-block-end: 16px; }
.text-medium-emphasis { opacity: 0.7; }
.v-text-field .v-input__details {
  padding-inline: 0px !important;
}
@media (min-width: 960px) { .pa-4 { padding: 24px !important; } }
</style>
