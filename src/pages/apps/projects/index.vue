<!-- src/views/projects/index.vue -->
<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <h3>Projects List</h3>
      <VBtn color="primary" class="ms-auto" @click="$router.push('/dashboards/projects/create')">
        Create Project
      </VBtn>
    </div>

    <!-- Loading -->
    <p v-if="loading">Loading...</p>

    <!-- Error -->
    <p v-else-if="errorMessage">{{ errorMessage }}</p>

    <!-- Table -->
    <VDataTable
      v-else-if="projects.length > 0"
      :headers="headers"
      :items="projects"
      :items-per-page="10"
    >
      <template #item.description="{ item }">
        <div class="desc-cell clamp-2" :title="item.raw?.description ?? item.description">
          {{ truncateSmart(item.raw?.description ?? item.description, 20, 120) }}
        </div>
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex gap-2">
          <VBtn
            color="warning"
            size="small"
            @click="$router.push(`/dashboards/projects/edit/${item.raw?.id ?? item.id}`)"
          >
            Edit
          </VBtn>

          <VBtn
            color="error"
            size="small"
            @click="deleteProject(item.raw?.id ?? item.id)"
          >
            Delete
          </VBtn>

          <VBtn
            color="primary"
            size="small"
            @click="$router.push(`/dashboards/projects/${item.raw?.id ?? item.id}/assignusers`)"
          >
            Users
          </VBtn>

          <VBtn
            color="info"
            size="small"
            @click="$router.push(`/dashboards/projects/${item.raw?.id ?? item.id}/budgets`)"
          >
            Budget
          </VBtn>
        </div>
      </template>
    </VDataTable>

    <!-- Empty state -->
    <VCard v-else class="mt-6 pa-6 text-center" variant="tonal">
      <VCardTitle>Projects not found</VCardTitle>
      <VCardText>
        You do not have any projects yet. Start by creating your first project.
      </VCardText>
      <VBtn color="primary" @click="$router.push('/dashboards/projects/create')">
        Create Project
      </VBtn>
    </VCard>
  </div>
</template>

<script setup>
import axios from "axios";
import { onMounted, ref } from "vue";
import {
  VBtn,
  VCard, VCardText, VCardTitle,
  VDataTable,
} from "vuetify/components";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const headers = [
  { title: "NAME", key: "name" },
  { title: "START DATE", key: "start_date" },
  { title: "END DATE", key: "end_date" },
  { title: "DESCRIPTION", key: "description" },
  { title: "BUDGET", key: "budget" },
  { title: "CREATED AT", key: "created_at" },
  { title: "ACTIONS", key: "actions", sortable: false },
];

const projects = ref([]);
const loading = ref(true);
const errorMessage = ref("");

const truncateSmart = (text, wordLimit = 20, charFallback = 120) => {
  if (!text) return "—";
  const str = String(text).trim();
  const words = str.split(/\s+/).filter(Boolean);
  if (words.length > 1) return words.length > wordLimit ? words.slice(0, wordLimit).join(" ") + "..." : str;
  return str.length > charFallback ? str.slice(0, charFallback) + "..." : str;
};

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

// list
const fetchProjects = async () => {
  loading.value = true;
  errorMessage.value = "";
  try {
    const res = await axios.get(`${apiBaseUrl}/projects`, { headers: getAuthHeaders() });
    const list = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
      ? res.data.data
      : [];
    projects.value = list.map(p => ({
      id: p.id,
      name: p.name,
      start_date: p.start_date ?? "—",
      end_date: p.end_date ?? "—",
      description: p.description ?? "—",
      budget: p.budget ?? "—",
      created_at: p.created_at ?? "—",
    }));
  } catch (e) {
    console.error("Error fetching projects:", e);
    errorMessage.value = e.response?.data?.message || "Failed to fetch projects.";
  } finally {
    loading.value = false;
  }
};
onMounted(fetchProjects);

// delete
const deleteProject = async (projectId) => {
  if (!confirm("Are you sure you want to delete this project?")) return;
  try {
    await axios.delete(`${apiBaseUrl}/projects/${projectId}`, { headers: getAuthHeaders() });
    projects.value = projects.value.filter(p => p.id !== projectId);
    alert("Project deleted successfully!");
  } catch (e) {
    console.error("Error deleting project:", e);
    alert(e.response?.data?.message || "Failed to delete project.");
  }
};
</script>

<style>
.v-data-table { margin-block-start: 16px; }
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.ms-auto { margin-inline-start: auto; }
.gap-2 { gap: 8px; }
.mb-4 { margin-block-end: 16px; }
.desc-cell { overflow: hidden; max-inline-size: 480px; overflow-wrap: anywhere; text-overflow: ellipsis; word-break: break-word; }
.clamp-2 { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
</style>
