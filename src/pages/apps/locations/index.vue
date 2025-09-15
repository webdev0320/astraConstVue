<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <h3>Locations List</h3>
      <VBtn color="primary" class="ms-auto" @click="$router.push('/dashboards/locations/create')">
        Create Location
      </VBtn>
    </div>

    <VDataTable
      v-if="locations.length > 0"
      :headers="headers"
      :items="locations"
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
import { onMounted, ref } from "vue";
import {
  VBtn,
  VCard,
  VCardActions,
  VCardText,
  VCardTitle,
  VDataTable,
  VDialog,
  VSelect
} from "vuetify/components";

const apiBaseUrl = "https://dm.kreashionsoftwarehouse.com/astraConst/public/api";

const headers = [
  { title: "NAME", key: "name" },
  { title: "CODE", key: "code" },
  { title: "DESCRIPTION", key: "description" },
  { title: "ACTIONS", key: "actions", sortable: false },
];

const locations = ref([]);
const errorMessage = ref("");

// 🔹 for User Modal
const userModal = ref(false);
const users = ref([]);
const selectedUser = ref(null);
const currentlocationId = ref(null);

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

// 🔹 Fetch locations
const fetchLocations = async () => {
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
  }
};

onMounted(fetchLocations);

// 🔹 Delete location
const deleteLocation = async (locationId) => {
  if (!confirm("Are you sure you want to delete this location?")) return;
  try {
    const accessToken = getCookie("accessToken");
    const decodedToken = decodeURIComponent(accessToken);

    await axios.delete(`${apiBaseUrl}/locations/${locationId}`, {
      headers: { Authorization: `Bearer ${decodedToken}`, Accept: "application/json" },
    });

    locations.value = locations.value.filter((p) => p.id !== locationId);
    alert("location deleted successfully!");
  } catch (error) {
    console.error("Error deleting location:", error);
    alert(error.response?.data?.message || "Failed to delete location.");
  }
};

</script>

<style>
.v-data-table {
  margin-block-start: 16px;
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
  margin-inline-start: auto;
}

.gap-2 {
  gap: 8px;
}

.mb-4 {
  margin-block-end: 16px;
}

/* 🔹 Clamp and handle long unspaced strings */
.desc-cell {
  overflow: hidden;
  max-inline-size: 480px; /* adjust to your layout */
  overflow-wrap: anywhere; /* break long words with no spaces */
  text-overflow: ellipsis;
  word-break: break-word;
}

.clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2; /* show max 2 lines */
}
</style>
