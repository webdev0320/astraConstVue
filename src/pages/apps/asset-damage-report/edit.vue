<template>
  <div class="d-flex justify-between align-center mb-4">
    <h3>Edit Asset Damage Report</h3>
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
          :loading="loadingProjects"
          clearable
          @update:model-value="fetchAssetsByProject"
        />
      </VCol>

      <!-- Tag No -->
      <VCol cols="12" md="6">
        <VTextField v-model="form.tag_no" label="Tag No" />
      </VCol>

      <!-- Report Date -->
      <VCol cols="12" md="6">
        <VTextField v-model="form.report_date" type="date" label="Report Date" />
      </VCol>

      <!-- Report Time -->
      <VCol cols="12" md="6">
        <VTextField v-model="form.time" type="time" label="Report Time" />
      </VCol>

      <!-- Damaged Asset Reported On -->
      <VCol cols="12" md="6">
        <VTextField v-model="form.damaged_asset_reported_on" type="date" label="Damaged Asset Reported On" />
      </VCol>

      <!-- Reported By -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="form.reported_by"
          :items="userOptions"
          item-title="title"
          item-value="value"
          label="Reported By"
          :loading="loadingUsers"
          clearable
        />
      </VCol>

      <!-- Asset Damaged By -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="form.asset_damaged_by"
          :items="userOptions"
          item-title="title"
          item-value="value"
          label="Asset Damaged By"
          :loading="loadingUsers"
          clearable
        />
      </VCol>

      <!-- Reason -->
      <VCol cols="12" md="6">
        <VTextarea v-model="form.asset_damaged_due_to" label="Asset Damaged Due To" rows="2" auto-grow />
      </VCol>

      <!-- Warranty -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="form.warranty_status"
          :items="[
            { title: 'Under warranty', value: 'Under warranty' },
            { title: 'Out of warranty', value: 'Out of warranty' },
          ]"
          label="Warranty Status"
        />
      </VCol>

      <!-- Checkboxes -->
      <VCol cols="12" md="6">
        <VCheckbox v-model="form.wear_condition" label="Wear Condition" />
        <VCheckbox v-model="form.inadequate_use" label="Inadequate Use" />
        <VCheckbox v-model="form.repair_estimation_attached" label="Repair Estimation Attached" />
      </VCol>

      <!-- Report Received On -->
      <VCol cols="12" md="6">
        <VTextField v-model="form.report_received_on" type="date" label="Report Received On" />
      </VCol>

      <!-- Received Time -->
      <VCol cols="12" md="6">
        <VTextField v-model="form.received_time" type="time" label="Received Time" />
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
        />
      </VCol>

      <!-- Assessed By -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="form.assessed_by"
          :items="userOptions"
          item-title="title"
          item-value="value"
          label="Assessed By"
          clearable
        />
      </VCol>

      <!-- Assessed Date -->
      <VCol cols="12" md="6">
        <VTextField v-model="form.assessed_date" type="date" label="Assessed Date" />
      </VCol>

      <!-- Proposed Action -->
      <VCol cols="12" md="6">
        <VTextarea v-model="form.proposed_action" label="Proposed Action" rows="2" auto-grow />
      </VCol>

      <!-- Manager Action Date -->
      <VCol cols="12" md="6">
        <VTextField v-model="form.manager_action_date" type="date" label="Manager Action Date" />
      </VCol>

      <!-- Manager -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="form.manager_id"
          :items="userOptions"
          item-title="title"
          item-value="value"
          label="Manager"
          clearable
        />
      </VCol>

      <!-- Approval -->
      <VCol cols="12" md="6">
        <VCheckbox v-model="form.approved" label="Approved" />
      </VCol>

      <VCol cols="12" md="6">
        <VTextarea v-model="form.approval_remarks" label="Approval Remarks" rows="2" auto-grow />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField v-model="form.approval_date" type="date" label="Approval Date" />
      </VCol>

      <VCol cols="12" md="6">
        <VSelect
          v-model="form.approval_manager"
          :items="userOptions"
          item-title="title"
          item-value="value"
          label="Approval Manager"
          clearable
        />
      </VCol>

      <VCol cols="12">
        <VBtn type="submit" color="primary" :loading="loading">Update</VBtn>
        <VBtn class="ms-2" variant="text" @click="router.push('/dashboards/asset-damage-report')">Cancel</VBtn>
      </VCol>

    </VRow>
  </VForm>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const apiBase = import.meta.env.VITE_API_BASE_URL;
const router = useRouter();
const route = useRoute();

const id = route.params.id;

