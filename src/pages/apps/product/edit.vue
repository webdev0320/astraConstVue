<script setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { VBtn, VCol, VFileInput, VForm, VRow, VTextField, VTextarea } from 'vuetify/components';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const route = useRoute();
const router = useRouter();

const productId = route.params.id;
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
  primary_image: null,
  other_name: '',
  other_description: '',
  other_locale: '',
});

const refForm = ref();
const loading = ref(false);

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const fetchProductDetails = async () => {
  try {
    const accessToken = getCookie('accessToken');
    if (!accessToken) {
      throw new Error('Access token is missing. Please log in.');
    }

    const decodedToken = decodeURIComponent(accessToken);

    console.log('Decoded Access Token:', decodedToken);

    const response = await axios.get(`${apiBaseUrl}/products/${productId}`, {
      headers: {
        Authorization: `Bearer ${decodedToken}`,
      },
    });

    console.log('Fetched Product:', response.data.products);
    Object.assign(product.value, response.data.products);
  } catch (error) {
    console.error('Error fetching product details:', error);
    alert('Failed to fetch product details. Check the console for more details.');
  }
};

const updateProduct = async () => {
  try {
    loading.value = true;

    const accessToken = getCookie('accessToken');
    if (!accessToken) {
      throw new Error('Access token is missing. Please log in.');
    }

    const decodedToken = decodeURIComponent(accessToken);

    console.log('Decoded Access Token:', decodedToken);

    const formData = new FormData();
    Object.keys(product.value).forEach((key) => {
      if (key === 'primary_image' && product.value[key]) {
        formData.append(key, product.value[key]);
      } else {
        formData.append(key, product.value[key] || '');
      }
    });

    for (const pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }

    await axios.post(`${apiBaseUrl}/products/${productId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${decodedToken}`,
      },
    });

    alert('Product updated successfully!');
    router.push('/dashboards/products');
  } catch (error) {
    console.error('Error updating product:', error);
    console.error('Validation errors:', error.response?.data?.errors);
    alert('Failed to update product. Check the console for more details.');
  } finally {
    loading.value = false;
  }
};


onMounted(() => {
  fetchProductDetails();
});
</script>


<template>
  <VForm ref="refForm" @submit.prevent="updateProduct">
    <VRow>
      <VCol cols="12" md="6">
        <VTextField v-model="product.name" label="Product Name" />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField v-model="product.status" label="Status" />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField v-model="product.selling_min_range" label="Selling Min Range" />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField v-model="product.selling_max_range" label="Selling Max Range" />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField v-model="product.selling_unit" label="Selling Unit" />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField v-model="product.daily_trade_volume" label="Daily Trade Volume" />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField v-model="product.daily_trade_unit" label="Daily Trade Unit" />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField v-model="product.area" label="Area" />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField v-model="product.area_unit" label="Area Unit" />
      </VCol>

      <VCol cols="12">
        <VTextarea v-model="product.description" label="Description" rows="3" />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField v-model="product.ready_to_market_date" label="Ready to Market Date" type="date" />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField v-model="product.location" label="Location" />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField v-model="product.address" label="Address" />
      </VCol>

      <VCol cols="12" md="6">
        <VFileInput v-model="product.primary_image" label="Primary Image" accept="image/*" />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField v-model="product.other_name" label="Other Name (Locale)" />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField v-model="product.other_description" label="Other Description" />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField v-model="product.other_locale" label="Other Locale" />
      </VCol>

      <VCol cols="12">
        <VBtn type="submit" color="primary" :loading="loading" :disabled="loading">Update</VBtn>
      </VCol>
    </VRow>
    <div v-if="message" class="mt-4">{{ message }}</div>
  </VForm>
</template>
