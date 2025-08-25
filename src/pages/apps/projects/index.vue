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
      <!-- DESCRIPTION -->
      <template #item.description="{ item }">
        <div class="desc-cell clamp-2" :title="item.raw?.description ?? item.description">
          {{ truncateSmart(item.raw?.description ?? item.description, 20, 120) }}
        </div>
      </template>

      <!-- ACTIONS -->
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
            @click="openUserModal(item.raw?.id ?? item.id)"
          >
            Add User
          </VBtn>
        </div>
      </template>
    </VDataTable>

    <p v-else-if="errorMessage">{{ errorMessage }}</p>
    <p v-else>Loading...</p>

    <!-- 🔹 Modal for User Selection -->
    <VDialog v-model="userModal" max-width="500px">
      <VCard>
        <VCardTitle>Select User</VCardTitle>
        <VCardText>
          <VSelect
            v-model="selectedUser"
            :items="users"
            item-title="name"
            item-value="id"
            label="Select User"
            outlined
          />
        </VCardText>
        <VCardActions>
          <VBtn color="secondary" text @click="userModal = false">Cancel</VBtn>
          <VBtn color="primary" @click="assignUser">Save</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted } from "vue";
import { VBtn, VDataTable, VDialog, VCard, VCardTitle, VCardText, VCardActions, VSelect } from "vuetify/components";

const apiBaseUrl = "https://dm.kreashionsoftwarehouse.com/astraConst/public/api";

const headers = [
  { title: "NAME", key: "name" },
  { title: "START DATE", key: "start_date" },
  { title: "END DATE", key: "end_date" },
  { title: "DESCRIPTION", key: "description" },
  { title: "ACTIONS", key: "actions", sortable: false },
];

const projects = ref([]);
const errorMessage = ref("");

// 🔹 for User Modal
const userModal = ref(false);
const users = ref([]);
const selectedUser = ref(null);
const currentProjectId = ref(null);

const truncateSmart = (text, wordLimit = 20, charFallback = 120) => {
  if (!text) return "—";
  const str = String(text).trim();
  const words = str.split(/\s+/).filter(Boolean);

  if (words.length > 1) {
    return words.length > wordLimit
      ? words.slice(0, wordLimit).join(" ") + "..."
      : str;
  }
  return str.length > charFallback ? str.slice(0, charFallback) + "..." : str;
};

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

// 🔹 Fetch Projects
const fetchProjects = async () => {
  try {
    const accessToken = getCookie("accessToken");
    if (!accessToken) throw new Error("Access token is missing. Please log in.");
    const decodedToken = decodeURIComponent(accessToken);

    const res = await axios.get(`${apiBaseUrl}/projects`, {
      headers: { Authorization: `Bearer ${decodedToken}`, Accept: "application/json" },
    });

    const list = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];
    projects.value = list.map(p => ({
      id: p.id,
      name: p.name,
      start_date: p.start_date ?? "—",
      end_date: p.end_date ?? "—",
      description: p.description ?? "—",
      budget: p.budget ?? null,
    }));
  } catch (error) {
    console.error("Error fetching projects:", error);
    errorMessage.value = error.response?.data?.message || "Failed to fetch projects.";
  }
};

onMounted(fetchProjects);

// 🔹 Delete Project
const deleteProject = async (projectId) => {
  if (!confirm("Are you sure you want to delete this project?")) return;
  try {
    const accessToken = getCookie("accessToken");
    const decodedToken = decodeURIComponent(accessToken);

    await axios.delete(`${apiBaseUrl}/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${decodedToken}`, Accept: "application/json" },
    });

    projects.value = projects.value.filter(p => p.id !== projectId);
    alert("Project deleted successfully!");
  } catch (error) {
    console.error("Error deleting project:", error);
    alert(error.response?.data?.message || "Failed to delete project.");
  }
};

// 🔹 Open Modal + Fetch Users
const openUserModal = async (projectId) => {
  currentProjectId.value = projectId;
  userModal.value = true;

  try {
    const accessToken = getCookie("accessToken");
    const decodedToken = decodeURIComponent(accessToken);

    const res = await axios.get(`${apiBaseUrl}/admin/users`, {
      headers: { Authorization: `Bearer ${decodedToken}`, Accept: "application/json" },
    });

    users.value = Array.isArray(res.data) ? res.data : res.data.data || [];
  } catch (error) {
    console.error("Error fetching users:", error);
    alert("Failed to fetch users.");
  }
};

// 🔹 Assign User
const assignUser = async () => {
  if (!selectedUser.value) {
    alert("Please select a user.");
    return;
  }
  try {
    const accessToken = getCookie("accessToken");
    const decodedToken = decodeURIComponent(accessToken);

    await axios.post(
      `${apiBaseUrl}/projects/${currentProjectId.value}/users/sync`,
      { user_ids: [selectedUser.value] },
      { headers: { Authorization: `Bearer ${decodedToken}`, Accept: "application/json" } }
    );

    alert("User assigned successfully!");
    userModal.value = false;
    selectedUser.value = null;
  } catch (error) {
    console.error("Error assigning user:", error);
    alert(error.response?.data?.message || "Failed to assign user.");
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

/* 🔹 Clamp and handle long unspaced strings */
.desc-cell {
  max-width: 480px;           /* adjust to your layout */
  overflow: hidden;
  text-overflow: ellipsis;
  overflow-wrap: anywhere;    /* break long words with no spaces */
  word-break: break-word;
}
.clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;      /* show max 2 lines */
  -webkit-box-orient: vertical;
}
</style>
