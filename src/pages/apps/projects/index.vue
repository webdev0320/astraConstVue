<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <h3>Projects List</h3>
      <VBtn color="primary" class="ms-auto" @click="$router.push('/dashboards/projects/create')">
        Create Project
      </VBtn>
    </div>

    <VDataTable
      v-if="projects.length > 0"
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
          <VBtn color="warning" size="small" @click="$router.push(`/dashboards/projects/edit/${item.raw?.id ?? item.id}`)">
            Edit
          </VBtn>
          <VBtn color="error" size="small" @click="deleteProject(item.raw?.id ?? item.id)">
            Delete
          </VBtn>
          <VBtn color="primary" size="small" @click="openUserModal(item.raw?.id ?? item.id)">
            Assign Users
          </VBtn>
        </div>
      </template>
    </VDataTable>

    <p v-else-if="errorMessage">{{ errorMessage }}</p>
    <p v-else>Loading...</p>

    <!-- Users Modal -->
    <VDialog v-model="userModal" max-width="520px">
      <VCard>
        <VCardTitle>Select Users</VCardTitle>
        <VCardText>
          <div v-if="usersLoading">Loading users…</div>
          <div v-else>
            <VSelect
              v-model="selectedUsers"
              :items="users"
              item-title="name"
              item-value="id"
              label="Select Users"
              multiple
              chips
              closable-chips
              outlined
            />
          </div>
        </VCardText>
        <VCardActions>
          <VBtn color="secondary" text @click="userModal = false">Cancel</VBtn>
          <VBtn color="primary" :loading="saving" :disabled="saving" @click="assignUsers">Save</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted } from "vue";
import {
  VBtn,
  VDataTable,
  VDialog,
  VCard,
  VCardTitle,
  VCardText,
  VCardActions,
  VSelect
} from "vuetify/components";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const headers = [
  { title: "NAME", key: "name" },
  { title: "START DATE", key: "start_date" },
  { title: "END DATE", key: "end_date" },
  { title: "DESCRIPTION", key: "description" },
  { title: "ACTIONS", key: "actions", sortable: false },
];

const projects = ref([]);
const errorMessage = ref("");

const userModal = ref(false);
const users = ref([]);           // [{ id: '1', name: '...' }]
const selectedUsers = ref([]);   // ['1','2', ...] keep as strings to match items
const usersLoading = ref(false);
const saving = ref(false);
const currentProjectId = ref(null);

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

// projects list
const fetchProjects = async () => {
  try {
    const res = await axios.get(`${apiBaseUrl}/projects`, { headers: getAuthHeaders() });
    const list = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];
    projects.value = list.map(p => ({
      id: p.id,
      name: p.name,
      start_date: p.start_date ?? "—",
      end_date: p.end_date ?? "—",
      description: p.description ?? "—",
      budget: p.budget ?? null,
    }));
  } catch (e) {
    console.error("Error fetching projects:", e);
    errorMessage.value = e.response?.data?.message || "Failed to fetch projects.";
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

// users for dropdown (cast ids to STRING)
const fetchUsersForModal = async () => {
  const res = await axios.get(`${apiBaseUrl}/users`, {
    headers: getAuthHeaders(),
    params: { per_page: 500, page: 1 },
  });
  const usersNode = res?.data?.data?.users;
  const rows = Array.isArray(usersNode) ? usersNode : (usersNode?.data ?? []);
  users.value = rows.map(u => ({ id: String(u.id), name: u.name }));
};

// assigned users for project (return STRING ids)
const fetchAssignedUserIds = async (projectId) => {
  const res = await axios.get(`${apiBaseUrl}/projects/${projectId}`, { headers: getAuthHeaders() });
  const existing =
    (Array.isArray(res.data?.users) && res.data.users) ||
    (Array.isArray(res.data?.data?.users) && res.data.data.users) ||
    (Array.isArray(res.data?.project?.users) && res.data.project.users) ||
    (Array.isArray(res.data?.data?.project?.users) && res.data.data.project.users) ||
    [];
  return existing.map(u => String(u.id));
};

// open modal (always prefill from server)
const openUserModal = async (projectId) => {
  try {
    userModal.value = true;
    usersLoading.value = true;
    currentProjectId.value = projectId;
    selectedUsers.value = [];

    await fetchUsersForModal();
    const preselected = await fetchAssignedUserIds(projectId);
    selectedUsers.value = preselected;
  } catch (e) {
    console.error("Error opening users modal:", e);
    alert(e.response?.data?.message || "Failed to prepare users list.");
  } finally {
    usersLoading.value = false;
  }
};

// save (convert to numbers for API)
const assignUsers = async () => {
  if (!currentProjectId.value) return;
  try {
    saving.value = true;
    await axios.post(
      `${apiBaseUrl}/projects/${currentProjectId.value}/users/sync`,
      { user_ids: selectedUsers.value.map(id => Number(id)) },
      { headers: getAuthHeaders() }
    );
    alert("Users synced successfully!");
    userModal.value = false;
  } catch (e) {
    console.error("Error syncing users:", e);
    alert(e.response?.data?.message || "Failed to sync users.");
  } finally {
    saving.value = false;
  }
};
</script>

<style>
.v-data-table { margin-top: 16px; }
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.ms-auto { margin-left: auto; }
.gap-2 { gap: 8px; }
.mb-4 { margin-bottom: 16px; }
.desc-cell { max-width: 480px; overflow: hidden; text-overflow: ellipsis; overflow-wrap: anywhere; word-break: break-word; }
.clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
</style>
