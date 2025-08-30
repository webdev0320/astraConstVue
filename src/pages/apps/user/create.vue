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

      <!-- Password -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="user.password"
          label="Password"
          type="password"
          :rules="[requiredValidator, minLengthValidator(8)]"
          :error-messages="errorMessages.password"
        />
      </VCol>

      <!-- Confirm Password -->
      <VCol cols="12" md="6">
        <VTextField
          v-model="user.password_confirmation"
          label="Confirm Password"
          type="password"
          :rules="[requiredValidator, matchPasswordValidator]"
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

      <!-- Submit -->
      <VCol cols="12">
        <VBtn type="submit" color="primary" :loading="loading" :disabled="loading">
          Submit
        </VBtn>
      </VCol>
    </VRow>

    <div v-if="message" class="mt-4">{{ message }}</div>
  </VForm>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { VForm, VRow, VCol, VTextField, VSelect, VBtn } from "vuetify/components";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const router = useRouter();

const user = ref({
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
  mobile_number: "",
  language_id: null,
  latitude: "",
  longitude: "",
  address: "",
  role: "", // role NAME string (backend expects name in assignRole)
});

const roleOptions = ref([]);       
const languageOptions = ref([]);   
const rolesLoading = ref(false);
const languagesLoading = ref(false);

const refForm = ref();
const loading = ref(false);
const message = ref("");
const errorMessages = ref({});

// --- validators ---
const requiredValidator = v => !!v || "This field is required";
const emailValidator = v => /^\S+@\S+\.\S+$/.test(v) || "Invalid email address";
const minLengthValidator = n => v => (v && v.length >= n) || `Minimum ${n} characters required`;
const matchPasswordValidator = v => v === user.value.password || "Passwords do not match";
const mobileNumberValidator = v => /^\+\d{10,15}$/.test(v) || "Invalid mobile number format. Include country code.";
const latitudeValidator = v => v === "" || (v >= -90 && v <= 90) || "Latitude must be between -90 and 90.";
const longitudeValidator = v => v === "" || (v >= -180 && v <= 180) || "Longitude must be between -180 and 180.";

// --- auth helpers ---
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

// --- load dropdowns ---
const fetchRoles = async () => {
  rolesLoading.value = true;
  try {
    const res = await axios.get(`${apiBaseUrl}/getRoles`, { headers: getHeaders() });
    const arr = res?.data?.roles ?? res?.data?.data?.roles ?? [];
    roleOptions.value = arr.map(r => ({ id: r.id, name: r.name }));
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
    // API has a key typo sometimes: "langauges"
    const arr = res?.data?.langauges ?? res?.data?.languages ?? res?.data?.data?.languages ?? [];
    languageOptions.value = arr.map(l => ({ id: l.id, name: l.name, short_code: l.short_code }));
  } catch (e) {
    console.error("Error loading languages:", e);
  } finally {
    languagesLoading.value = false;
  }
};

// --- submit ---
const submitForm = async () => {
  try {
    loading.value = true;
    errorMessages.value = {};

    const payload = {
      name: user.value.name,
      email: user.value.email,
      password: user.value.password,
      password_confirmation: user.value.password_confirmation,
      mobile_number: user.value.mobile_number,
      language_id: user.value.language_id,
      latitude: user.value.latitude || null,
      longitude: user.value.longitude || null,
      address: user.value.address,
      role: user.value.role,
    };

    const res = await axios.post(`${apiBaseUrl}/users`, payload, {
      headers: { "Content-Type": "application/json", ...getHeaders() },
    });

    message.value = res.data.message || "User created successfully!";
    Object.keys(user.value).forEach(k => (user.value[k] = ""));
    router.push("/dashboards/users");
  } catch (error) {
    if (error.response?.status === 422 && error.response.data?.errors) {
      errorMessages.value = error.response.data.errors;
    } else {
      message.value = error.response?.data?.message || "Failed to create user.";
    }
    console.error("Create error:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await Promise.all([fetchRoles(), fetchLanguages()]);
});
</script>

<style>
.mt-4 { margin-top: 16px; }
</style>
