<template>
  <div class="create-order">
    <form @submit.prevent="submitForm" class="user-form">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Quantity*</label>
          <input
            v-model="orderForm.quantity"
            type="number"
            class="form-input"
            required
            placeholder="Enter Quantity"
          />
        </div>
        <div class="form-actions">
          <button @click="$emit('cancel')" class="btn btn-secondary">Cancel</button>
          <button type="submit" class="q-ml-sm btn btn-primary" :disabled="store.isLoading">
            {{ store.isLoading ? 'Creating...' : 'Create Order' }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>
<script setup lang="ts">
import { useUserMedicineStore } from 'src/stores/user-medicine';

const props = defineProps({
  activeMed: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(['cancel']);
const store = useUserMedicineStore();
import { ref } from 'vue';
const orderForm = ref({
  quantity: 0,
});
const submitForm = async () => {
  try {
    await store.createOrder(
      props.activeMed.userId,
      props.activeMed.medicineId,
      orderForm.value.quantity,
    );
    emit('cancel');
  } catch (error) {
    console.error('Failed to create user:', error);
  }
};
</script>
<style scoped>
.create-order {
  background-color: white;
  padding: 40px;
  border-radius: 10px;
}
</style>
