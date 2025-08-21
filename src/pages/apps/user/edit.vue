<template>
  <VForm ref="refForm" @submit.prevent="updateUser">
    <VRow>
      <VCol cols="12" md="6">
        <VTextField v-model="user.name" label="Name" :rules="[requiredValidator]" />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField v-model="user.email" label="Email" :rules="[requiredValidator, emailValidator]" disabled />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField v-model="user.mobile_number" label="Mobile Number" :rules="[requiredValidator, mobileNumberValidator]" />
      </VCol>

      <VCol cols="12" md="6">
        <VSelect
          v-model="user.language_id"
          :items="languageOptions"
          label="Language"
          item-title="name"
          item-value="id"
          :rules="[requiredValidator]"
        />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField v-model="user.latitude" label="Latitude" :rules="[latitudeValidator]" />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField v-model="user.longitude" label="Longitude" :rules="[longitudeValidator]" />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField v-model="user.address" label="Address" />
      </VCol>

      <VCol cols="12" md="6">
        <VSelect
          v-model="user.role"
          :items="roleOptions"
          label="Role"
          :rules="[requiredValidator]"
        />
      </VCol>

      <VCol cols="12">
        <VBtn type="submit" color="primary" :loading="loading" :disabled="loading">
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

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const route = useRoute();
const router = useRouter();

const userId = route.params.id;

const user = ref({
  name: "",
  email: "",
  mobile_number: "",
  language_id: null,
  latitude: "",
  longitude: "",
  address: "",
  role: "",
});

const languageOptions = [
  { id: 22, name: "English" },
  { id: 23, name: "French" },
  { id: 24, name: "Spanish" },
];

const roleOptions = ["Admin", "Supplier", "Customer"];

const refForm = ref();
const loading = ref(false);
const message = ref("");

const requiredValidator = (value) => !!value || "This field is required";
const emailValidator = (value) =>
  /^\S+@\S+\.\S+$/.test(value) || "Invalid email address";

const mobileNumberValidator = (value) =>
  /^\+\d{10,15}$/.test(value) || "Invalid mobile number format. Include country code.";

const latitudeValidator = (value) =>
  value === "" || (value >= -90 && value <= 90) || "Latitude must be between -90 and 90.";

const longitudeValidator = (value) =>
  value === "" || (value >= -180 && value <= 180) || "Longitude must be between -180 and 180.";

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

// Fetch User Details
const fetchUserDetails = async () => {
  try {
    const accessToken = getCookie("accessToken");
    if (!accessToken) {
      throw new Error("Access token is missing. Please log in.");
    }

    const decodedToken = decodeURIComponent(accessToken);

    const response = await axios.get(`${apiBaseUrl}/admin/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${decodedToken}`,
      },
    });

    console.log("Fetched User:", response.data.data.user);

    const data = response.data.data.user;
    user.value = {
      name: data.name || "",
      email: data.email || "",
      mobile_number: data.mobile_number || "",
      language_id: data.language_id || null,
      latitude: data.latitude || "",
      longitude: data.longitude || "",
      address: data.address || "",
      role: data.role || "Customer", // Default role if missing
    };
  } catch (error) {
    console.error("Error fetching user details:", error);
    alert("Failed to fetch user details. Check the console for more details.");
  }
};

// Update User
const updateUser = async () => {
  try {
    loading.value = true;

    const accessToken = getCookie("accessToken");
    if (!accessToken) {
      throw new Error("Access token is missing. Please log in.");
    }

    const decodedToken = decodeURIComponent(accessToken);

    const formData = {
      name: user.value.name,
      mobile_number: user.value.mobile_number,
      language_id: user.value.language_id,
      latitude: user.value.latitude || null,
      longitude: user.value.longitude || null,
      address: user.value.address,
      role: user.value.role,
    };

    console.log("Form Data Sent:", formData);

    await axios.put(`${apiBaseUrl}/admin/users/${userId}`, formData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${decodedToken}`,
      },
    });

    alert("User updated successfully!");
    router.push("/dashboards/users");
  } catch (error) {
    console.error("Error updating user:", error);
    alert("Failed to update user. Check the console for more details.");
  } finally {
    loading.value = false;
  }
};

// Fetch user details on component mount
onMounted(() => {
  fetchUserDetails();
});
</script>

<style>
/* Add custom styling if needed */
</style>
