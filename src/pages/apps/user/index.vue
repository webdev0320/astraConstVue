<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <h3>User List</h3>
      <VBtn
        color="primary"
        class="ms-auto"
        @click="$router.push('/dashboards/users/create')"
      >
        Add User
      </VBtn>
    </div>

    <VDataTable
      v-if="users.length > 0"
      :headers="headers"
      :items="users"
      :items-per-page="perPage"
      :loading="loading"
    >
      <template #item.actions="{ item }">
        <div class="d-flex gap-2">
          <VBtn
            color="warning"
            size="small"
            @click="$router.push(`/dashboards/users/edit/${item.id}`)"
          >
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

    <div class="mt-3" v-if="lastPage > 1">
      <VPagination
        v-model="page"
        :length="lastPage"
        @update:modelValue="onPageChange"
      />
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted } from "vue";
import {
  VBtn,
  VDataTable,
  VPagination,
} from "vuetify/components";

const apiBaseUrl = "https://dm.kreashionsoftwarehouse.com/astraConst/public/api";

const users = ref([]);
const errorMessage = ref("");
const loading = ref(false);

// table headers
const headers = [
  { title: "ID", key: "id" },
  { title: "Name", key: "name" },
  { title: "Email", key: "email" },
  { title: "Mobile", key: "mobile_number" },
  { title: "Role", key: "role" },
  { title: "Actions", key: "actions", sortable: false },
];

// pagination state (server-side)
const page = ref(1);
const perPage = ref(10);
const total = ref(0);
const lastPage = ref(1);

// ---- utils ----
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};
const getAuthHeaders = () => {
  const accessToken = getCookie("accessToken");
  if (!accessToken) throw new Error("Access token is missing. Please log in.");
  const decodedToken = decodeURIComponent(accessToken);
  return { Authorization: `Bearer ${decodedToken}`, Accept: "application/json" };
};

// normalize role coming from various shapes
const pickRole = (u) => {
  if (typeof u?.role === "string" && u.role) return u.role;
  if (typeof u?.role_name === "string" && u.role_name) return u.role_name;
  if (Array.isArray(u?.roles) && u.roles.length) {
    const first = u.roles[0];
    if (typeof first === "string") return first;
    if (first?.name) return first.name;
  }
  return "N/A";
};

// ---- API calls ----
const fetchUsers = async () => {
  loading.value = true;
  try {
    const res = await axios.get(`${apiBaseUrl}/users`, {
      headers: getAuthHeaders(),
      params: { page: page.value, per_page: perPage.value },
    });

    // users list can be either an array or a resource { data: [...] }
    const usersNode = res?.data?.data?.users;
    const rows = Array.isArray(usersNode)
      ? usersNode
      : (usersNode?.data ?? []);

    users.value = rows.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      mobile_number: u.mobile_number ?? "—",
      role: pickRole(u),
    }));

    // pagination (prefer payload.pagination; fallback to resource meta if present)
    const pg = res?.data?.data?.pagination;
    if (pg) {
      total.value = pg.total ?? total.value;
      lastPage.value = pg.last_page ?? lastPage.value;
      page.value = pg.current_page ?? page.value;
      perPage.value = pg.per_page ?? perPage.value;
    } else if (usersNode?.meta) {
      total.value = usersNode.meta.total ?? total.value;
      lastPage.value = usersNode.meta.last_page ?? lastPage.value;
      page.value = usersNode.meta.current_page ?? page.value;
      perPage.value = usersNode.meta.per_page ?? perPage.value;
    }
  } catch (err) {
    console.error("Error fetching users:", err);
    errorMessage.value =
      err.response?.data?.message || err.message || "Failed to fetch users.";
  } finally {
    loading.value = false;
  }
};

const deleteUser = async (userId) => {
  if (!confirm("Are you sure you want to delete this user?")) return;
  try {
    await axios.delete(`${apiBaseUrl}/users/${userId}`, {
      headers: getAuthHeaders(),
    });

    users.value = users.value.filter((u) => u.id !== userId);
    alert("User deleted successfully!");
    if (users.value.length === 0 && page.value > 1) {
      page.value = page.value - 1;
      await fetchUsers();
    }
  } catch (err) {
    console.error("Error deleting user:", err);
    alert(err.response?.data?.message || "Failed to delete user.");
  }
};

onMounted(fetchUsers);

const onPageChange = async (p) => {
  page.value = p;
  await fetchUsers();
};
</script>

<style>
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.ms-auto { margin-left: auto; }
.gap-2 { gap: 8px; }
.mb-4 { margin-bottom: 16px; }
.mt-3 { margin-top: 12px; }
</style>
