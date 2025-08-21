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

      <!-- Language -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="user.language_id"
          :items="languageOptions"
          label="Language"
          item-title="name"
          item-value="id"
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

      <!-- Role -->
      <VCol cols="12" md="6">
        <VSelect
          v-model="user.role"
          :items="roleOptions"
          label="Role"
          :rules="[requiredValidator]"
          :error-messages="errorMessages.role"
        />
      </VCol>

      <!-- Submit Button -->
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
import { ref } from "vue";
import { useRouter } from "vue-router";

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
const errorMessages = ref({});

const requiredValidator = (value) => !!value || "This field is required";
const emailValidator = (value) =>
  /^\S+@\S+\.\S+$/.test(value) || "Invalid email address";
const minLengthValidator = (length) => (value) =>
  (value && value.length >= length) || `Minimum ${length} characters required`;
const matchPasswordValidator = (value) =>
  value === user.value.password || "Passwords do not match";
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

const submitForm = async () => {
  try {
    loading.value = true;
    errorMessages.value = {}; // Reset error messages

    const accessToken = getCookie("accessToken");
    if (!accessToken) {
      throw new Error("Access token is missing. Please log in.");
    }

    const decodedToken = decodeURIComponent(accessToken);

    const formData = {
      name: user.value.name,
      email: user.value.email,
      password: user.value.password,
      password_confirmation: user.value.password_confirmation,
      mobile_number: user.value.mobile_number,
      language_id: user.value.language_id,
      latitude: user.value.latitude || null,
      longitude: user.value.longitude || null,
      address: user.value.address,
      role: user.value.role.toLowerCase(), // Ensure role is in the correct format
    };

    console.log("Form Data Sent:", formData);

    const response = await axios.post(`${apiBaseUrl}/admin/users`, formData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${decodedToken}`,
      },
    });

    message.value = response.data.message || "User created successfully!";
    console.log("Response:", response.data);

    // Reset form and redirect to user list
    Object.keys(user.value).forEach((key) => (user.value[key] = ""));
    router.push("/dashboards/users");
  } catch (error) {
    console.error("Error submitting form:", error);
    console.log("Validation Errors:", error.response?.data?.errors);

    if (error.response?.data?.errors) {
      errorMessages.value = error.response.data.errors; // Show specific field errors
    } else {
      message.value =
        error.response?.data?.message || "Failed to create user.";
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style>
/* Add custom styling if needed */
</style>