// Auth helper
const getCookie = name => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] : null
}
const getToken = () => {
  const fromCookie = getCookie('accessToken')
  if (fromCookie) return decodeURIComponent(fromCookie)
  const fromLS = localStorage.getItem('accessToken')
  return fromLS ? decodeURIComponent(fromLS) : null
}
const getAuthHeaders = () => {
  const token = getToken()
  if (!token) throw new Error('Access token is missing. Please log in.')
  return { Accept: 'application/json', Authorization: `Bearer ${token}` }
}
/* ---------------- Form ---------------- */
const form = ref({
  project_id: null,
  tag_no: "",
  report_date: "",
  time: "",
  damaged_asset_reported_on: "",
  reported_by: null,
  asset_damaged_by: null,
  asset_damaged_due_to: "",
  warranty_status: "",
  wear_condition: false,
  inadequate_use: false,
  repair_estimation_attached: false,
  report_received_on: "",
  received_time: "",
  asset_id: null,
  assessed_by: null,
  assessed_date: "",
  proposed_action: "",
  manager_action_date: "",
  manager_id: null,
  approved: false,
  approval_remarks: "",
  approval_date: "",
  approval_manager: null,
});

const refForm = ref();
const loading = ref(false);

/* ---------- Dropdown Lists ---------- */
const projects = ref([]);
const users = ref([]);
const assets = ref([]);

const loadingProjects = ref(false);
const loadingUsers = ref(false);
const loadingAssets = ref(false);

/* ---------- Options ---------- */
const projectOptions = computed(() =>
  projects.value.map((p) => ({ title: p.name, value: p.id }))
);

const userOptions = computed(() => {
  if (!Array.isArray(users.value)) return [];
  return users.value.map((u) => ({
    title: u.name || "(No Name)",
    value: u.id
  }));
});

const assetOptions = computed(() =>
  assets.value.map((a) => ({
    title: `${a.code} — ${a.name}`,
    value: a.id,
  }))
);

/* ---------- Fetch Dropdowns ---------- */
const fetchProjects = async () => {
  loadingProjects.value = true;
  const res = await axios.get(`${apiBase}/projects`, { headers: getAuthHeaders() });
  projects.value = res.data.data || [];
  loadingProjects.value = false;
};

const fetchUsers = async () => {
  loadingUsers.value = true;
  
  try {
    const res = await axios.get(`${apiBase}/users`, { headers: getAuthHeaders() });

    const possibleArrays = [
      res.data?.data?.users,
      res.data?.data,
      res.data?.users,
      res.data
    ];

    users.value = possibleArrays.find(Array.isArray) || [];
  } catch (err) {
    console.error("Error loading users:", err);
    users.value = [];
  }

  loadingUsers.value = false;
};

const fetchAssetsByProject = async (projectId) => {
  if (!projectId) return;

  loadingAssets.value = true;

  const res = await axios.get(`${apiBase}/assets`, {
    headers: getAuthHeaders(),
    params: { project_id: projectId },
  });

  assets.value = res.data.data || [];
  loadingAssets.value = false;
};

/* ---------- Load Existing Data ---------- */
const fetchReport = async () => {
  const res = await axios.get(`${apiBase}/asset-damage-reports/${id}`, {
    headers: getAuthHeaders(),
  });

  const d = res.data.data;

  // Map API → form fields
  form.value = {
    project_id: d.project_id,
    tag_no: d.tag_no,
    report_date: d.report_date,
    time: d.time,
    damaged_asset_reported_on: d.damaged_asset_reported_on,

    reported_by: d.reported_by_id,
    asset_damaged_by: d.asset_damaged_by_id,

    asset_damaged_due_to: d.asset_damaged_due_to,
    warranty_status: d.warranty_status,
    wear_condition: d.wear_condition,
    inadequate_use: d.inadequate_use,
    repair_estimation_attached: d.repair_estimation_attached,
    report_received_on: d.report_received_on,
    received_time: d.received_time,

    asset_id: d.asset_id,

    assessed_by: d.assessed_by_id,
    assessed_date: d.assessed_date,

    proposed_action: d.proposed_action,
    manager_action_date: d.manager_action_date,

    manager_id: d.manager_id,
    approved: d.approved,
    approval_remarks: d.approval_remarks,
    approval_date: d.approval_date,

    approval_manager: d.approval_manager_id,
};


  // Load assets for the project
  if (d.project_id) fetchAssetsByProject(d.project_id);
};

/* ---------- Update Form ---------- */
const updateForm = async () => {
  loading.value = true;

  try {
    await axios.put(`${apiBase}/asset-damage-reports/${id}`, form.value, {
      headers: getAuthHeaders(),
    });

    router.push("/dashboards/asset-damage-report");
  } catch (err) {
    console.error("Update failed", err);
  }

  loading.value = false;
};

/* ---------- Init ---------- */
onMounted(async () => {
  await Promise.all([fetchProjects(), fetchUsers()]);
  await fetchReport();
});
</script>

<style scoped>
.ms-2 {
  margin-left: 8px;
}
</style>
