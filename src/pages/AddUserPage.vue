<!-- src/pages/AddUserPage.vue -->
<template>
  <div class="add-user-page">
    <div class="page-header">
      <div class="text-white">
        <router-link :to="{ name: 'UserPage' }" class="back-link">Back to Users </router-link>
        <h6>Add New User</h6>
        <p class="page-subtitle">Create a new user profile</p>
      </div>
    </div>

    <div class="add-user-container">
      <!-- User Form -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">User Information</h2>
        </div>

        <form @submit.prevent="submitForm" class="user-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Full Name *</label>
              <input
                v-model="userForm.fullName"
                type="text"
                class="form-input"
                required
                placeholder="Enter full name"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Phone Number *</label>
              <input
                v-model="userForm.phoneNumber"
                type="tel"
                class="form-input"
                required
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Company</label>
              <input
                v-model="userForm.company"
                type="text"
                class="form-input"
                placeholder="Enter company name"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Address</label>
              <textarea
                v-model="userForm.address"
                class="form-input"
                rows="3"
                placeholder="Enter address"
              ></textarea>
            </div>
          </div>

          <!-- Medicines Section -->
          <div class="medicines-section">
            <div class="section-header">
              <h6 class="section-title">Medicines</h6>
              <button type="button" @click="addMedicine" class="btn btn-primary btn-sm">
                + Add Medicine
              </button>
            </div>

            <p class="section-description">
              You can add medicines now or add them later from the user's detail page.
            </p>

            <div v-for="(medicine, index) in medicines" :key="index" class="medicine-form">
              <div class="medicine-header">
                <h4>Medicine #{{ index + 1 }}</h4>
                <button
                  type="button"
                  @click="removeMedicine(index)"
                  class="btn btn-danger btn-sm"
                  :disabled="medicines.length === 1"
                >
                  🗑️ Remove
                </button>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Medicine Name *</label>
                  <input
                    v-model="medicine.medicineName"
                    type="text"
                    class="form-input"
                    :required="medicines.length > 0"
                    placeholder="e.g., Paracetamol"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Dosage *</label>
                  <input
                    v-model="medicine.dosage"
                    type="text"
                    class="form-input"
                    :required="medicines.length > 0"
                    placeholder="e.g., 500mg"
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Company</label>
                <input
                  v-model="medicine.company"
                  type="text"
                  class="form-input"
                  placeholder="e.g., Pharma Co."
                />
              </div>
            </div>
          </div>

          <div class="form-actions">
            <router-link :to="{ name: 'UserPage' }" class="btn btn-secondary"> Cancel </router-link>
            <button type="submit" class="btn btn-primary" :disabled="store.isLoading">
              {{ store.isLoading ? 'Creating...' : 'Create User' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Preview Card -->
      <div v-if="userForm.fullName && userForm.phoneNumber" class="card preview-card">
        <div class="card-header">
          <h2 class="card-title">Preview</h2>
        </div>

        <div class="preview-content">
          <div class="preview-user">
            <h3>User Information</h3>
            <div class="preview-details">
              <div class="preview-row">
                <span class="preview-label">Name:</span>
                <span class="preview-value">{{ userForm.fullName || 'Not provided' }}</span>
              </div>
              <div class="preview-row">
                <span class="preview-label">Phone:</span>
                <span class="preview-value">{{ userForm.phoneNumber || 'Not provided' }}</span>
              </div>
              <div class="preview-row">
                <span class="preview-label">Company:</span>
                <span class="preview-value">{{ userForm.company || 'Not provided' }}</span>
              </div>
              <div class="preview-row">
                <span class="preview-label">Address:</span>
                <span class="preview-value">{{ userForm.address || 'Not provided' }}</span>
              </div>
            </div>
          </div>

          <div v-if="medicines.length > 0" class="preview-medicines">
            <h3>Medicines ({{ medicines.length }})</h3>
            <div class="preview-medicine-list">
              <div v-for="(medicine, index) in medicines" :key="index" class="preview-medicine">
                <strong>{{ medicine.medicineName || 'Unnamed Medicine' }}</strong>
                <div>{{ medicine.dosage || 'No dosage' }}</div>
                <div v-if="medicine.company" class="medicine-company">
                  {{ medicine.company }}
                </div>
              </div>
            </div>
          </div>

          <div v-else class="preview-no-medicines">
            <p>No medicines added</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserMedicineStore } from 'src/stores/user-medicine';

const store = useUserMedicineStore();
const router = useRouter();

const userForm = ref({
  fullName: '',
  phoneNumber: '',
  company: '',
  address: '',
});

const medicines = ref([
  {
    medicineName: '',
    dosage: '',
    company: '',
  },
]);

const addMedicine = () => {
  medicines.value.push({
    medicineName: '',
    dosage: '',
    company: '',
  });
};

const removeMedicine = (index: number) => {
  if (medicines.value.length > 1) {
    medicines.value.splice(index, 1);
  }
};

const submitForm = async () => {
  try {
    const medicinesToAdd = medicines.value.filter(
      (med) => med.medicineName.trim() && med.dosage.trim(),
    );

    if (medicinesToAdd.length > 0) {
      await store.createUserWithMedicines(userForm.value, medicinesToAdd);
    } else {
      await store.createUser(
        userForm.value.fullName,
        userForm.value.phoneNumber,
        userForm.value.company,
        userForm.value.address,
      );
    }

    await router.push({ name: 'UserPage' });
  } catch (error) {
    console.error('Failed to create user:', error);
  }
};
</script>

<style scoped>
.add-user-page {
  display: flex;
  flex-direction: column;
}

.back-link {
  display: inline-block;
  margin-bottom: 1rem;
  color: #000000;
  text-decoration: none;
  font-weight: 500;
  padding: 10px;
  border-radius: 10px;
  background-color: #ffffff;
}

.back-link:hover {
  text-decoration: underline;
}

.add-user-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (max-width: 1024px) {
  .add-user-container {
    grid-template-columns: 1fr;
  }
}

.user-form {
  display: flex;
  flex-direction: column;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.medicines-section {
  border-top: 2px solid #f3f4f6;
  padding-top: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-title {
  margin: 0;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-description {
  color: #6b7280;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

.medicine-form {
  background: #f9fafb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #e5e7eb;
}

.medicine-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.medicine-header h4 {
  margin: 0;
  color: #1f2937;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 2rem;
  border-top: 2px solid #f3f4f6;
}

.preview-card {
  position: sticky;
  top: 2rem;
  height: fit-content;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.preview-user h3,
.preview-medicines h3 {
  margin-bottom: 1rem;
  color: #1f2937;
}

.preview-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.preview-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.preview-label {
  font-weight: 500;
  color: #6b7280;
  min-width: 80px;
  flex-shrink: 0;
}

.preview-value {
  color: #1f2937;
  text-align: right;
  flex: 1;
}

.preview-medicine-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.preview-medicine {
  background: #f3f4f6;
  border-radius: 0.5rem;
  padding: 1rem;
  border-left: 4px solid #4f46e5;
}

.medicine-company {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.preview-no-medicines {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  background: #f9fafb;
  border-radius: 0.5rem;
  border: 2px dashed #e5e7eb;
}
</style>
