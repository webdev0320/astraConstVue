<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <div class="d-flex gap-2 align-center">
        <VBtn variant="text" @click="$router.back()">← Back</VBtn>
        <h3>Assign Users List</h3>
      </div>

      <!-- OPEN MODAL DIRECTLY (no routing) -->
      <VBtn color="primary" @click="openModal">
        Add Assign User
      </VBtn>
    </div>

    <VDataTable
      v-if="!loading && users.length > 0"
      :headers="headers"
      :items="users"
      :items-per-page="10"
    />

    <p v-else-if="!loading && errorMessage">{{ errorMessage }}</p>
    <p v-else>Loading...</p>

    <!-- Modal lives on the same page -->
    <AssignUsersModal
      v-model="modalOpen"
      :project-id="projectId"
      :api-base-url="apiBaseUrl"
      :get-auth-headers="getAuthHeaders"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup>
import axios from "axios";
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { VBtn, VDataTable } from "vuetify/components";
import AssignUsersModal from "./AssignUsersModal.vue";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const route = useRoute();

const projectId = computed(() => route.params.id);

// Only Name & Role columns
const headers = [
  { title: "Name", key: "name", sortable: true },
  { title: "Role", key: "role", sortable: true },
];

const users = ref([]);     // array of { id, name, role }
const loading = ref(false);
const modalOpen = ref(false);
const errorMessage = ref("");

// Fetch assigned users: GET /projects/:id/users/sync
const fetchUsers = async () => {
  if (!projectId.value) {
    errorMessage.value = "Project ID is missing in the route.";
    return;
  }
  loading.value = true;
  try {
    const res = await axios.get(
      `${apiBaseUrl}/projects/${encodeURIComponent(projectId.value)}/users/sync`,
      { headers: getAuthHeaders() }
    );

    // { project: <id>, users: [ { id, name, role, ... }, ... ] }
    const list = Array.isArray(res.data?.users)
      ? res.data.users
      : Array.isArray(res.data)
        ? res.data
        : [];

    users.value = list.map(u => ({
      id: u.id,
      name: u.name ?? "-",
      role: u.role ?? "-",
    }));

    errorMessage.value = users.value.length ? "" : "No users assigned to this project.";
  } catch (e) {
    errorMessage.value = e.response?.data?.message || "Failed to fetch project users.";
  } finally {
    loading.value = false;
  }
};

onMounted(fetchUsers);

// Open/Close + save handlers
const openModal = () => { modalOpen.value = true; };
const handleSaved = async () => {
  modalOpen.value = false;
  await fetchUsers(); // refresh table after successful save
};

// Auth header helpers
const getAuthHeaders = () => {
  const access = getCookie("accessToken");
  if (!access) throw new Error("Access token is missing. Please log in.");
  return { Authorization: `Bearer ${decodeURIComponent(access)}`, Accept: "application/json" };
};

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}
</script>

<style scoped>
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.gap-2 { gap: 8px; }
.mb-4 { margin-bottom: 16px; }
</style>
