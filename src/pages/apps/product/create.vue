<template>
  <VForm
    ref="refForm"
    @submit.prevent="submitForm"
  >
    <VRow>
      <VCol cols="12" md="6">
        <VTextField v-model="product.name" label="Product Name" :rules="[requiredValidator]" />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField v-model="product.status" label="Status" :rules="[requiredValidator]" />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField v-model="product.selling_min_range" label="Selling Min Range" :rules="[requiredValidator]" />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField v-model="product.selling_max_range" label="Selling Max Range" :rules="[requiredValidator]" />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField v-model="product.selling_unit" label="Selling Unit" :rules="[requiredValidator]" />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField v-model="product.daily_trade_volume" label="Daily Trade Volume" :rules="[requiredValidator]" />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField v-model="product.daily_trade_unit" label="Daily Trade Unit" :rules="[requiredValidator]" />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField v-model="product.area" label="Area" :rules="[requiredValidator]" />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField v-model="product.area_unit" label="Area Unit" :rules="[requiredValidator]" />
      </VCol>

      <VCol cols="12">
        <VTextarea v-model="product.description" label="Description" :rules="[requiredValidator]" rows="3" />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField v-model="product.ready_to_market_date" label="Ready to Market Date" type="date" :rules="[requiredValidator]" />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField v-model="product.location" label="Location" :rules="[requiredValidator]" />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField v-model="product.address" label="Address" :rules="[requiredValidator]" />
      </VCol>

      <VCol cols="12" md="6">
        <VFileInput
          v-model="product.images"
          label="Primary Images"
          multiple
          :rules="[requiredValidator]"
          accept="image/*"
        />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField v-model="product.other_name" label="Other Name (Locale)" :rules="[requiredValidator]" />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField v-model="product.other_description" label="Other Description" :rules="[requiredValidator]" />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField v-model="product.other_locale" label="Other Locale" :rules="[requiredValidator]" />
      </VCol>

      <VCol cols="12">
        <VBtn
          type="submit"
          color="primary"
          :loading="loading"
          :disabled="loading"
        >
          Submit
        </VBtn>
      </VCol>
    </VRow>
    <div v-if="message" class="mt-4">{{ message }}</div>
  </VForm>
</template>

<script setup>
import axios from 'axios';
import { ref } from 'vue';
import { VBtn, VCol, VFileInput, VForm, VRow, VTextField, VTextarea } from 'vuetify/components';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
console.log('sddddddddddddddddddd',apiBaseUrl)
const product = ref({
  name: '',
  status: '',
  selling_min_range: '',
  selling_max_range: '',
  selling_unit: '',
  daily_trade_volume: '',
  daily_trade_unit: '',
  area: '',
  area_unit: '',
  description: '',
  ready_to_market_date: '',
  location: '',
  address: '',
  images: [],
  other_name: '',
  other_description: '',
  other_locale: '',
});

const refForm = ref();
const loading = ref(false);
const message = ref('');

const requiredValidator = (value) => !!value || 'This field is required';

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
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
      name: product.value.name,
      status: product.value.status,
      selling_min_range: product.value.selling_min_range,
      selling_max_range: product.value.selling_max_range,
      selling_unit: product.value.selling_unit,
      daily_trade_volume: product.value.daily_trade_volume,
      daily_trade_unit: product.value.daily_trade_unit,
      area: product.value.area,
      area_unit: product.value.area_unit,
      description: product.value.description,
      ready_to_market_date: product.value.ready_to_market_date,
      location: product.value.location,
      address: product.value.address,
      images: product.value.images, // Assuming it's already uploaded or handled
      other_name: product.value.other_name,
      other_description: product.value.other_description,
      other_locale: product.value.other_locale,
    };

    console.log("Form Data Sent:", formData);

    const response = await axios.post(`${apiBaseUrl}/products`, formData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${decodedToken}`,
      },
    });

    message.value = response.data.message || "Product created successfully!";
    console.log("Response:", response.data);

    // Reset form and redirect to product list
    Object.keys(product.value).forEach((key) => (product.value[key] = ""));
    router.push("/dashboards/products");
  } catch (error) {
    console.error("Error submitting form:", error);
    console.log("Validation Errors:", error.response?.data?.errors);

    if (error.response?.data?.errors) {
      errorMessages.value = error.response.data.errors; // Show specific field errors
    } else {
      message.value =
        error.response?.data?.message || "Failed to create product.";
    }
  } finally {
    loading.value = false;
  }
};

</script>

<style>
/* Add any custom styling if needed */
</style>
