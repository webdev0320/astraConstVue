<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <h3>Asset Transfer List</h3>

      <VTextField
        v-model="searchQuery"
        placeholder="Search asset tranfer..."
        density="comfortable"
        variant="outlined"
        hide-details
        class="mx-4 flex-grow-1"
        @input="filterAssetranfer"
      />

      <VBtn color="primary" class="ms-auto" @click="$router.push('/dashboards/assettransfers/create')">
        Create Asset Transfer
      </VBtn>
    </div>

    <VDataTable
      v-if="assettransfers.length > 0"
      :headers="headers"
      :items="assettransfers"
      :items-per-page="20"
    >
      <!-- Custom header slot to apply background color -->
      <template #headers="{ columns }">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            class="custom-th"
          >
            {{ column.title }}
          </th>
        </tr>
      </template>

      <!-- Actions -->
      <template #item.actions="{ item }">
        <VMenu :close-on-content-click="true">
          <template #activator="{ props, isActive }">
            <VBtn
              v-bind="props"
              size="small"
              color="primary"
              variant="elevated"
              class="d-flex align-center gap-1"
            >
              Actions
              <VIcon :icon="isActive ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
            </VBtn>
          </template>

          <VList density="compact">

              <VListItem
                @click="$router.push(`/dashboards/assettransfers/${item.raw?.id ?? item.id}`)"
              >
                <template #prepend><VIcon icon="mdi-eye" /></template>
                <VListItemTitle>View Details</VListItemTitle>
            </VListItem>

            <VListItem @click="$router.push(`/dashboards/assettransfers/edit/${item.raw?.id ?? item.id}`)">
              <template #prepend><VIcon icon="mdi-pencil" /></template>
              <VListItemTitle>Edit</VListItemTitle>
            </VListItem>

            <VListItem @click="deleteAssetTransfer(item.raw?.id ?? item.id)">
              <template #prepend><VIcon icon="mdi-delete" /></template>
              <VListItemTitle>Delete</VListItemTitle>
            </VListItem>

            <VListItem @click="approveAssetTransfer(item.raw?.id ?? item.id)">
              <template #prepend><VIcon icon="mdi-thumb-up" /></template>
              <VListItemTitle>Approve</VListItemTitle>
            </VListItem>

            <VListItem @click="rejectAssetTransfer(item.raw?.id ?? item.id)">
              <template #prepend><VIcon icon="mdi-thumb-down" /></template>
              <VListItemTitle>Reject</VListItemTitle>
            </VListItem>
          </VList>
        </VMenu>
      </template>
    </VDataTable>


    <p v-else-if="errorMessage">{{ errorMessage }}</p>
    <p v-else>Loading...</p>

    <!-- Modal for User Selection (unchanged / optional) -->
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

// Table headers aligned to API fields
const headers = [
  { title: "ISSUE NO", key: "issue_no" },
  { title: "FORM NO", key: "form_no" },
  { title: "REVISION DATE", key: "revision_date" },
  { title: "DATE", key: "date" },
  { title: "FROM PROJECT", key: "transferred_from" },
  { title: "TO PROJECT", key: "transferred_to" },
  { title: "TRANSFER DATE", key: "transfer_date" },
  { title: "TRANSFER TIME", key: "transfer_time" },
  { title: "PREPARED BY", key: "prepared_by" },
  { title: "ACTIONS", key: "actions", sortable: false },
];

const assettransfers = ref([]);
const errorMessage = ref("");

// Modal state (unchanged / optional)
const userModal = ref(false);
const users = ref([]);
const selectedUser = ref(null);
const currentdepartmentId = ref(null);

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

// Helpers to format dates/times from ISO strings
const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Karachi" });
const fmtDate = (iso) => {
  try {
    if (!iso) return "—";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "—" : fmt.format(d);
  } catch {
    return "—";
  }
};
const fmtTime = (iso) => {
  try {
    if (!iso) return "—";
    const d = new Date(iso);
    return isNaN(d.getTime())
      ? "—"
      : d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Karachi" });
  } catch {
    return "—";
  }
};

// Fetch Asset Transfers (matches /api/asset-transfers)
const fetchAssetTransfers = async () => {
  try {
    const accessToken = getCookie("accessToken");
    if (!accessToken) throw new Error("Access token is missing. Please log in.");
    const decodedToken = decodeURIComponent(accessToken);

    const res = await axios.get(`${apiBaseUrl}/asset-transfers`, {
      headers: { Authorization: `Bearer ${decodedToken}`, Accept: "application/json" },
    });

    const list = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
      ? res.data.data
      : [];

    // Map API fields to table items
    assettransfers.value = list.map((t) => ({
      id: t.id,
      issue_no: t.issue_no ?? "—",
      form_no: t.form_no ?? "—",
      revision_date: fmtDate(t.revision_date),
      date: fmtDate(t.date),
      transferred_from:
        t.transferredProjectName ??
        (t.transferred_from_project_id ? `#${t.transferred_from_project_id}` : "—"),
      transferred_to:
        t.transferredToProjectName ??
        (t.transferred_to_project_id ? `#${t.transferred_to_project_id}` : "—"),
      transfer_date: fmtDate(t.transfer_date),
      transfer_time: fmtTime(t.transfer_time),
      prepared_by: t.prepared_by ?? "—",
    }));
  } catch (error) {
    console.error("Error fetching asset transfers:", error);
    errorMessage.value =
      error.response?.data?.message || "Failed to fetch asset transfers.";
  }
};

onMounted(fetchAssetTransfers);

// Delete Asset Transfer (matches /api/asset-transfers/{id})
const deleteAssetTransfer = async (id) => {
  if (!confirm("Are you sure you want to delete this asset transfer?")) return;
  try {
    const accessToken = getCookie("accessToken");
    if (!accessToken) throw new Error("Access token is missing. Please log in.");
    const decodedToken = decodeURIComponent(accessToken);

    await axios.delete(`${apiBaseUrl}/asset-transfers/${id}`, {
      headers: { Authorization: `Bearer ${decodedToken}`, Accept: "application/json" },
    });

    assettransfers.value = assettransfers.value.filter((t) => t.id !== id);
    alert("Asset transfer deleted successfully!");
  } catch (error) {
    console.error("Error deleting asset transfer:", error);
    alert(error.response?.data?.message || "Failed to delete asset transfer.");
  }
};

// Optional: stub for modal action
const assignUser = () => {
  // implement if needed
  userModal.value = false;
};
</script>

<style>
.v-data-table { margin-block-start: 16px; }
.d-flex { display: flex; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.ms-auto { margin-inline-start: auto; }
.gap-2 { gap: 8px; }
.mb-4 { margin-block-end: 16px; }

.custom-th {
  padding: 10px;
  background-color: #99de64;
  color: #000;
  font-weight: bold;
  text-align: start;
}

</style>
