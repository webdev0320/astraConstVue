<script setup>
import axios from 'axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { VBtn, VCol, VForm, VRow, VTextField } from 'vuetify/components';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const router = useRouter();

const setting = ref({
  key: '',
  value: '',
});

const refForm = ref();
const loading = ref(false);
const message = ref('');

// Function to get the access token from cookies
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// Submit new setting data
const createSetting = async () => {
  try {
    loading.value = true;

    const accessToken = getCookie('accessToken');
    if (!accessToken) {
      throw new Error('Access token is missing. Please log in.');
    }

    const decodedToken = decodeURIComponent(accessToken);

    // Send new setting data to API
    const response = await axios.post(`${apiBaseUrl}/admin/settings`, setting.value, {
      headers: {
        Authorization: `Bearer ${decodedToken}`,
      },
    });

    alert('Setting created successfully!');
    console.log('Response:', response.data);

    router.push('/dashboards/settings'); // Navigate back to the settings list
  } catch (error) {
    console.error('Error creating setting:', error);
    alert('Failed to create setting.');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <h3>Create Setting</h3>
    </div>
  <VForm ref="refForm" @submit.prevent="createSetting">
    <VRow>
      <VCol cols="12" md="6">
        <VTextField
          v-model="setting.key"
          label="Key"
          required
        />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField
          v-model="setting.value"
          label="Value"
          required
        />
      </VCol>

      <VCol cols="12">
        <VBtn
          type="submit"
          color="primary"
          :loading="loading"
          :disabled="loading"
        >
          Create
        </VBtn>
      </VCol>
    </VRow>
    <div v-if="message" class="mt-4">{{ message }}</div>
  </VForm>
</div>
</template>

<style>
/* Add any custom styling if needed */
</style>
