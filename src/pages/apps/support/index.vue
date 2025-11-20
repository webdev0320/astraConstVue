<script setup>
import axios from 'axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { VBtn, VCol, VDataTable, VRow } from 'vuetify/components';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const router = useRouter();

// Table headers
const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Message', key: 'message' },
  { title: 'Answer', key: 'answer' },
  { title: 'Actions', key: 'actions', align: 'end' },
];

const tickets = ref([]);
const loading = ref(false);
const errorMessage = ref('');

// Function to get access token from cookies
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// Fetch support tickets
const fetchSupportTickets = async () => {
  try {
    loading.value = true;

    const accessToken = getCookie('accessToken');
    if (!accessToken) {
      throw new Error('Access token is missing. Please log in.');
    }

    const decodedToken = decodeURIComponent(accessToken);
    const response = await axios.get(`${apiBaseUrl}/support`, {
      headers: {
        Authorization: `Bearer ${decodedToken}`,
      },
    });

    // Map ticket data
    tickets.value = response.data.tickets.map((ticket) => ({
      id: ticket.id,
      message: ticket.message,
      answer: ticket.answer,
    }));
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    errorMessage.value = 'Failed to fetch support tickets.';
  } finally {
    loading.value = false;
  }
};
const viewTicket = (id) => {
  router.push(`/dashboards/supports/view/${id}`);
};
const deleteTicket = async (id) => {
  if (confirm('Are you sure you want to delete this ticket?')) {
    try {
      const accessToken = getCookie('accessToken');
      const decodedToken = decodeURIComponent(accessToken);

      await axios.delete(`${apiBaseUrl}/supports/${id}`, {
        headers: {
          Authorization: `Bearer ${decodedToken}`,
        },
      });

      // Remove ticket from list
      tickets.value = tickets.value.filter((ticket) => ticket.id !== id);
      alert('Ticket deleted successfully!');
    } catch (error) {
      console.error('Error deleting ticket:', error);
      alert('Failed to delete ticket.');
    }
  }
};

// Fetch tickets on component mount
fetchSupportTickets();
</script>

<template>
    <div>
  <VRow>
    <VCol>
            <div class="d-flex justify-between align-center mb-4">
                <h3>Support Tickets</h3>
                <VBtn color="primary" class="ms-auto" @click="$router.push('/dashboards/supports/create')">Create Support</VBtn>
            </div>

        <VDataTable
            :headers="headers"
            :items="tickets"
            :items-per-page="5"
            :loading="loading"
        >
            <!-- Ticket Actions -->
            <template #item.actions="{ item }">
                <VBtn
                color="primary"
                size="small"
                @click="viewTicket(item.id)"
                >
                View
             </VBtn>
            <!-- <VBtn
                color="error"
                size="small"
                @click="deleteTicket(item.id)"
            >
                Delete
            </VBtn> -->
            </template>
        </VDataTable>

        <p v-if="errorMessage" class="mt-4 text-danger">{{ errorMessage }}</p>
        </VCol>
    </VRow>
</div>
</template>

<style>
.v-data-table {
  margin-top: 16px;
}
.v-avatar {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 14px;
  color: white;
  text-transform: uppercase;
}
.d-flex {
  display: flex;
}
.justify-between {
  justify-content: space-between;
}
.align-center {
  align-items: center;
}
.ms-auto {
  margin-left: auto;
}
.gap-2 {
  gap: 8px;
}
</style>
