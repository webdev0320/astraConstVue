<template>
  <div class="d-flex justify-between align-center mb-4">
    <h3>Edit Asset Demobilization</h3>
  </div>

  <VForm ref="refForm" @submit.prevent="updateForm">
    <VRow>
      <!-- Project -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="form.project_id"
          :items="projectOptions"
          item-title="title"
          item-value="value"
          label="Project"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.project_id"
          :loading="loadingProjects"
          clearable
          @update:model-value="onProjectChange"
          disabled
        />
      </VCol>

      <!-- Asset -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="form.asset_id"
          :items="assetOptions"
          item-title="title"
          item-value="value"
          label="Asset"
          :loading="loadingAssets"
          clearable
          @update:model-value="onAssetChange"
          disabled
        />
      </VCol>

      <!-- Custodian -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="selectedCustodianName"
          label="Custodian"
          disabled
        />
      </VCol>

      <!-- Date -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="form.date"
          type="date"
          label="Date"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.date"
          :max="today"
        />
      </VCol>

      <!-- Assigned Quantity -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="form.project_quantity"
          type="number"
          label="Assigned Quantity"
          disabled
        />
      </VCol>

      <!-- Demobilized Quantity -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="form.total_quantity_demobilized"
          type="number"
          label="Total Quantity Demobilized"
          :rules="[quantityValidator]"
          :error-messages="errorMessages.total_quantity_demobilized"
        />
      </VCol>

      <!-- Description -->
      <VCol cols="12">
        <VTextarea
          v-model="form.description"
          label="Description"
          rows="3"
          auto-grow
        />
      </VCol>

      <!-- Submit Buttons -->
      <VCol cols="12">
        <VBtn type="submit" color="primary" :loading="loading">
          Update
        </VBtn>
        <VBtn class="ms-2" variant="text" @click="router.push('/dashboards/asset-demobilizations')">
          Cancel
        </VBtn>
      </VCol>
    </VRow>

    <div v-if="message" class="mt-4">{{ message }}</div>
  </VForm>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  VForm, VRow, VCol, VTextField, VSelect, VTextarea, VBtn
} from "vuetify/components";

const router = useRouter();
const route = useRoute();

const id = route.params.id;
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

/* ---------------------- Auth ---------------------- */
const getCookie = name => {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
};
const getToken = () => {
  const token = getCookie("accessToken") || localStorage.getItem("accessToken");
  return token ? decodeURIComponent(token) : null;
};
const getAuthHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  Accept: "application/json",
});

const today = new Date().toISOString().substr(0, 10);

/* ---------------------- Form Data ---------------------- */
const refForm = ref();
const form = ref({
  project_id: null,
  asset_id: null,
  custodian_id: null,
  total_quantity_demobilized: null,
  project_quantity: null,
  date: today,
  description: "",
});
const selectedCustodianName = ref("");

const loading = ref(false);
const loadingProjects = ref(false);
const loadingAssets = ref(false);
const message = ref("");
const errorMessages = ref({});

/* ---------------------- Dropdowns ---------------------- */
const projects = ref([]);
const assets = ref([]);

const projectOptions = computed(() =>
  projects.value.map(p => ({ value: p.id, title: p.name }))
);

const assetOptions = computed(() =>
  assets.value.map(a => ({
    value: a.id,
    title: `${a.code} — ${a.title}`,
    last_custodian: a.last_custodian,
    occupied_quantity: a.occupied_quantity,
  }))
);

/* ---------------------- Validators ---------------------- */
const requiredValidator = v => (!!v || v === 0) || "This field is required";

const quantityValidator = v => {
  if (!v) return "Required";
  if (form.value.project_quantity && v > form.value.project_quantity)
    return "Cannot exceed assigned quantity";
  return true;
};

/* ---------------------- Load initial API ---------------------- */
const fetchEditData = async () => {
  try {
    const res = await axios.get(`${apiBaseUrl}/asset-demobilizations/${id}`, {
      headers: getAuthHeaders(),
    });

    const data = res.data;

    // Prefill form
    form.value.project_id = data.project_id;
    form.value.asset_id = data.asset_id;
    form.value.custodian_id = data.custodian_id;
    form.value.date = data.date;
    form.value.description = data.description;
    form.value.total_quantity_demobilized = data.total_quantity_demobilized;

    // For display
    selectedCustodianName.value = data.custodian?.name || "";
    form.value.project_quantity = data.total_quantity_demobilized; // assigned quantity

    // Load dropdown data
    await fetchProjects();
    await fetchAssetsByProject(data.project_id);
  } catch (err) {
    console.error("Error loading edit data:", err);
  }
};

const fetchProjects = async () => {
  loadingProjects.value = true;
  try {
    const res = await axios.get(`${apiBaseUrl}/projects`, {
      headers: getAuthHeaders(),
    });
    projects.value = res.data.data || res.data;
  } finally {
    loadingProjects.value = false;
  }
};

const fetchAssetsByProject = async projectId => {
  loadingAssets.value = true;
  try {
    const res = await axios.get(`${apiBaseUrl}/assets`, {
      headers: getAuthHeaders(),
      params: { project_id: projectId },
    });

    const list = res.data.data || res.data;

    assets.value = list.map(a => ({
      id: a.id,
      code: a.code,
      title: a.title,
      last_custodian: a.last_custodian,
      occupied_quantity: a.occupied_quantity,
    }));
  } finally {
    loadingAssets.value = false;
  }
};

/* ---------------------- Update Form ---------------------- */
const updateForm = async () => {
  const { valid } = await refForm.value.validate();
  if (!valid) return;

  loading.value = true;
  try {
    const res = await axios.put(
      `${apiBaseUrl}/asset-demobilizations/${id}`,
      form.value,
      { headers: getAuthHeaders() }
    );

    message.value = res.data?.message || "Updated successfully!";
    router.push("/dashboards/asset-demobilizations");
  } catch (err) {
    errorMessages.value = err.response?.data?.errors || {};
    message.value = err.response?.data?.message || "Update failed.";
  } finally {
    loading.value = false;
  }
};

/* ---------------------- Lifecycle ---------------------- */
onMounted(fetchEditData);
</script>

<style scoped>
.mb-4 { margin-block-end: 16px; }
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.ms-2 { margin-inline-start: 8px; }
</style>
