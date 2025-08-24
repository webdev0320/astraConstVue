<template>
    <div>
      <div class="d-flex justify-between align-center mb-4">
        <h3>User List</h3>
        <VBtn color="primary" class="ms-auto" @click="$router.push('/dashboards/users/create')">Add User</VBtn>
      </div>

      <VDataTable
        v-if="users.length > 0"
        :headers="headers"
        :items="users"
        :items-per-page="10"
      >
        <template #item.actions="{ item }">
          <div class="d-flex gap-2">
            <VBtn color="warning" size="small" @click="$router.push(`/dashboards/users/edit/${item.id}`)">
              Edit
            </VBtn>
            <VBtn color="error" size="small" @click="deleteUser(item.id)">
              Delete
            </VBtn>
          </div>
        </template>
      </VDataTable>

      <p v-else-if="errorMessage">{{ errorMessage }}</p>
      <p v-else>Loading...</p>
    </div>
  </template>

  <script setup>
  import axios from "axios";
  import { ref, onMounted } from "vue";
  import { VBtn, VDataTable } from "vuetify/components";

  const apiBaseUrl = 'https://dm.kreashionsoftwarehouse.com/astraConst/public/api';
  console.log('aaaaabbbbbbcccc',apiBaseUrl);
  const users = ref([]);
  const errorMessage = ref("");

  const headers = [
    { title: "ID", key: "id" },
    { title: "Name", key: "name" },
    { title: "Email", key: "email" },
    { title: "Mobile", key: "mobile_number" },
    { title: "Role", key: "role" },
    { title: "Actions", key: "actions" },
  ];

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  const fetchUsers = async () => {
    try {
      const accessToken = getCookie("accessToken");
      if (!accessToken) {
        throw new Error("Access token is missing. Please log in.");
      }

      const decodedToken = decodeURIComponent(accessToken);

      const response = await axios.get(`${apiBaseUrl}/admin/users`, {
        headers: {
          Authorization: `Bearer ${decodedToken}`,
        },
      });

      console.log("API Response:", response.data); // Log the response for debugging

      // Access the nested `users` array inside `data`
      if (Array.isArray(response.data.data.users)) {
        users.value = response.data.data.users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          mobile_number: user.mobile_number,
          role: user.role || "N/A", // Add default if role is missing
        }));
      } else {
        throw new Error("Unexpected response format. Expected an array.");
      }
    } catch (error) {
      console.error("Error fetching users:", error);

      errorMessage.value =
        error.response?.data?.message || error.message || "Failed to fetch users.";
    }
  };

  const deleteUser = async (userId) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        const accessToken = getCookie("accessToken");
        const decodedToken = decodeURIComponent(accessToken);

        await axios.delete(`${apiBaseUrl}/admin/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${decodedToken}`,
          },
        });

        users.value = users.value.filter((user) => user.id !== userId);
        alert("User deleted successfully!");
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user.");
      }
    }
  };

  onMounted(() => {
    fetchUsers();
  });
  </script>

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
  .ms-auto {
    margin-left: auto;
  }
  .gap-2 {
    gap: 8px;
  }
  </style>
