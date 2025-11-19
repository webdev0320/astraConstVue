<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <h3>Create Daily Asset Reporting</h3>
      <VBtn variant="text" @click="$router.push('/dashboards/daily-asset-reportings')">Back</VBtn>
    </div>

    <VForm ref="refForm" @submit.prevent="submitForm">
      <VRow>
        <!-- Equipment Name -->
        <VCol cols="12" md="6">
          <VSelect
            v-model="form.asset_id"
            :items="assetOptions"
            item-title="title"
            item-value="id"
            label="Equipment Name"
            :rules="[requiredValidator]"
            :error-messages="errorMessages.asset_id"
            :loading="loadingAssets"
            clearable
          />
        </VCol>  

        <!-- Equipment Type -->
        <VCol cols="12" md="6">
          <VTextField
            v-model="form.equipment_type"
            label="Equipment Type"
            disabled
            :error-messages="errorMessages.equipment_type"
          />
        </VCol>

        <!-- Supplier Name -->
        <VCol cols="12" md="6">
          <VTextField
            v-model="form.supplier_name"
            label="Supplier Name"
            disabled
            :error-messages="errorMessages.supplier_name"
          />
        </VCol>

        <!-- Expected End Date -->
        <VCol cols="12" md="6">
          <VTextField
            v-model="form.expected_end_date"
            type="date"
            label="Expected End Date"
            disabled
            :error-messages="errorMessages.expected_end_date"
          />
        </VCol>

        <!-- Operator -->
        <VCol cols="12" md="6">
          <VSelect
              v-model="form.operator_id"
              :items="operatorOptions"
              item-title="name"
              item-value="id"
              label="Operator"
              :rules="[requiredValidator]"
              :error-messages="errorMessages.operator_id"
              :loading="loadingOperators"
              clearable
            />

        </VCol>

        <!-- QTY -->
        <VCol cols="12" md="6">
          <VTextField
            v-model="form.qty"
            type="number"
            label="QTY"
            disabled
            :error-messages="errorMessages.qty"
          />
        </VCol>

        <!-- Plate No. -->
        <VCol cols="12" md="6">
          <VTextField
            v-model="form.plate_no"
            label="Plate No."
            disabled
            :error-messages="errorMessages.plate_no"
          />
        </VCol>

        <!-- SPO No. -->
        <VCol cols="12" md="6">
          <VTextField
            v-model="form.spo_no"
            label="SPO No."
            disabled
            :error-messages="errorMessages.spo_no"
          />
        </VCol>

        <!-- Equipment Status -->
        <VCol cols="12" md="6">
          <VSelect
            v-model="form.status"
            :items="statusOptions"
            label="Equipment Status"
            :rules="[requiredValidator]"
            :error-messages="errorMessages.status"
            clearable
          />
        </VCol>

        <!-- Remarks -->
        <VCol cols="12">
          <VTextarea
            v-model="form.remarks"
            label="Remarks"
            rows="3"
            :error-messages="errorMessages.remarks"
            auto-grow
          />
        </VCol>

        <!-- Submit -->
        <VCol cols="12">
          <VBtn type="submit" color="primary" :loading="loading" :disabled="loading">Submit</VBtn>
          <VBtn class="ms-2" variant="text" @click="$router.push('/dashboards/daily-asset-reportings')">Cancel</VBtn>
        </VCol>
      </VRow>

      <div v-if="message" class="mt-4">{{ message }}</div>
    </VForm>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { VForm, VRow, VCol, VTextField, VSelect, VTextarea, VBtn } from "vuetify/components";

const router = useRouter();
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const refForm = ref();
const form = ref({
  equipment_type: "",
  supplier_name: "",
  asset_id: null,
  expected_end_date: new Date().toISOString().substr(0, 10),
  operator_id: null,
  qty: null,
  plate_no: "",
  spo_no: "",
  rent_type: null,
  status: null,
  remarks: "",
  entry_by_user_id: null
});

const errorMessages = ref({});
const message = ref("");
const loading = ref(false);

const statusOptions = ["Working","Not Working"];
const rentTypeOptions = ["Daily", "Monthly", "Yearly"];

/* Dropdowns */
const assets = ref([]);
const operators = ref([]);
const loadingAssets = ref(false);
const loadingOperators = ref(false);

const assetOptions = ref([]);
const operatorOptions = ref([]);

/* ---------- Auth ---------- */
const getCookie = name => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

const getAuthHeaders = () => {
  const accessToken = getCookie("accessToken");
  if (!accessToken) throw new Error("Access token is missing.");
  return { Authorization: `Bearer ${decodeURIComponent(accessToken)}`, Accept: "application/json" };
};

/* ---------- Fetch assets and operators ---------- */
const fetchAssets = async () => {
  loadingAssets.value = true;
  try {
    const res = await axios.get(`${apiBaseUrl}/assets`, { headers: getAuthHeaders() });
    assets.value = Array.isArray(res.data?.data) ? res.data.data : [];
    assetOptions.value = assets.value.map(a => ({ id: a.id, title: `${a.code} — ${a.title}` }));
  } catch (err) {
    console.error(err);
  } finally {
    loadingAssets.value = false;
  }
};

const fetchOperators = async () => {
  loadingOperators.value = true;
  try {
    const res = await axios.get(`${apiBaseUrl}/users?role=Operators`, { headers: getAuthHeaders() });
    
    const users = res.data?.data?.users || [];

    operators.value = Array.isArray(users) ? users : [];
    operatorOptions.value = operators.value.map(o => ({
      id: o.id,
      name: `${o.user_code} — ${o.name}`,
    }));
  } catch (err) {
    console.error("Error loading operators:", err);
  } finally {
    loadingOperators.value = false;
  }
};

const fetchAssetDetails = async (id) => {
  if (!id) return;

  try {
    const res = await axios.get(`${apiBaseUrl}/assets/${id}`, { headers: getAuthHeaders() });
    const asset = res.data?.data;

    if (asset) {
      form.value.equipment_type = asset.asset_type || "";
      form.value.supplier_name = asset.brand || "";
      form.value.expected_end_date = asset.manufacturing_year || "";
      form.value.qty = asset.remaining_quantity || asset.quantity || "";
      form.value.plate_no = asset.plate_number || "";
      form.value.spo_no = asset.code || "";
    }
  } catch (err) {
    console.error("Error fetching asset details:", err);
  }
};

watch(() => form.value.asset_id, (newVal) => {
  if (newVal) fetchAssetDetails(newVal);
});

/* ---------- Validators ---------- */
const requiredValidator = v => (!!v || v === 0) || "This field is required";

/* ---------- Submit ---------- */
const submitForm = async () => {
  const { valid } = await refForm.value.validate();
  if (!valid) return;

  loading.value = true;
  try {
    const res = await axios.post(`${apiBaseUrl}/daily-asset-reportings`, form.value, { headers: getAuthHeaders() });
    message.value = res.data?.message || "Reporting created successfully.";
    router.push("/dashboards/daily-asset-reportings");
  } catch (err) {
    console.error(err);
    errorMessages.value = err.response?.data?.errors || {};
    message.value = err.response?.data?.message || "Failed to create reporting.";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchAssets();
  fetchOperators();
});
</script>

<style scoped>
.mb-4 { margin-block-end: 16px; }
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.ms-2 { margin-inline-start: 8px; }
</style>
