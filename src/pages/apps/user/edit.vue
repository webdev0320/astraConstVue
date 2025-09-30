<template>
  <VForm ref="refForm" @submit.prevent="submitForm">
    <VRow>
      <!-- Name -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="user.name"
          label="Name"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.name"
        />
      </VCol>

      <!-- Email -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="user.email"
          label="Email"
          :rules="[requiredValidator, emailValidator]"
          :error-messages="errorMessages.email"
        />
      </VCol>

      <!-- New Password (optional) -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="user.password"
          label="New Password (optional)"
          type="password"
          :rules="[optionalMinLengthValidator(8)]"
          :error-messages="errorMessages.password"
        />
      </VCol>

      <!-- Confirm New Password (optional) -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="user.password_confirmation"
          label="Confirm New Password (optional)"
          type="password"
          :rules="[optionalMatchPasswordValidator]"
          :error-messages="errorMessages.password_confirmation"
        />
      </VCol>

      <!-- Mobile Number -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="user.mobile_number"
          label="Mobile Number"
          :rules="[requiredValidator, mobileNumberValidator]"
          :error-messages="errorMessages.mobile_number"
        />
      </VCol>

      <!-- Language (dynamic) -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="user.language_id"
          :items="languageOptions"
          item-title="name"
          item-value="id"
          label="Language"
          :loading="languagesLoading"
          :disabled="languagesLoading"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.language_id"
        />
      </VCol>

      <!-- Location (dynamic) -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="user.location_id"
          :items="locationOptions"
          item-title="name"
          item-value="id"
          label="Location"
          :loading="locationsLoading"
          :disabled="locationsLoading"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.location_id"
        />
      </VCol>

      <!-- Latitude -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="user.latitude"
          label="Latitude"
          :rules="[latitudeValidator]"
          :error-messages="errorMessages.latitude"
        />
      </VCol>

      <!-- Longitude -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="user.longitude"
          label="Longitude"
          :rules="[longitudeValidator]"
          :error-messages="errorMessages.longitude"
        />
      </VCol>

      <!-- Address -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="user.address"
          label="Address"
          :error-messages="errorMessages.address"
        />
      </VCol>

      <!-- Role (dynamic from /getRoles) -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="user.role"
          :items="roleOptions"
          item-title="name"
          item-value="name"
          label="Role"
          :loading="rolesLoading"
          :disabled="rolesLoading"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.role"
        />
      </VCol>

      <!-- Update -->
      <VCol cols="12">
        <VBtn type="submit" color="primary" :loading="saving" :disabled="saving">
          Update
        </VBtn>
      </VCol>
    </VRow>

    <div v-if="message" class="mt-4">{{ message }}</div>
  </VForm>
</template>

<script setup>
import axios from "axios";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { VBtn, VCol, VForm, VRow, VSelect, VTextField } from "vuetify/components";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const router = useRouter();
const route = useRoute();
const id = Number(route.params.id);

const user = ref({
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
  mobile_number: "",
  language_id: null,
  location_id: null, // NEW
  latitude: "",
  longitude: "",
  address: "",
  role: "",
});

const roleOptions = ref([]);
const languageOptions = ref([]);
const locationOptions = ref([]); // NEW

const rolesLoading = ref(false);
const languagesLoading = ref(false);
const locationsLoading = ref(false); // NEW

const saving = ref(false);
const message = ref("");
const errorMessages = ref({});

// validators
const requiredValidator = (v) => !!v || "This field is required";
const emailValidator = (v) => /^\S+@\S+\.\S+$/.test(v) || "Invalid email address";
const mobileNumberValidator = (v) => /^\+\d{10,15}$/.test(v) || "Invalid mobile number format. Include country code.";
const latitudeValidator = (v) => v === "" || (v >= -90 && v <= 90) || "Latitude must be between -90 and 90.";
const longitudeValidator = (v) => v === "" || (v >= -180 && v <= 180) || "Longitude must be between -180 and 180.";
const optionalMinLengthValidator = (n) => (v) => !v || v.length >= n || `Minimum ${n} characters required`;
const optionalMatchPasswordValidator = (v) => !user.value.password || v === user.value.password || "Passwords do not match";

// auth helpers
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};
const getHeaders = () => {
  const token = getCookie("accessToken");
  if (!token) throw new Error("Access token is missing. Please log in.");
  return { Authorization: `Bearer ${decodeURIComponent(token)}`, Accept: "application/json" };
};

