<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-between align-center mb-4">
      <VBtn variant="text" @click="$router.back()">← Back</VBtn>
      <h3>Create Asset Investment Request</h3>
    </div>

    <VCard class="pa-4">
      <VForm @submit.prevent="saveAll" ref="refForm">
        <VRow dense>
          <!-- Project -->
          <VCol cols="12" md="4">
              <VTextField
                v-model="air_number"
                label="AIR Number"
                :error-messages="topErrors.air_number"
                clearable
              />
            </VCol>
          <VCol cols="12" md="4" py-5>
            <VSelect
              v-model="selectedProjectId"
              :items="projectItems"
              item-title="title"
              item-value="id"
              label="PROJECT NAME"
              placeholder="Select Project"
              :error-messages="topErrors.project_id"
              variant="outlined"
              hide-details="auto"
              clearable
            />
          </VCol>

          <!-- Air Number -->
            
          <!-- Date -->
          <VCol cols="12" md="4">
            <VTextField
              v-model="date"
              type="date"
              label="Asset Required Date"
              variant="outlined"
              hide-details="auto"
              :error-messages="topErrors.date"
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

          <!-- Asset (optional) -->
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

          <!-- Planned Cost (auto) -->
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

          <!-- Description -->
          <VCol cols="12" md="12" class="py-5">
            <VTextarea
              v-model="line.description"
              label="Detailed Asset Description"
              variant="outlined"
              hide-details="auto"
              clearable
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
            />
          </VCol>

        
        </VRow>

        <!-- Save -->
        <div class="d-flex gap-2 mt-4">
          <VBtn
              color="primary"
              type="submit"
              :loading="saving"
            >
              Submit Request
            </VBtn>

        </div>
      </VForm>
    </VCard>
  </div>
</template>

<script setup>
import axios from "axios";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const route = useRoute();
const router = useRouter();
const id = route.params.id; // <-- Investment Request ID

const REQUEST_TYPE_OPTIONS = ["NEW", "LEASED", "USED"];


/* ---------------- State ---------------- */
const projects = ref([]);
const selectedProjectId = ref(null);
const air_number = ref(null);
const date = ref(null);
const saving = ref(false);
const topErrors = ref({});

const allCategories = ref([]);
const loading = ref({ categories: false, assets: false });

const selectedCategoryId = ref(null);
const selectedSubCategoryId = ref(null);
const selectedAsset = ref(null);
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

watch(date, (newVal) => {
  if (!newVal) {
    dateError.value = "";
    return;
  }

  const today = new Date().setHours(0,0,0,0);
  const selected = new Date(newVal).setHours(0,0,0,0);

  if (selected < today) {
    dateError.value = "Start date is older than today.";
  } else {
    dateError.value = "";
  }
});

watch(selectedAsset, (asset) => {
  if (asset) {
    line.value.asset_life_period = asset.useful_life
    line.value.unit_cost = asset.price
  } else {
    line.value.asset_life_period = null
    line.value.unit_cost = null
  }
})

/* ------------- Auth helpers ------------- */
const getAuthHeaders = () => {
  const access = getCookie("accessToken");
  return { Authorization: `Bearer ${decodeURIComponent(access)}` };
};
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
};

/* ---------------- Fetch Existing Data ---------------- */
const fetchExisting = async () => {
  const res = await axios.get(`${apiBaseUrl}/asset-investment-requests/${id}`, {
    headers: getAuthHeaders(),
  });

  const d = res.data.data;
  const item = d.items[0];  // as your API returns single item per request

  // set main fields
  air_number.value = d.air_number;
  selectedProjectId.value = d.project_id;
  date.value = d.date;

  // prefill item fields
  selectedCategoryId.value = item.asset_category_id;
  selectedSubCategoryId.value = item.asset_sub_category_id;

  // fill line values
  line.value.asset_life_period = Number(item.asset_life_period || 0);
  line.value.unit_cost = Number(item.unit_cost);
  line.value.quantity = Number(item.quantity);
  line.value.request_type = item.request_type;
  line.value.description = item.description;
  line.value.reason = item.reason;
  line.value.planned_cost = Number(item.unit_cost) * Number(item.quantity);

  // fetch sub assets then pre-select asset if exists
  await fetchAssetsBySubCategory(item.asset_sub_category_id);
  if (item.asset_id) {
    selectedAsset.value = assets.value.find(a => Number(a.id) === Number(item.asset_id)) || null;
  }
};

/* ---------------- fetching methods (same as create) ---------------- */
const fetchProjects = async () => {
  const res = await axios.get(`${apiBaseUrl}/projects`, { headers: getAuthHeaders() });
  projects.value = res.data.data || res.data;
};
const fetchAssetCategories = async () => {
  loading.value.categories = true;
  const res = await axios.get(`${apiBaseUrl}/asset-categories`, { headers: getAuthHeaders() });
  allCategories.value = res.data.categories ?? res.data.data ?? res.data;
  loading.value.categories = false;
};

const fetchAssetsBySubCategory = async (subId) => {
  loading.value.assets = true;
  const res = await axios.get(`${apiBaseUrl}/assets`, {
    params: { asset_subcategory_id: subId },
    headers: getAuthHeaders(),
  });
  assets.value = res.data.data?.data ?? res.data.data ?? res.data ?? [];
  loading.value.assets = false;
};

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

const parentCategoryItems = computed(() =>
  allCategories.value.filter(c => c.is_parent).map(c => ({
    id: c.id,
    title: c.title
  }))
);

const subcategoryItemsForCategory = computed(() => {
  if (!selectedCategoryId.value) return [];
  return allCategories.value.filter(
    c => !c.is_parent && Number(c.parent_id) === Number(selectedCategoryId.value)
  ).map(c => ({ id: c.id, title: c.title }));
});

/* ---------------- Update API ---------------- */
const saveAll = async () => {
  saving.value = true;
  topErrors.value = {};

  try {
    const payload = {
      project_id: Number(selectedProjectId.value),
      air_number: air_number.value,
      date: date.value,
      data: [
        {
          asset_category_id: Number(selectedCategoryId.value),
          asset_sub_category_id: Number(selectedSubCategoryId.value),
          asset_id: selectedAsset.value?.id ?? null,
          asset_life_period: line.value.asset_life_period,
          unit_cost: Number(line.value.unit_cost),
          planned_cost: Number(line.value.planned_cost),
          request_type: line.value.request_type,
          quantity: Number(line.value.quantity),
          description: line.value.description,
          reason: line.value.reason,
        }
      ]
    };

    await axios.put(`${apiBaseUrl}/asset-investment-requests/${id}`, payload, {
      headers: getAuthHeaders()
    });

    router.push("/dashboards/asset-investment-requests");
  } catch (e) {
    topErrors.value = e.response?.data?.errors ?? {};
    alert(e.response?.data?.message ?? "Update failed");
  } finally {
    saving.value = false;
  }
};

/* auto-calc planned cost */
watch(
  () => [line.value.unit_cost, line.value.quantity],
  ([uc, qty]) => {
    line.value.planned_cost = (Number(uc) || 0) * (Number(qty) || 0);
  },
  { immediate: true }
);

/* init */
onMounted(async () => {
  await Promise.all([fetchProjects(), fetchAssetCategories()]);
  await fetchExisting();
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