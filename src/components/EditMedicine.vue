<template>
  <div class="bg-white text-black rounded-lg q-pa-lg">
    <div class="modal-header flex justify-between items-center">
      <h6>Add Medicine</h6>
      <button @click="closeMedicineModal" class="btn-close text-red bg-white rounded-full">
        ×
      </button>
    </div>
    <div class="modal-body">
      <form @submit.prevent="submitMedicineForm">
        <div class="form-group">
          <label class="form-label">Medicine Name *</label>
          <input
            v-model="medicineForm.medicineName"
            type="text"
            class="form-input"
            required
            placeholder="e.g., Paracetamol"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Dosage *</label>
          <input
            v-model="medicineForm.dosage"
            type="text"
            class="form-input"
            required
            placeholder="e.g., 500mg"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Company</label>
          <input
            v-model="medicineForm.company"
            type="text"
            class="form-input"
            placeholder="e.g., Pharma Co."
          />
        </div>

        <div class="modal-actions">
          <button type="button" @click="closeMedicineModal" class="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary q-ml-sm" :disabled="store.isLoading">
            {{ store.isLoading ? 'Saving...' : 'Save Medicine' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserMedicineStore } from 'src/stores/user-medicine';
import { ref } from 'vue';
const emit = defineEmits(['closeEditMedicine']);
const store = useUserMedicineStore();

const medicineForm = ref({
  medicineName: '',
  dosage: '',
  company: '',
});

const closeMedicineModal = () => {
  medicineForm.value = {
    medicineName: '',
    dosage: '',
    company: '',
  };
  emit('closeEditMedicine');
};

const submitMedicineForm = async () => {
  if (!store.currentUser?.id) return;

  try {
    await store.createMedicine(
      store.currentUser.id,
      medicineForm.value.medicineName,
      medicineForm.value.dosage,
      medicineForm.value.company,
    );
    closeMedicineModal();
  } catch (err) {
    console.error('Failed to save medicine:', err);
  }
};
</script>
