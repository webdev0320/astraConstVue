<template>
  <VForm ref="refForm" @submit.prevent="submitForm">
    <VRow>
      <VCol cols="12" md="6">
        <VTextField v-model="faq.question" label="Question" :rules="[requiredValidator]" />
      </VCol>

      <VCol cols="12">
        <VTextarea v-model="faq.answer" label="Answer" :rules="[requiredValidator]" rows="3" />
      </VCol>

      <VCol cols="12" md="6">
        <VSelect
          v-model="faq.status"
          :items="statusOptions"
          label="Status"
          :rules="[requiredValidator]"
        />
      </VCol>

      <VCol cols="12" md="6">
        <VSelect
          v-model="faq.categories"
          :items="categoryOptions"
          label="Categories"
          multiple
          chips
          item-title="name"
          item-value="id"
          :rules="[requiredValidator]"
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
    <div v-if="message" class="mt-4">{{ message }}</div>
  </VForm>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const faq = ref({
  question: "",
  answer: "",
  status: "",
  categories: [], // Use an array for multiple categories
});

const statusOptions = ["Active", "Inactive"];
const categoryOptions = ref([]); // Initially empty, will be populated dynamically

const refForm = ref();
const loading = ref(false);
const message = ref("");
const router = useRouter();

const requiredValidator = (value) => !!value || "This field is required";

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

// Fetch FAQ Categories
const fetchCategories = async () => {
  try {
    const accessToken = getCookie("accessToken");
    if (!accessToken) {
      throw new Error("Access token is missing. Please log in.");
    }

    const decodedToken = decodeURIComponent(accessToken);

    const response = await axios.get(`${apiBaseUrl}/getFaqCategories`, {
      headers: {
        Authorization: `Bearer ${decodedToken}`,
      },
    });

    console.log("Fetched Categories:", response.data.categories);

    // Populate category options
    categoryOptions.value = response.data.categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    alert("Failed to fetch FAQ categories. Please try again.");
  }
};

// Submit FAQ Form
const submitForm = async () => {
  try {
    loading.value = true;

    const accessToken = getCookie("accessToken");
    if (!accessToken) {
      throw new Error("Access token is missing. Please log in.");
    }

    const decodedToken = decodeURIComponent(accessToken);

    const formData = {
      question: faq.value.question,
      answer: faq.value.answer,
      status: faq.value.status === "Active" ? 1 : 0, // Convert status to numeric
      category: faq.value.categories, // Array of selected category IDs
    };

    console.log("Form Data Sent:", formData);

    const response = await axios.post(`${apiBaseUrl}/admin/faqs`, formData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${decodedToken}`,
      },
    });

    message.value = "FAQ created successfully!";
    console.log("Response:", response.data);

    // Redirect to FAQs page after successful submission
    router.push("/dashboards/faqs");
  } catch (error) {
    console.error("Error submitting form:", error);
    alert(error.response?.data?.message || "Failed to create FAQ. Please try again.");
  } finally {
    loading.value = false;
  }
};

// Fetch categories on component mount
onMounted(() => {
  fetchCategories();
});
</script>

<style>
/* Add custom styling if needed */
</style>
