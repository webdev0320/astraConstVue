<script setup>
import axios from "axios";
import { ref } from "vue";
import { VBtn, VDataTable } from "vuetify/components";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const headers = [
  { title: "NAME", key: "name" },
  { title: "STATUS", key: "status" },
  { title: "SELLING RANGE", key: "selling_range" },
  { title: "DAILY TRADE", key: "daily_trade" },
  { title: "AREA", key: "area" },
  { title: "DESCRIPTION", key: "description" },
  { title: "READY TO MARKET", key: "ready_to_market_date" },
  { title: "LOCATION", key: "location" },
  { title: "USER NAME", key: "user_name" },
  { title: "USER MOBILE", key: "user_mobile_number" },
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

const assets = ref([]);
const errorMessage = ref("");

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

const fetchAssets = async () => {
  try {
    const accessToken = getCookie("accessToken");
    if (!accessToken) {
      throw new Error("Access token is missing. Please log in.");
    }

    const decodedToken = decodeURIComponent(accessToken);
    const response = await axios.get(`${apiBaseUrl}/assets`, {
      headers: {
        Authorization: `Bearer ${decodedToken}`,
      },
    });

    assets.value = response.data.assets.map((product) => ({
      id: product.id,
      name: product.name,
      status: product.status,
      selling_range: `${product.selling_min_range} - ${product.selling_max_range} ${product.selling_unit}`,
      daily_trade: `${product.daily_trade_volume} ${product.daily_trade_unit}`,
      area: `${product.area} ${product.area_unit}`,
      description: product.description,
      ready_to_market_date: product.ready_to_market_date,
      location: product.location || "N/A",
      user_name: product.user_name,
      user_mobile_number: product.user_mobile_number,
      avatar: product.primary_image || null,
    }));
  } catch (error) {
    console.error("Error fetching assets:", error);
    errorMessage.value = error.response?.data?.message || "Failed to fetch assets.";
  }
};

fetchAssets();

const deleteProduct = async (productId) => {
  if (confirm("Are you sure you want to delete this product?")) {
    try {
      const accessToken = getCookie("accessToken");
      const decodedToken = decodeURIComponent(accessToken);

      // Call the DELETE API with the product ID
      await axios.delete(`${apiBaseUrl}/assets/${productId}`, {
        headers: {
          Authorization: `Bearer ${decodedToken}`,
        },
      });

      assets.value = assets.value.filter((product) => product.id !== productId);
      alert("Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product.");
    }
  }
};
</script>

<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <h3>Assets List</h3>
      <VBtn color="primary" class="ms-auto" @click="$router.push('/dashboards/assets/create')">Create Asset</VBtn>
    </div>

    <VDataTable
      v-if="assets.length > 0"
      :headers="headers"
      :items="assets"
      :items-per-page="5"
    >
      <template #item.actions="{ item }">
        <div class="d-flex gap-2">
          <VBtn color="warning" size="small" @click="$router.push(`/dashboards/assets/edit/${item.id}`)">
            Edit
          </VBtn>
          <VBtn color="error" size="small" @click="deleteProduct(item.id)">
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
