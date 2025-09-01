<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <div class="d-flex gap-2 align-center">
        <VBtn variant="text" @click="$router.back()">← Back</VBtn>
        <h3>Project Users</h3>
      </div>

      <!-- TOP BUTTON: Assign Users -->
      <VBtn color="primary" @click="modalOpen = true">Assign Users</VBtn>
    </div>

    <VDataTable
      v-if="rows.length"
      :headers="headers"
      :items="rows"
      :items-per-page="10"
    />

    <p v-else-if="errorMessage">{{ errorMessage }}</p>
    <p v-else>Loading…</p>

    <!-- Reused modal -->
    <AssignUsersModal
      v-model="modalOpen"
      :project-id="projectId"
      :api-base-url="apiBaseUrl"
      :get-auth-headers="getAuthHeaders"
      @saved="fetchAssignedUsers"
    />
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { VBtn, VDataTable } from "vuetify/components";
import AssignUsersModal from "./AssignUsersModal.vue";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const route = useRoute();
const projectId = computed(() => route.params.id);

const headers = [
  { title: "USER", key: "name" },
  { title: "EMAIL", key: "email" },
  { title: "ROLE", key: "role" },
];

const rows = ref([]);
const errorMessage = ref("");
const modalOpen = ref(false);

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};
const getAuthHeaders = () => {
  const access = getCookie("accessToken");
  if (!access) throw new Error("Access token is missing. Please log in.");
  return { Authorization: `Bearer ${decodeURIComponent(access)}`, Accept: "application/json" };
};

// Fetch users already assigned to this project (with role if API returns)
const fetchAssignedUsers = async () => {
  try {
    const res = await axios.get(`${apiBaseUrl}/projects/${projectId.value}`, {
      headers: getAuthHeaders(),
    });

    // Try common shapes and extract role smartly
    const list =
      (Array.isArray(res.data?.users) && res.data.users) ||
      (Array.isArray(res.data?.data?.users) && res.data.data.users) ||
      (Array.isArray(res.data?.project?.users) && res.data.project.users) ||
      (Array.isArray(res.data?.data?.project?.users) && res.data.data.project.users) ||
      [];

    rows.value = list.map(u => ({
      id: u.id,
      name: u.name ?? "—",
      email: u.email ?? "—",
      role: u.role ?? u.pivot?.role ?? u.role_name ?? "—",
    }));
  } catch (e) {
    console.error(e);
    errorMessage.value = e.response?.data?.message || "Failed to load assigned users.";
  }
};

onMounted(fetchAssignedUsers);
</script>

<style>
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.gap-2 { gap: 8px; }
.mb-4 { margin-bottom: 16px; }
</style>
