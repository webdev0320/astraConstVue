<script setup>
import axios from "axios";
import { ref } from "vue";
import { VBtn, VDataTable } from "vuetify/components";

const apiBaseUrl = 'https://dm.kreashionsoftwarehouse.com/astraConst/public/api';

const headers = [
  { title: "ID", key: "id" },
  { title: "Question", key: "question" },
  { title: "Answer", key: "answer" },
  { title: "Category", key: "category" },
  { title: "Status", key: "status" },
  { title: "Actions", key: "actions" },
];

const faqs = ref([]);
const errorMessage = ref("");

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

const fetchFaqs = async () => {
  try {
    const accessToken = getCookie("accessToken");
    if (!accessToken) {
      throw new Error("Access token is missing. Please log in.");
    }

    const decodedToken = decodeURIComponent(accessToken);
    const response = await axios.get(`${apiBaseUrl}/admin/faqs`, {
      headers: {
        Authorization: `Bearer ${decodedToken}`,
      },
    });

    faqs.value = response.data.data.map((faq) => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category.map((cat) => cat.name).join(", "),
      status: faq.status === 1 ? "Active" : "Inactive",
    }));
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    errorMessage.value = error.response?.data?.message || "Failed to fetch FAQs.";
  }
};

const deleteFaq = async (faqId) => {
  if (confirm("Are you sure you want to delete this FAQ?")) {
    try {
      const accessToken = getCookie("accessToken");
      const decodedToken = decodeURIComponent(accessToken);

      await axios.delete(`${apiBaseUrl}/admin/faqs/${faqId}`, {
        headers: {
          Authorization: `Bearer ${decodedToken}`,
        },
      });

      faqs.value = faqs.value.filter((faq) => faq.id !== faqId);
      alert("FAQ deleted successfully!");
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      alert("Failed to delete FAQ.");
    }
  }
};

fetchFaqs();
</script>

<template>
  <div>
    <div class="d-flex justify-between align-center mb-4">
      <h3>FAQs List</h3>
      <VBtn color="primary" class="ms-auto" @click="$router.push('/dashboards/faqs/create')">
        Create FAQ
      </VBtn>
    </div>

    <VDataTable
      v-if="faqs.length > 0"
      :headers="headers"
      :items="faqs"
      :items-per-page="5"
    >
      <template #item.actions="{ item }">
        <div class="d-flex gap-2">
          <VBtn color="warning" size="small" @click="$router.push(`/dashboards/faqs/edit/${item.id}`)">
            Edit
          </VBtn>
          <VBtn color="error" size="small" @click="deleteFaq(item.id)">
            Delete
          </VBtn>
        </div>
      </template>
    </VDataTable>
    <p v-else-if="errorMessage">{{ errorMessage }}</p>
    <p v-else>Loading...</p>
  </div>
</template>

<style>
.v-data-table {
  margin-top: 16px;
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
