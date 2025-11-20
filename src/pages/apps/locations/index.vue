<template>
  <div class="pa-6">
    <!-- 🔹 Header -->
    <div class="d-flex justify-between align-center mb-4">
      <h3>Locations List</h3>
      <VBtn
        color="primary"
        class="ms-auto"
        @click="$router.push('/dashboards/locations/create')"
        :disabled="isLoading"
      >
        Create Location
      </VBtn>
    </div>

    <!-- 🔹 Error Message -->
    <VAlert v-if="errorMessage" type="error" class="mb-4">
      {{ errorMessage }}
    </VAlert>

    <!-- 🔹 Loading Spinner -->
    <div v-if="isLoading" class="d-flex justify-center my-8">
      <VProgressCircular indeterminate color="primary" size="48" />
    </div>

    <!-- 🔹 Locations Table -->
    <VDataTable
      v-else
      :headers="headers"
      :items="locations"
      :items-per-page="10"
      class="mt-4"
    >
      <!-- DESCRIPTION -->
      <template #item.description="{ item }">
        <div
          class="desc-cell clamp-2"
          :title="item.raw?.description ?? item.description"
        >
          {{ truncateSmart(item.raw?.description ?? item.description, 20, 120) }}
        </div>
      </template>

      <!-- ACTIONS -->
      <template #item.actions="{ item }">
        <div class="d-flex gap-2">
          <VBtn
            color="warning"
            size="small"
            @click="$router.push(`/dashboards/locations/edit/${item.raw?.id ?? item.id}`)"
          >
            Edit
          </VBtn>
          <VBtn
            color="error"
            size="small"
            @click="deleteLocation(item.raw?.id ?? item.id)"
          >
            Delete
          </VBtn>
        </div>
      </template>

      <!-- 🔹 NO DATA SLOT -->
      <template #no-data>
        <div class="py-8 text-center">
          No Locations found.
        </div>
      </template>
    </VDataTable>

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
import {
  VBtn,
  VDataTable,
  VDialog,
  VCard,
  VCardTitle,
  VCardText,
  VCardActions,
  VSelect,
  VAlert,
  VProgressCircular,
} from "vuetify/components";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

// 🔹 Table Headers
const headers = [
  { title: "NAME", key: "name" },
  { title: "CODE", key: "code" },
  { title: "DESCRIPTION", key: "description" },
  { title: "ACTIONS", key: "actions", sortable: false },
];

// 🔹 Reactive State
const locations = ref([]);
const errorMessage = ref("");
const isLoading = ref(true);

// 🔹 User Modal
const userModal = ref(false);
const users = ref([]);
const selectedUser = ref(null);
const currentlocationId = ref(null);

// 🔹 Helpers
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

// 🔹 Text Truncate Helper
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

// 🔹 Fetch Locations
const fetchLocations = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const accessToken = getCookie("accessToken");
    if (!accessToken) throw new Error("Access token is missing. Please log in.");
    const decodedToken = decodeURIComponent(accessToken);

    const res = await axios.get(`${apiBaseUrl}/locations`, {
      headers: { Authorization: `Bearer ${decodedToken}`, Accept: "application/json" },
    });

    const list = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
      ? res.data.data
      : [];

    locations.value = list.map((p) => ({
      id: p.id,
      name: p.name,
      code: p.code ?? "—",
      description: p.description ?? "—",
    }));
  } catch (error) {
    console.error("Error fetching locations:", error);
    errorMessage.value =
      error.response?.data?.message || "Failed to fetch locations.";
  } finally {
    isLoading.value = false;
  }
};

// 🔹 Delete Location
const deleteLocation = async (locationId) => {
  if (!confirm("Are you sure you want to delete this location?")) return;
  try {
    const accessToken = getCookie("accessToken");
    const decodedToken = decodeURIComponent(accessToken);

    await axios.delete(`${apiBaseUrl}/locations/${locationId}`, {
      headers: { Authorization: `Bearer ${decodedToken}`, Accept: "application/json" },
    });

    locations.value = locations.value.filter((p) => p.id !== locationId);
    alert("Location deleted successfully!");
  } catch (error) {
    console.error("Error deleting location:", error);
    alert(error.response?.data?.message || "Failed to delete location.");
  }
};

// 🔹 Assign User (Placeholder)
const assignUser = () => {
  alert(`User ${selectedUser.value} assigned to location ${currentlocationId.value}`);
  userModal.value = false;
};

onMounted(fetchLocations);
</script>

<style scoped>
.v-data-table {
  margin-top: 16px;
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

.justify-center {
  justify-content: center;
}

.ms-auto {
  margin-left: auto;
}

.gap-2 {
  gap: 8px;
}

.mb-4 {
  margin-bottom: 16px;
}

.mt-4 {
  margin-top: 16px;
}

/* 🔹 Clamp and handle long unspaced strings */
.desc-cell {
  max-width: 480px;
  overflow: hidden;
  text-overflow: ellipsis;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.py-8 {
  padding: 32px 0;
}

.text-center {
  text-align: center;
}

.text-gray-600 {
  color: rgba(0, 0, 0, 0.6);
}

.my-8 {
  margin: 32px 0;
}
</style>
