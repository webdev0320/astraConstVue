<script setup>
import axios from "axios";
import { onMounted, ref } from "vue";
import { VBtn, VDataTable } from "vuetify/components";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const headers = [
  { title: "ID", key: "id" },
  { title: "KEY", key: "key" },
  { title: "VALUE", key: "value" },
  { title: "ACTIONS", key: "actions", align: "end" },
];

const settings = ref([]);
const errorMessage = ref("");
const loading = ref(false);

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

const fetchSettings = async () => {
  try {
    loading.value = true;
    const accessToken = getCookie("accessToken");

    if (!accessToken) {
      throw new Error("Access token is missing. Please log in.");
    }

    const decodedToken = decodeURIComponent(accessToken);
    const response = await axios.get(`${apiBaseUrl}/admin/settings`, {
      headers: {
        Authorization: `Bearer ${decodedToken}`,
      },
    });

    settings.value = response.data.settings;
  } catch (error) {
    console.error("Error fetching settings:", error);
    errorMessage.value = error.response?.data?.message || "Failed to fetch settings.";
  } finally {
    loading.value = false;
  }
};

const deleteSetting = async (id) => {
  try {
    loading.value = true;
    const accessToken = getCookie("accessToken");

    if (!accessToken) {
      throw new Error("Access token is missing. Please log in.");
    }

    const decodedToken = decodeURIComponent(accessToken);
    await axios.delete(`${apiBaseUrl}/admin/settings/${id}`, {
      headers: {
        Authorization: `Bearer ${decodedToken}`,
      },
    });

    fetchSettings();
    alert("Setting deleted successfully!");
  } catch (error) {
    console.error("Error deleting setting:", error);
    alert("Failed to delete setting.");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchSettings();
});
</script>

<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <h3>Settings List</h3>
      <VBtn color="primary" @click="$router.push('/dashboards/settings/create')">Add Setting</VBtn>
    </div>

    <VDataTable
      :headers="headers"
      :items="settings"
      :items-per-page="5"
      class="elevation-1"
    >
      <template #item.id="{ item }">
        {{ item.id }}
      </template>

      <template #item.key="{ item }">
        {{ item.key }}
      </template>

      <template #item.value="{ item }">
        {{ item.value }}
      </template>

      <template #item.actions="{ item }">
        <VBtn color="primary" small @click="$router.push(`/dashboards/settings/edit/${item.id}`)">
          Edit
        </VBtn>
        <VBtn color="error" small @click="deleteSetting(item.id)">
          Delete
        </VBtn>
      </template>
    </VDataTable>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-else-if="!settings.length && !loading" class="text-center">No settings found.</p>
  </div>
</template>

<style>
.d-flex {
  display: flex;
}
.justify-between {
  justify-content: space-between;
}
.align-center {
  align-items: center;
}
.error {
  color: red;
}
.text-center {
  text-align: center;
}
</style>
