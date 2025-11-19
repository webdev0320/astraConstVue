<template>
  <VDialog :model-value="internalValue" max-width="400" @update:model-value="updateValue">
    <VCard>
      <VCardTitle class="text-h6">{{ title }}</VCardTitle>
      <VCardText>{{ message }}</VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" @click="cancel" :disabled="loading">Cancel</VBtn>
        <VBtn :color="color" @click="confirm" :loading="loading">{{ confirmText }}</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from "vue";
import { VDialog, VCard, VCardTitle, VCardText, VCardActions, VSpacer, VBtn } from "vuetify/components";

const props = defineProps({
  modelValue: Boolean,
  title: { type: String, default: "Confirm Action" },
  message: { type: String, default: "Are you sure you want to proceed?" },
  confirmText: { type: String, default: "Yes" },
  color: { type: String, default: "primary" },
  onConfirm: { type: Function, required: true },
});

const emits = defineEmits(["update:modelValue"]);

const internalValue = ref(props.modelValue);

// Keep internalValue in sync with prop
watch(() => props.modelValue, (val) => {
  internalValue.value = val;
});

const loading = ref(false);

const updateValue = (val) => {
  internalValue.value = val;
  emits("update:modelValue", val);
};

const confirm = async () => {
  if (!props.onConfirm) return;
  try {
    loading.value = true;
    await props.onConfirm();
    updateValue(false); // close dialog
  } catch (e) {
    console.error("Confirm action failed", e);
  } finally {
    loading.value = false;
  }
};

const cancel = () => {
  updateValue(false);
};
</script>
