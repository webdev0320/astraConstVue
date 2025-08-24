<script setup>
import axios from "axios";
import { ref } from "vue";
import { VBtn, VDataTable } from "vuetify/components";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

console.log('----->>',apiBaseUrl);
const headers = [
  { title: "NAME", key: "name" },
  { title: "START DATE", key: "start_date" },
  { title: "END DATE", key: "end_date" },
  { title: "DESCRIPTION", key: "description" },
  { title: "ACTIONS", key: "actions" },
];

const resolveStatusVariant = (status) => {
  if (status === "Under Progress") return { color: "primary", text: "In Progress" };
  if (status === "Completed") return { color: "success", text: "Completed" };
  if (status === "Pending") return { color: "warning", text: "Pending" };
  return { color: "error", text: "Unknown" };
};

const avatarText = (name) => {
  const initials = name.split(" ");
  return initials.length > 1
    ? initials[0][0] + initials[1][0]
    : initials[0][0];
};

const projects = ref([]);
const errorMessage = ref("");

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

const fetchProjects = async () => {
  try {
    const accessToken = getCookie("accessToken");
    if (!accessToken) {
      throw new Error("Access token is missing. Please log in.");
    }

    const decodedToken = decodeURIComponent(accessToken);
    const response = await axios.get(`${apiBaseUrl}/projects`, {
      headers: {
        Authorization: `Bearer ${decodedToken}`,
      },
    });

  console.log('======>>',response)
    projects.value = response.data.projects.map((project) => ({
      id: project.id,
      name: project.name,
      start_date: project.start_date,
      end_date: project.end_date,
      description: project.description,
      budget: project.budget,
    }));
  } catch (error) {
    console.error("Error fetching projects:", error);
    errorMessage.value = error.response?.data?.message || "Failed to fetch projects.";
  }
};

fetchProjects();

const deleteProject = async (projectId) => {
  if (confirm("Are you sure you want to delete this project?")) {
    try {
      const accessToken = getCookie("accessToken");
      const decodedToken = decodeURIComponent(accessToken);

      // Call the DELETE API with the project ID
      await axios.delete(`${apiBaseUrl}/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${decodedToken}`,
        },
      });

      projects.value = projects.value.filter((project) => project.id !== projectId);
      alert("project deleted successfully!");
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project.");
    }
  }
};
</script>

<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <h3>Projects List</h3>
      <VBtn color="primary" class="ms-auto" @click="$router.push('/dashboards/projects/create')">Create Project</VBtn>
    </div>

    <VDataTable
      v-if="projects.length > 0"
      :headers="headers"
      :items="projects"
      :items-per-page="5"
    >
      <template #item.actions="{ item }">
        <div class="d-flex gap-2">
          <VBtn color="warning" size="small" @click="$router.push(`/dashboards/projects/edit/${item.id}`)">
            Edit
          </VBtn>
          <VBtn color="error" size="small" @click="deleteProject(item.id)">
            Delete
          </VBtn>
        </div>
      </template>
    </VDataTable>
    <p v-else-if="errorMessage">{{ errorMessage }}</p>
    <p v-else>Loading...</p>
  </div>
</template>

<style>
.v-data-table {
  margin-top: 16px;
}
.v-avatar {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 14px;
  color: white;
  text-transform: uppercase;
}
.d-flex {
  display: flex;
}
.justify-between {
  justify-content: space-between;
}
.align-center {
  align-items: center;
}
.ms-auto {
  margin-left: auto;
}
.gap-2 {
  gap: 8px;
}
</style>
