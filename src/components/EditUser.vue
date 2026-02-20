<template>
  <div class="modal q-pa-lg">
    <div class="modal-header">
      <h3>Edit User</h3>
      <button @click="closeMedicineModal" class="btn-close">×</button>
    </div>
    <div class="modal-body">
      <form @submit.prevent="submitEditForm">
        <div class="form-group">
          <label class="form-label">Full Name *</label>
          <input v-model="editForm.fullName" type="text" class="form-input" required />
        </div>

        <div class="form-group">
          <label class="form-label">Phone Number *</label>
          <input v-model="editForm.phoneNumber" type="tel" class="form-input" required />
        </div>

        <div class="form-group">
          <label class="form-label">Company</label>
          <input v-model="editForm.company" type="text" class="form-input" />
        </div>

        <div class="form-group">
          <label class="form-label">Address</label>
          <textarea v-model="editForm.address" class="form-input" rows="3"></textarea>
        </div>

        <div class="modal-actions">
          <button type="button" @click="closeMedicineModal" class="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary q-ml-sm" :disabled="store.isLoading">
            {{ store.isLoading ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserMedicineStore } from 'src/stores/user-medicine';
const store = useUserMedicineStore();
const emit = defineEmits(['closeEditMedicine']);
const props = defineProps({
  editUserForm: {
    type: Object,
    required: true,
  },
});
const closeMedicineModal = () => {
  editForm.value = {
    id: 0,
    fullName: '',
    phoneNumber: '',
    company: '',
    address: '',
  };
};
const editForm = ref({
  id: computed(() => props.editUserForm.id).value,
  fullName: computed(() => props.editUserForm.fullName).value,
  phoneNumber: computed(() => props.editUserForm.phoneNumber).value,
  company: computed(() => props.editUserForm.company).value,
  address: computed(() => props.editUserForm.address).value,
});

const submitEditForm = async () => {
  try {
    await store.updateUser(editForm.value.id, {
      fullName: editForm.value.fullName,
      phoneNumber: editForm.value.phoneNumber,
      company: editForm.value.company || undefined,
      address: editForm.value.address || undefined,
    });
    emit('closeEditMedicine');
  } catch (error) {
    console.error('Failed to update user:', error);
  }
};
</script>