// dropdowns
const fetchRoles = async () => {
  rolesLoading.value = true;
  try {
    const res = await axios.get(`${apiBaseUrl}/getRoles`, { headers: getHeaders() });
    const arr = res?.data?.roles ?? res?.data?.data?.roles ?? [];
    roleOptions.value = arr.map((r) => ({ id: r.id, name: r.name }));
  } catch (e) {
    console.error("Error loading roles:", e);
  } finally {
    rolesLoading.value = false;
  }
};

const fetchLanguages = async () => {
  languagesLoading.value = true;
  try {
    const res = await axios.get(`${apiBaseUrl}/getLanguages`, { headers: getHeaders() });
    const arr = res?.data?.langauges ?? res?.data?.languages ?? res?.data?.data?.languages ?? [];
    languageOptions.value = arr.map((l) => ({ id: l.id, name: l.name, short_code: l.short_code }));
  } catch (e) {
    console.error("Error loading languages:", e);
  } finally {
    languagesLoading.value = false;
  }
};

// NEW: Locations
const fetchLocations = async () => {
  locationsLoading.value = true;
  try {
    // If apiBaseUrl === {{baseUrl}}/api, this hits {{baseUrl}}/api/locations
    const res = await axios.get(`${apiBaseUrl}/locations`, { headers: getHeaders() });
    const arr = Array.isArray(res?.data) ? res.data : (res?.data?.data ?? []);
    locationOptions.value = arr.map((l) => ({ id: l.id, name: l.name }));
  } catch (e) {
    console.error("Error loading locations:", e);
  } finally {
    locationsLoading.value = false;
  }
};

// role picker from various shapes
const pickRole = (u) => {
  if (typeof u?.role === "string" && u.role) return u.role;
  if (typeof u?.role_name === "string" && u.role_name) return u.role_name;
  if (Array.isArray(u?.roles) && u.roles.length) {
    const first = u.roles[0];
    if (typeof first === "string") return first;
    if (first?.name) return first.name;
  }
  return "";
};

// load user
const loadUser = async () => {
  try {
    const res = await axios.get(`${apiBaseUrl}/users/${id}`, {
      headers: getHeaders(),
    });

    const dataUser = res?.data?.data?.user ?? res?.data?.user ?? res?.data;
    if (!dataUser) throw new Error("Unexpected response format.");

    user.value = {
      name: dataUser.name ?? "",
      email: dataUser.email ?? "",
      password: "",
      password_confirmation: "",
      mobile_number: dataUser.mobile_number ?? "",
      language_id: dataUser.language_id ?? null,
      location_id: dataUser.location_id ?? null, // NEW
      latitude: dataUser.latitude ?? "",
      longitude: dataUser.longitude ?? "",
      address: dataUser.address ?? "",
      role: pickRole(dataUser) || "",
    };
  } catch (e) {
    console.error("Load user error:", e);
    message.value = e.response?.data?.message || "Failed to load user.";
  }
};

const submitForm = async () => {
  try {
    saving.value = true;
    errorMessages.value = {};

    const payload = {
      name: user.value.name,
      email: user.value.email,
      mobile_number: user.value.mobile_number,
      language_id: user.value.language_id,
      location_id: user.value.location_id, // NEW
      latitude: user.value.latitude || null,
      longitude: user.value.longitude || null,
      address: user.value.address,
      role: user.value.role, // NAME string
    };
    if (user.value.password) {
      payload.password = user.value.password;
      payload.password_confirmation = user.value.password_confirmation;
    }

    await axios.put(`${apiBaseUrl}/users/${id}`, payload, {
      headers: { "Content-Type": "application/json", ...getHeaders() },
    });

    message.value = "User updated successfully!";
    router.push("/dashboards/users");
  } catch (error) {
    if (error.response?.status === 422 && error.response.data?.errors) {
      errorMessages.value = error.response.data.errors;
    } else {
      message.value = error.response?.data?.message || "Failed to update user.";
    }
    console.error("Update error:", error);
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  await Promise.all([fetchRoles(), fetchLanguages(), fetchLocations()]); // include locations
  await loadUser();
});
</script>

<style>
.mt-4 { margin-block-start: 16px; }
</style>
