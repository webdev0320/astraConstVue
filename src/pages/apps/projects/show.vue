<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-between align-center mb-4">
      <h3>{{ project?.name }}</h3>
      <VBtn class="ms-auto" @click="$router.back()">Back</VBtn>
    </div>

    <!-- Loading / Error -->
    <p v-if="loading">Loading...</p>
    <p v-else-if="errorMessage">{{ errorMessage }}</p>

    <!-- Project Details -->
    <VCard v-else class="pa-6">
      <VCardTitle>Project Details</VCardTitle>
        <VCardText>
            <VRow class="mb-4" dense>
              <VCol cols="12" sm="6" md="3">
                <strong>Project Code:</strong>
                <div class="info-box">{{ project.project_code }}</div>
              </VCol>
              <VCol cols="12" sm="6" md="3">
                <strong>Start Date:</strong>
                <div class="info-box">{{ project.start_date }}</div>
              </VCol>
              <VCol cols="12" sm="6" md="3">
                <strong>End Date:</strong>
                <div class="info-box">{{ project.end_date }}</div>
              </VCol>
              <VCol cols="12" sm="6" md="3">
                <strong>Budget:</strong>
                <div class="info-box">{{ project.budget ?? 0 }} SAR</div>
              </VCol>

              <VCol cols="12" sm="6" md="3">
                <strong>Created By:</strong>
                <div class="info-box">{{ project.createdBy?.name}}</div>
              </VCol>

              <VCol cols="12" sm="6" md="3">
                <strong>Project Status:</strong>
                <div class="info-box">{{ project.status ?? 'Pending'}}</div>
              </VCol>
            </VRow>

            <!-- Description -->
            <h4 class="mt-4">Description</h4>
            <div v-html="project.description" class="description-box"></div>
          </VCardText>

      <VCardText>

        <!-- Users Table -->
        <h4 class="mt-4">Assigned Users</h4>
        <VDataTable
          :headers="userHeaders"
          :items="project.users"
          class="mb-6"
        >
        </VDataTable>

        <!-- Assets Table -->
        <h4 class="mt-4">Assets</h4>
       <VDataTable
            :headers="assetHeaders"
            :items="project.assets"
            class="mb-6"
          >
          <template #item.created_at="{ item }">
            {{ new Date(item.created_at).toISOString().split('T')[0] }}
          </template>
        </VDataTable>

        <!-- Budgets Table -->
        <h4 class="mt-4">Budgets</h4>
        <VDataTable
          :headers="budgetHeaders"
          :items="project.budgets"
        />
      </VCardText>
    </VCard>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const route = useRoute();

const project = ref(null);
const loading = ref(true);
const errorMessage = ref("");

// Table Headers
const userHeaders = [
  { title: "Employee Code", value: "user_code" },
  { title: "Name", value: "name" },
  { title: "Role", value: "role" },
  { title: "Assigned By", value: "assignedBy" },
];

const assetHeaders = [
  { title: "Title", value: "asset.title" },
  { title: "Code", value: "asset.code" },
  { title: "Quantity", value: "quantity" },
  { title: "Date Assigned", value: "created_at" },
];

const budgetHeaders = [
  { title: "Category", value: "asset_category_name" },
  { title: "Subcategory", value: "asset_subcategory_name" },
  { title: "Description", value: "asset_description" },
  { title: "Amount", value: "amount" },
  { title: "Status", value: "status" },
  { title: "Created At", value: "created_at" },
];

// Auth helpers
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};
const getAuthHeaders = () => {
  const access = getCookie("accessToken");
  return { Authorization: `Bearer ${decodeURIComponent(access)}` };
};

// Fetch Project Details
const fetchProjectDetails = async () => {
  loading.value = true;
  try {
    const id = route.params.id;
    const res = await axios.get(`${apiBaseUrl}/projects/${id}`, {
      headers: getAuthHeaders(),
    });
    project.value = res.data.data;
    project.value.assets = project.value.assets.map(a => ({
      ...a,
      total_price: a.quantity * (a.asset?.unit_price ?? 0)
    }));


  } catch (error) {
    console.error(error);
    errorMessage.value =
      error.response?.data?.message || "Failed to fetch project details.";
  } finally {
    loading.value = false;
  }
};

onMounted(fetchProjectDetails);
</script>

<style>
.description-box {
  border-radius: 6px;
}
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.ms-auto { margin-left: auto; }
.mb-4 { margin-bottom: 16px; }
.mt-4 { margin-top: 16px; }
.pa-6 { padding: 24px; }

.info-box {
  border-radius: 6px;
  margin-top: 4px;
}
.description-box {
  border-radius: 6px;
  margin-top: 8px;
  white-space: pre-wrap;
}

</style>
