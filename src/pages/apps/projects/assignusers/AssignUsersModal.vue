<template>
  <VDialog v-model="localOpen" max-width="520px" @update:modelValue="onCloseIfHidden">
    <VCard>
      <VCardTitle>Select Users</VCardTitle>
      <VCardText>
        <div v-if="usersLoading">Loading users…</div>
        <div v-else>
          <VSelect
            v-model="selectedUsers"
            :items="users"
            item-title="name"
            item-value="id"
            label="Select Users"
            multiple
            chips
            closable-chips
            outlined
          />
        </div>
      </VCardText>
      <VCardActions>
        <VBtn color="secondary" text @click="closeModal">Cancel</VBtn>
        <VBtn color="primary" :loading="saving" :disabled="saving" @click="assignUsers">
          Save
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import axios from "axios";
import { ref, watch, computed } from "vue";
import {
  VDialog,
  VCard,
  VCardTitle,
  VCardText,
  VCardActions,
  VBtn,
  VSelect
} from "vuetify/components";

// props from parent
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  projectId: { type: [String, Number], required: true },
  apiBaseUrl: { type: String, required: true },
  getAuthHeaders: { type: Function, required: true },
});

const emit = defineEmits(["update:modelValue", "saved"]);

const localOpen = ref(props.modelValue);
watch(() => props.modelValue, v => (localOpen.value = v));
const closeModal = () => emit("update:modelValue", false);
const onCloseIfHidden = (v) => { if (!v) emit("update:modelValue", false); };

const users = ref([]);
const selectedUsers = ref([]);
const usersLoading = ref(false);
const saving = ref(false);

const projectIdNum = computed(() => Number(props.projectId));

// fetch all users
const fetchUsersForModal = async () => {
  const res = await axios.get(`${props.apiBaseUrl}/users`, {
    headers: props.getAuthHeaders(),
    params: { per_page: 500, page: 1 },
  });
  const usersNode = res?.data?.data?.users;
  const rows = Array.isArray(usersNode) ? usersNode : (usersNode?.data ?? []);
  users.value = rows.map(u => ({ id: String(u.id), name: u.name }));
};

// fetch users already assigned to project
const fetchAssignedUserIds = async () => {
  const res = await axios.get(`${props.apiBaseUrl}/projects/${projectIdNum.value}`, {
    headers: props.getAuthHeaders(),
  });
  const existing =
    (Array.isArray(res.data?.users) && res.data.users) ||
    (Array.isArray(res.data?.data?.users) && res.data.data.users) ||
    (Array.isArray(res.data?.project?.users) && res.data.project.users) ||
    (Array.isArray(res.data?.data?.project?.users) && res.data.data.project.users) ||
    [];
  return existing.map(u => String(u.id));
};

// prepare modal when opened
const prepare = async () => {
  usersLoading.value = true;
  try {
    await fetchUsersForModal();
    selectedUsers.value = await fetchAssignedUserIds();
  } finally {
    usersLoading.value = false;
  }
};

watch(localOpen, async (open) => {
  if (open) await prepare();
});

// save assignment
// --- REPLACE your assignUsers() with this resilient version ---
const assignUsers = async () => {
  const pid = projectIdNum.value;
  if (!pid) {
    alert("Invalid project id.");
    return;
  }

  const idsNum = selectedUsers.value.map(id => Number(id)).filter(n => !Number.isNaN(n));
  const url = `${props.apiBaseUrl}/projects/${pid}/users/sync`;

  // Helper: clean headers
  const jsonHeaders = { ...props.getAuthHeaders(), "Content-Type": "application/json" };
  const formHeaders = { ...props.getAuthHeaders(), "Content-Type": "application/x-www-form-urlencoded" };

  saving.value = true;
  try {
    // 1) Try POST JSON: { user_ids: [...] }
    await axios.post(url, { user_ids: idsNum }, { headers: jsonHeaders });

    emit("saved");
    closeModal();
    return;

  } catch (e1) {
    // If method not allowed or validation mismatch, try PUT JSON
    const status1 = e1?.response?.status;
    if (![400,401,403,404,405,415,422].includes(status1)) {
      // unknown error => show and exit
      alert(e1.response?.data?.message || "Failed to sync users (POST JSON).");
      saving.value = false;
      return;
    }

    try {
      // 2) Try PUT JSON
      await axios.put(url, { user_ids: idsNum }, { headers: jsonHeaders });

      emit("saved");
      closeModal();
      return;

    } catch (e2) {
      // 3) Try form-url-encoded: user_ids[]=1&user_ids[]=2&_method=PUT
      try {
        const params = new URLSearchParams();
        idsNum.forEach(id => params.append("user_ids[]", String(id)));
        // If your route strictly needs PUT but client only allows POST:
        params.append("_method", "PUT");

        await axios.post(url, params, { headers: formHeaders });

        emit("saved");
        closeModal();
        return;

      } catch (e3) {
        console.error("Assign users failed (all attempts):", { e1, e2, e3 });
        const msg =
          e3?.response?.data?.message ||
          e2?.response?.data?.message ||
          e1?.response?.data?.message ||
          "Failed to sync users.";
        alert(msg);
      }
    }
  } finally {
    saving.value = false;
  }
};

</script>
