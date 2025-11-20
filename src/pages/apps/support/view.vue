<script setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { VBtn, VCard, VCardText, VCol, VRow } from 'vuetify/components';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const route = useRoute();
const ticketId = route.params.id; // Get the ticket ID from the route parameters

const ticket = ref(null); // Holds the ticket details
const loading = ref(false);
const errorMessage = ref('');

// Function to get the access token from cookies
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// Fetch ticket details by ID
const fetchTicketDetails = async () => {
  try {
    loading.value = true;

    const accessToken = getCookie('accessToken');
    if (!accessToken) {
      throw new Error('Access token is missing. Please log in.');
    }

    const decodedToken = decodeURIComponent(accessToken);
    const response = await axios.get(`${apiBaseUrl}/support/${ticketId}`, {
      headers: {
        Authorization: `Bearer ${decodedToken}`,
      },
    });

    ticket.value = response.data.ticket; // Assign fetched ticket data
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    errorMessage.value = 'Failed to fetch ticket details.';
  } finally {
    loading.value = false;
  }
};

// Fetch ticket details on component mount
onMounted(() => {
  fetchTicketDetails();
});
</script>

<template>
  <VRow>
    <VCol cols="12" md="8" class="mx-auto">
      <VCard v-if="ticket" class="pa-4">
        <h3 class="mb-4">Support Ticket Details</h3>

        <VCardText>
          <p><strong>Message:</strong> {{ ticket.message }}</p>
        </VCardText>

        <VBtn color="primary" @click="$router.push('/dashboards/supports')">
          Back to Tickets
        </VBtn>
      </VCard>

      <div v-if="loading" class="text-center">Loading ticket details...</div>
      <div v-if="errorMessage" class="text-danger text-center">{{ errorMessage }}</div>
    </VCol>
  </VRow>
</template>

<style>
/* Add any custom styles if needed */
.v-card {
  margin-top: 16px;
}
.text-center {
  margin-top: 20px;
  font-size: 18px;
}
</style>
