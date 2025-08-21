<script setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { VBtn, VCol, VForm, VRow, VTextField } from 'vuetify/components';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const route = useRoute();
const router = useRouter();

const settingId = route.params.id;
const setting = ref({
  key: '',
  value: '',
});

const refForm = ref();
const loading = ref(false);
const message = ref('');

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const fetchSettingDetails = async () => {
  try {
    const accessToken = getCookie('accessToken');
    if (!accessToken) {
      throw new Error('Access token is missing. Please log in.');
    }
    const decodedToken = decodeURIComponent(accessToken);
    const response = await axios.get(`${apiBaseUrl}/admin/settings/${settingId}`, {
      headers: {
        Authorization: `Bearer ${decodedToken}`,
      },
    });

    console.log('Fetched Setting:', response.data.setting);
    setting.value = response.data.setting;
  } catch (error) {
    console.error('Error fetching setting details:', error);
    alert('Failed to fetch setting details.');
  }
};

const updateSetting = async () => {
  try {
    loading.value = true;

    const accessToken = getCookie('accessToken');
    if (!accessToken) {
      throw new Error('Access token is missing. Please log in.');
    }

    const decodedToken = decodeURIComponent(accessToken);

    const payload = {
      ...setting.value,
      _method: 'PUT',
    };

    await axios.post(`${apiBaseUrl}/admin/settings/${settingId}`, payload, {
      headers: {
        Authorization: `Bearer ${decodedToken}`,
      },
    });

    alert('Setting updated successfully!');
    router.push('/dashboards/settings');
  } catch (error) {
    console.error('Error updating setting:', error);
    alert('Failed to update setting.');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchSettingDetails();
});
</script>

<template>
  <VForm ref="refForm" @submit.prevent="updateSetting">
    <VRow>
      <VCol cols="12" md="6">
        <VTextField
          v-model="setting.key"
          label="Key"
          required
          disabled
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
          Update
        </VBtn>
      </VCol>
    </VRow>
    <div v-if="message" class="mt-4">{{ message }}</div>
  </VForm>
</template>

<style>
</style>
