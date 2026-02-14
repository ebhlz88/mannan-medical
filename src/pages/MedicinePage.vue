<!-- src/pages/MedicinesPage.vue -->
<template>
  <div class="medicines-page">
    <div class="page-header text-white">
      <div>
        <h4>Medicines</h4>
        <p class="page-subtitle">View and manage all medicines</p>
      </div>
      <div class="header-stats">
        <div class="stat">
          <span class="stat-label">Total Medicines:</span>
          <span class="stat-value">{{ store.totalMedicines }}</span>
        </div>
      </div>
    </div>

    <!-- Search Section -->
    <div class="card">
      <div class="search-section">
        <div class="search-input-container">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search medicines by name, dosage, or company..."
            class="search-input"
          />
        </div>

        <div class="filter-section">
          <select v-model="selectedUser" class="filter-select">
            <option value="">All Users</option>
            <option v-for="user in store.users" :key="user.id" :value="user.id">
              {{ user.fullName }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Medicines List -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">
          Medicines ({{ filteredMedicines.length }})
          <span v-if="searchQuery || selectedUser" class="filter-info"> - Filtered </span>
        </h2>
      </div>

      <div class="table-container">
        <table class="table" v-if="filteredMedicines.length > 0">
          <thead>
            <tr>
              <th>Create Order</th>
              <th>Medicine Name</th>
              <th>Dosage</th>
              <th>Company</th>
              <th>User</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="medicine in filteredMedicines" :key="medicine.id">
              <td v-if="medicine.id">
                <div @click="activateCreateOrder(medicine.userId, medicine.id)" class="bg-blue">
                  Create
                </div>
              </td>
              <td>
                <div class="medicine-name">
                  <div
                    @click="$router.push({ name: 'CheckOut', params: { id: medicine.id } })"
                    class="medicine-fullname"
                  >
                    {{ medicine.medicineName }}
                  </div>
                </div>
              </td>
              <td>
                <span class="badge badge-primary">
                  {{ medicine.dosage }}
                </span>
              </td>
              <td>{{ medicine.company || 'N/A' }}</td>
              <td>
                <div class="user-cell">
                  <div class="user-name">
                    {{ getUserName(medicine.userId) }}
                  </div>
                  <router-link
                    :to="{ name: 'UserDetailPage', params: { id: medicine.userId } }"
                    class="user-link"
                  >
                    <div class="text-caption">View User</div>
                  </router-link>
                </div>
              </td>
              <td>{{ formatDate(medicine.createdAt) }}</td>
              <td class="table-actions">
                <button @click="editMedicine(medicine)" class="btn btn-primary btn-sm" title="Edit">
                  ✏️
                </button>
                <button
                  @click="deleteMedicine(medicine.id!, medicine.medicineName)"
                  class="btn btn-danger btn-sm"
                  title="Delete"
                >
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="empty-state">
          <div class="empty-state-icon">
            {{ searchQuery ? '🔍' : '💊' }}
          </div>
          <h3>{{ searchQuery ? 'No medicines found' : 'No medicines yet' }}</h3>
          <p v-if="searchQuery">No medicines match your search "{{ searchQuery }}"</p>
          <p v-else>Add medicines to users to get started</p>
        </div>
      </div>
    </div>

    <!-- Edit Medicine Modal -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>Edit Medicine</h3>
          <button @click="closeEditModal" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitEditForm">
            <div class="form-group">
              <label class="form-label">User</label>
              <select v-model="editForm.userId" class="form-input" required>
                <option value="">Select User</option>
                <option v-for="user in store.users" :key="user.id" :value="user.id">
                  {{ user.fullName }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Medicine Name *</label>
              <input v-model="editForm.medicineName" type="text" class="form-input" required />
            </div>

            <div class="form-group">
              <label class="form-label">Dosage *</label>
              <input v-model="editForm.dosage" type="text" class="form-input" required />
            </div>

            <div class="form-group">
              <label class="form-label">Company</label>
              <input v-model="editForm.company" type="text" class="form-input" />
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeEditModal" class="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="store.isLoading">
                {{ store.isLoading ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <q-dialog v-model="showcreateOrder">
      <create-order :activeMed="activeMed" @cancel="cancelCreateOrder" />
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUserMedicineStore } from 'src/stores/user-medicine';
import type { Medicine } from 'src/services/database';
import CreateOrder from 'src/components/CreateOrder.vue';

const store = useUserMedicineStore();

const searchQuery = ref('');
const selectedUser = ref<string | number>('');
const showEditModal = ref(false);
const showcreateOrder = ref(false);

const activeMed = ref({
  userId: 0,
  medicineId: 0,
});
function activateCreateOrder(userId: number, medicineId: number) {
  activeMed.value.userId = userId;
  activeMed.value.medicineId = medicineId;
  showcreateOrder.value = true;
}
function cancelCreateOrder() {
  showcreateOrder.value = false;
}
const editForm = ref({
  id: 0,
  userId: 0,
  medicineName: '',
  dosage: '',
  company: '',
});

const filteredMedicines = computed(() => {
  let medicines = store.medicines;

  // Filter by user
  if (selectedUser.value) {
    medicines = medicines.filter((med) => med.userId === Number(selectedUser.value));
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    medicines = medicines.filter(
      (med) =>
        med.medicineName.toLowerCase().includes(query) ||
        med.dosage.toLowerCase().includes(query) ||
        (med.company && med.company.toLowerCase().includes(query)),
    );
  }

  return medicines;
});

const getUserName = (userId: number) => {
  const user = store.users.find((u) => u.id === userId);
  return user ? user.fullName : 'Unknown User';
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString();
};

const editMedicine = (medicine: Medicine) => {
  editForm.value = {
    id: medicine.id!,
    userId: medicine.userId,
    medicineName: medicine.medicineName,
    dosage: medicine.dosage,
    company: medicine.company || '',
  };
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editForm.value = {
    id: 0,
    userId: 0,
    medicineName: '',
    dosage: '',
    company: '',
  };
};

const submitEditForm = async () => {
  try {
    await store.updateMedicine(editForm.value.id, {
      userId: editForm.value.userId,
      medicineName: editForm.value.medicineName,
      dosage: editForm.value.dosage,
      company: editForm.value.company || undefined,
    });
    closeEditModal();
  } catch (error) {
    console.error('Failed to update medicine:', error);
  }
};

const deleteMedicine = async (medicineId: number, medicineName: string) => {
  if (confirm(`Are you sure you want to delete medicine "${medicineName}"?`)) {
    try {
      await store.deleteMedicine(medicineId);
    } catch (error) {
      console.error('Failed to delete medicine:', error);
    }
  }
};

onMounted(async () => {
  if (store.users.length === 0) {
    await store.initialize();
  }
});
</script>

<style scoped>
.medicines-page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.header-stats {
  display: flex;
  gap: 2rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 0.875rem;
  color: #ffffff;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ffffff;
}

.search-section {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-input-container {
  flex: 1;
  position: relative;
}
.search-input {
  width: 220px;
  padding: 0.75rem 1rem 0.75rem 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  transition: border-color 0.3s ease;
}

.filter-section {
  min-width: 100px;
}

.filter-select {
  width: 100px;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 10px;
  background: white;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #4f46e5;
}

.filter-info {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: normal;
}

.medicine-name {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.medicine-icon {
  font-size: 1.25rem;
}

.medicine-fullname {
  font-weight: 500;
  color: #1979ff;
  text-decoration: underline;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(140deg, #0c0211 0%, #ff00f5 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.user-name {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.user-link {
  font-size: 0.75rem;
  color: #4f46e5;
  text-decoration: none;
}

.user-link:hover {
  text-decoration: underline;
}
</style>
