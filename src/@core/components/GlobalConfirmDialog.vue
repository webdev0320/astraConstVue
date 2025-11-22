<template>
  <VDialog :model-value="internalValue" max-width="480" @update:model-value="updateValue">
    <VCard>
      <VCardTitle class="text-h6">{{ title }}</VCardTitle>

      <VCardText>
        <p v-if="message">{{ message }}</p>

        <!-- Remarks Textarea -->
        <VTextarea
          v-model="remarks"
          label="Remarks"
          variant="outlined"
          density="compact"
          class="mt-3"
          :disabled="loading"
          rows="3"
          auto-grow
        />
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="cancel" :disabled="loading">Cancel</VBtn>
        <VBtn :color="color" @click="confirmWithRemarks" :loading="loading">
          {{ confirmText }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from "vue";
import {
  VDialog,
  VCard,
  VCardTitle,
  VCardText,
  VCardActions,
  VSpacer,
  VBtn,
  VTextarea,
} from "vuetify/components";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: "Confirm Action" },
  message: { type: String, default: "" },
  confirmText: { type: String, default: "Yes" },
  color: { type: String, default: "primary" },
  // optional callback prop (your existing pattern)
  onConfirm: { type: Function, required: false },
});

const emit = defineEmits(["update:modelValue", "confirm"]);

const internalValue = ref(!!props.modelValue);
const loading = ref(false);
const remarks = ref("");

// keep internalValue in sync with incoming prop
watch(() => props.modelValue, (v) => {
  internalValue.value = !!v;
});

const updateValue = (val) => {
  internalValue.value = val;
  // emit to parent (v-model)
  emit("update:modelValue", val);
};

const cancel = () => {
  remarks.value = "";
  updateValue(false);
};

const confirmWithRemarks = async () => {
  // call parent callback prop if provided, await it
  try {
    loading.value = true;

    if (props.onConfirm && typeof props.onConfirm === "function") {
      // Allow parent to return a promise — await so we can show loading
      await props.onConfirm(remarks.value);
    }

    // Also emit an event for alternatives
    emit("confirm", remarks.value);

    // reset and close
    remarks.value = "";
    updateValue(false);
  } catch (err) {
    // If parent throws, keep dialog open so user can retry
    console.error("Confirm action failed:", err);
    // optionally show an error toast here
  } finally {
    loading.value = false;
  }
};
</script>
