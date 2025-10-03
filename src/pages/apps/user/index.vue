<template>
  <div>
    <!-- Top Bar: Title, Add User, and Import button -->
    <div class="d-flex justify-between align-center mb-4 wrap-gap">
      <h3 class="mb-0">User List</h3>

      <div class="d-flex align-center gap-2">
        <!-- Open modal -->
        <VBtn color="primary" :disabled="uploadLoading" @click="openImportDialog">
          Import
        </VBtn>

        <VBtn
          color="primary"
          class="ms-auto"
          @click="$router.push('/dashboards/users/create')"
        >
          Add User
        </VBtn>
      </div>
    </div>

    <!-- Success / Top-level Errors (from last import) -->
    <VAlert
      v-if="uploadMessage"
      type="success"
      variant="tonal"
      class="mb-3"
      density="comfortable"
    >
      {{ uploadMessage }}
    </VAlert>

    <VAlert
      v-if="uploadTopError"
      type="error"
      variant="tonal"
      class="mb-3"
      density="comfortable"
    >
      {{ uploadTopError }}
    </VAlert>

    <!-- Per-row / validation errors from server -->
    <div v-if="Array.isArray(uploadErrors) && uploadErrors.length" class="mb-3">
      <VAlert
        v-for="(err, idx) in uploadErrors"
        :key="idx"
        type="error"
        variant="tonal"
        class="mb-2"
        density="comfortable"
      >
        {{ err }}
      </VAlert>
    </div>

    <!-- Users Table -->
    <VDataTable
      v-if="users.length > 0"
      :headers="headers"
      :items="users"
      :items-per-page="perPage"
      :loading="loading"
    >
      <template #item.actions="{ item }">
        <div class="d-flex gap-2">
          <VBtn
            color="warning"
            size="small"
            @click="$router.push(`/dashboards/users/edit/${item.id}`)"
          >
            Edit
          </VBtn>
          <VBtn color="error" size="small" @click="deleteUser(item.id)">
            Delete
          </VBtn>
        </div>
      </template>
    </VDataTable>

    <p v-else-if="errorMessage">{{ errorMessage }}</p>
    <p v-else>Loading...</p>

    <!-- Pagination -->
    <div class="mt-3" v-if="lastPage > 1">
      <VPagination
        v-model="page"
        :length="lastPage"
        @update:modelValue="onPageChange"
      />
    </div>

    <!-- ===== Import Modal ===== -->
    <VDialog v-model="importDialog" max-width="520" :persistent="uploadLoading">
      <VCard>
        <VCardTitle class="text-h6">
          Import Users
        </VCardTitle>

        <VCardText>
          <p class="mb-3">
            Select a CSV or XLSX file to bulk import users.
          </p>

          <VForm ref="refUploadForm">
            <VFileInput
              v-model="uploadFile"
              label="Choose file (CSV/XLSX)"
              prepend-icon="mdi-paperclip"
              :show-size="true"
              density="comfortable"
              hide-details="auto"
              accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              :rules="fileRules"
              :disabled="uploadLoading"
              :error-messages="uploadFieldError"
            />
          </VForm>

          <!-- Inline loader bar while uploading -->
          <VProgressLinear
            v-if="uploadLoading"
            indeterminate
            class="mt-3"
          />
        </VCardText>

        <VCardActions>
          <VSpacer />
          <VBtn variant="text" :disabled="uploadLoading" @click="closeImportDialog">
            Cancel
          </VBtn>
          <VBtn
            color="primary"
            :loading="uploadLoading"
            :disabled="!uploadFile || uploadLoading"
            @click="submitImport"
          >
            Submit
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup>
import axios from "axios";
import { onMounted, ref } from "vue";
import {
  VAlert,
  VBtn,
  VCard,
  VCardActions,
  VCardText,
  VCardTitle,
  VDataTable,
  VDialog,
  VFileInput,
  VForm,
  VPagination,
  VProgressLinear,
  VSpacer,
} from "vuetify/components";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const users = ref([]);
const errorMessage = ref("");
const loading = ref(false);

// ===== Import modal state =====
const importDialog = ref(false);
const refUploadForm = ref(null);
const uploadFile = ref(null);
const uploadLoading = ref(false);
const uploadMessage = ref("");
const uploadTopError = ref("");
const uploadErrors = ref([]);     // array of server row-level errors
const uploadFieldError = ref(""); // field-specific error under file input

// Accept CSV/XLSX. Adjust if your API expects something else.
const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB
const ACCEPT_MIMES = [
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const fileRules = [
  v => !!v || "Please select a file",
  v => {
    const f = Array.isArray(v) ? v[0] : v;
    return !f || ACCEPT_MIMES.includes(f.type) || "Allowed: CSV/XLSX";
  },
  v => {
    const f = Array.isArray(v) ? v[0] : v;
    return !f || f.size <= MAX_FILE_BYTES || `Max size is ${Math.round(MAX_FILE_BYTES / (1024 * 1024))} MB`;
  },
];

// table headers
const headers = [
  { title: "ID", key: "id" },
  { title: "Code", key: "user_code" },
  { title: "Name", key: "name" },
  { title: "Email", key: "email" },
  { title: "Mobile", key: "mobile_number" },
  { title: "Role", key: "role" },
  { title: "Actions", key: "actions", sortable: false },
];

// pagination state (server-side)
const page = ref(1);
const perPage = ref(10);
const total = ref(0);
const lastPage = ref(1);

// ---- utils ----
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};
const getAuthHeaders = () => {
  const accessToken = getCookie("accessToken");
  if (!accessToken) throw new Error("Access token is missing. Please log in.");
  const decodedToken = decodeURIComponent(accessToken);
  return { Authorization: `Bearer ${decodedToken}`, Accept: "application/json" };
};

