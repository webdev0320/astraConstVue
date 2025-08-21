<template>
  <VForm ref="refForm" @submit.prevent="updateFaq">
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
          Update
        </VBtn>
      </VCol>
    </VRow>
    <div v-if="message" class="mt-4">{{ message }}</div>
  </VForm>
</template>

<script setup>
import axios from "axios";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const route = useRoute();
const router = useRouter();

const faqId = route.params.id; // Extract FAQ ID from the route
const faq = ref({
  question: "",
  answer: "",
  status: "",
  categories: [],
});

const statusOptions = ["Active", "Inactive"];
const categoryOptions = ref([]); // Fetch categories dynamically

const refForm = ref();
const loading = ref(false);
const message = ref("");

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

    categoryOptions.value = response.data.categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    alert("Failed to fetch FAQ categories. Check the console for more details.");
  }
};

// Fetch FAQ Details
const fetchFaqDetails = async () => {
  try {
    const accessToken = getCookie("accessToken");
    if (!accessToken) {
      throw new Error("Access token is missing. Please log in.");
    }

    const decodedToken = decodeURIComponent(accessToken);

    const response = await axios.get(`${apiBaseUrl}/admin/faqs/${faqId}`, {
      headers: {
        Authorization: `Bearer ${decodedToken}`,
      },
    });

    console.log("Fetched FAQ Response:", response.data);

    const faqData = response.data.data.faq;
    faq.value = {
      question: faqData.question || "",
      answer: faqData.answer || "",
      status: faqData.status === 1 ? "Active" : "Inactive",
      categories: faqData.category.map((cat) => cat.id), // Map category objects to IDs
    };

    console.log("FAQ Value After Mapping:", faq.value);
  } catch (error) {
    console.error("Error fetching FAQ details:", error);
    alert("Failed to fetch FAQ details. Check the console for more details.");
  }
};

// Update FAQ
const updateFaq = async () => {
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
      status: faq.value.status === "Active" ? 1 : 0,
      category: faq.value.categories, // Send selected category IDs
    };

    console.log("Form Data:", formData);

    await axios.put(`${apiBaseUrl}/admin/faqs/${faqId}`, formData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${decodedToken}`,
      },
    });

    alert("FAQ updated successfully!");
    router.push("/dashboards/faqs");
  } catch (error) {
    console.error("Error updating FAQ:", error);
    alert("Failed to update FAQ. Check the console for more details.");
  } finally {
    loading.value = false;
  }
};

// Fetch FAQ details and categories on component mount
onMounted(() => {
  fetchCategories();
  fetchFaqDetails();
});
</script>

<style>
/* Add custom styling if needed */
</style>
