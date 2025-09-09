<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <div class="d-flex gap-2 align-center">
        <VBtn variant="text" @click="$router.back()">← Back</VBtn>
        <h3>Assign Users List</h3>
      </div>

      <VBtn color="primary" @click="openModal">
        Add Assign User
      </VBtn>
    </div>

    <!-- Loading -->
    <p v-if="loading">Loading...</p>

    <!-- Error -->
    <p v-else-if="errorMessage" class="text-error">{{ errorMessage }}</p>

    <!-- Table -->
    <VDataTable
      v-else-if="users.length > 0"
      :headers="headers"
      :items="users"
      :items-per-page="10"
    />

    <!-- Empty state -->
    <VCard v-else class="mt-6 pa-6 text-center" variant="tonal">
      <VCardTitle>No users assigned</VCardTitle>
      <VCardText>
        This project has no users assigned yet. Add users to get started.
      </VCardText>
      <VBtn color="primary" @click="openModal">Add Assign User</VBtn>
    </VCard>

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
import { VBtn, VCard, VCardText, VCardTitle, VDataTable } from "vuetify/components";
import AssignUsersModal from "./AssignUsersModal.vue";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const route = useRoute();

const projectId = computed(() => route.params.id);

const headers = [
  { title: "Code", key: "user_code", sortable: true },
  { title: "Name", key: "name", sortable: true },
  { title: "Role", key: "role", sortable: true },
];

const users = ref([]);
const loading = ref(true);           // ⬅️ start as true
const modalOpen = ref(false);
const errorMessage = ref("");

// Fetch assigned users
const fetchUsers = async () => {
  if (!projectId.value) {
    errorMessage.value = "Project ID is missing in the route.";
    loading.value = false;
    return;
  }
  loading.value = true;
  errorMessage.value = "";
  try {
    const res = await axios.get(
      `${apiBaseUrl}/projects/${encodeURIComponent(projectId.value)}/users/sync`,
      { headers: getAuthHeaders() }
    );

    const list = Array.isArray(res.data?.users)
      ? res.data.users
      : Array.isArray(res.data)
        ? res.data
        : [];

    users.value = list.map(u => ({
      id: u.id,
      user_code: u.user_code ?? "-",
      name: u.name ?? "-",
      role: u.role ?? "-",
    }));
  } catch (e) {
    errorMessage.value = e.response?.data?.message || "Failed to fetch project users.";
  } finally {
    loading.value = false;
  }
};

onMounted(fetchUsers);

// Modal + refresh
const openModal = () => { modalOpen.value = true; };
const handleSaved = async () => {
  modalOpen.value = false;
  await fetchUsers();
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
.mb-4 { margin-block-end: 16px; }
.text-error { color: #c62828; }
</style>