// normalize role coming from various shapes
const pickRole = (u) => {
  if (typeof u?.role === "string" && u.role) return u.role;
  if (typeof u?.role_name === "string" && u.role_name) return u.role_name;
  if (Array.isArray(u?.roles) && u.roles.length) {
    const first = u.roles[0];
    if (typeof first === "string") return first;
    if (first?.name) return first.name;
  }
  return "N/A";
};

// ---- API calls ----
const fetchUsers = async () => {
  loading.value = true;
  try {
    const res = await axios.get(`${apiBaseUrl}/users`, {
      headers: getAuthHeaders(),
      params: { page: page.value, per_page: perPage.value },
    });

    // users list can be either an array or a resource { data: [...] }
    const usersNode = res?.data?.data?.users ?? res?.data?.users;
    const rows = Array.isArray(usersNode)
      ? usersNode
      : (usersNode?.data ?? []);

    users.value = rows.map((u) => ({
      id: u.id,
      user_code: u.user_code,
      name: u.name,
      email: u.email,
      mobile_number: u.mobile_number ?? "—",
      role: pickRole(u),
    }));

    // pagination (prefer payload.pagination; fallback to resource meta if present)
    const pg = res?.data?.data?.pagination ?? res?.data?.pagination;
    if (pg) {
      total.value = pg.total ?? total.value;
      lastPage.value = pg.last_page ?? lastPage.value;
      page.value = pg.current_page ?? page.value;
      perPage.value = pg.per_page ?? perPage.value;
    } else if (usersNode?.meta) {
      total.value = usersNode.meta.total ?? total.value;
      lastPage.value = usersNode.meta.last_page ?? lastPage.value;
      page.value = usersNode.meta.current_page ?? page.value;
      perPage.value = usersNode.meta.per_page ?? perPage.value;
    }
  } catch (err) {
    console.error("Error fetching users:", err);
    errorMessage.value =
      err.response?.data?.message || err.message || "Failed to fetch users.";
  } finally {
    loading.value = false;
  }
};

const deleteUser = async (userId) => {
  if (!confirm("Are you sure you want to delete this user?")) return;
  try {
    await axios.delete(`${apiBaseUrl}/users/${userId}`, {
      headers: getAuthHeaders(),
    });

    users.value = users.value.filter((u) => u.id !== userId);
    alert("User deleted successfully!");
    if (users.value.length === 0 && page.value > 1) {
      page.value = page.value - 1;
      await fetchUsers();
    }
  } catch (err) {
    console.error("Error deleting user:", err);
    alert(err.response?.data?.message || "Failed to delete user.");
  }
};

// ===== Import: modal open/close/submit =====
const openImportDialog = () => {
  // reset previous state each time the modal opens
  uploadFieldError.value = "";
  uploadTopError.value = "";
  uploadMessage.value = "";
  uploadErrors.value = [];
  uploadFile.value = null;
  importDialog.value = true;
};

const closeImportDialog = () => {
  if (uploadLoading.value) return; // do not close while uploading if persistent
  importDialog.value = false;
};

const submitImport = async () => {
  uploadFieldError.value = "";
  uploadTopError.value = "";
  uploadErrors.value = [];

  const f = Array.isArray(uploadFile.value) ? uploadFile.value[0] : uploadFile.value;
  if (!f) {
    uploadFieldError.value = "Please select a file";
    return;
  }
  if (!ACCEPT_MIMES.includes(f.type)) {
    uploadFieldError.value = "Allowed: CSV/XLSX";
    return;
  }
  if (f.size > MAX_FILE_BYTES) {
    uploadFieldError.value = `Max size is ${Math.round(MAX_FILE_BYTES / (1024 * 1024))} MB`;
    return;
  }

  const fd = new FormData();
  fd.append("file", f, f.name); // change "file" if your API expects a different field

  uploadLoading.value = true;
  try {
    const res = await axios.post(`${apiBaseUrl}/users/import`, fd, {
      headers: {
        ...getAuthHeaders(), // don't set Content-Type; browser will include multipart boundary
      },
    });

    uploadMessage.value = res?.data?.message || "File imported successfully.";
    const rowErrors = res?.data?.errors;
    if (Array.isArray(rowErrors) && rowErrors.length) {
      uploadErrors.value = rowErrors.map(e => (typeof e === "string" ? e : JSON.stringify(e)));
    }

    // Close modal & refresh list
    importDialog.value = false;
    await fetchUsers();
  } catch (err) {
    console.error("Upload error:", err);
    if (err?.response?.status === 422) {
      const resp = err.response.data;
      if (resp?.errors?.file?.length) {
        uploadFieldError.value = resp.errors.file[0];
      }
      uploadTopError.value = resp?.message || "Validation failed.";
      if (Array.isArray(resp?.errors?.rows)) {
        uploadErrors.value = resp.errors.rows;
      } else if (Array.isArray(resp?.errors)) {
        uploadErrors.value = resp.errors;
      }
    } else {
      uploadTopError.value =
        err?.response?.data?.message || "Failed to import file.";
    }
  } finally {
    uploadLoading.value = false;
  }
};

onMounted(fetchUsers);

const onPageChange = async (p) => {
  page.value = p;
  await fetchUsers();
};
</script>

<style>
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.ms-auto { margin-inline-start: auto; }
.gap-2 { gap: 8px; }
.mb-4 { margin-block-end: 16px; }
.mt-3 { margin-block-start: 12px; }

.wrap-gap { flex-wrap: wrap; gap: 12px; }
.mb-0 { margin: 0; }
</style>
