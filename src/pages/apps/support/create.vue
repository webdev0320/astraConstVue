<script setup>
import axios from 'axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { VBtn, VCol, VForm, VRow, VTextarea } from 'vuetify/components';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const router = useRouter();

const ticket = ref({
  message: '', 
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

const submitForm = async () => {
  try {
    loading.value = true;

    const accessToken = getCookie('accessToken');
    if (!accessToken) {
      throw new Error('Access token is missing. Please log in.');
    }

    const decodedToken = decodeURIComponent(accessToken);

    const response = await axios.post(`${apiBaseUrl}/support`, ticket.value, {
      headers: {
        Authorization: `Bearer ${decodedToken}`,
      },
    });

    alert('Support ticket created successfully!');
    router.push('/dashboards/supports'); 
  } catch (error) {
    console.error('Error submitting form:', error);
    message.value = error.response?.data?.message || 'Failed to create support ticket.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <VForm ref="refForm" @submit.prevent="submitForm">
    <VRow>
      <VCol cols="12">
        <VTextarea
          v-model="ticket.message"
          label="Message"
          rows="5"
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
          Submit
        </VBtn>
      </VCol>
    </VRow>

    <div v-if="message" class="mt-4 text-danger">{{ message }}</div>
  </VForm>
</template>

<style>
/* Add any custom styles if needed */
.v-textarea {
  margin-top: 16px;
}
</style>
