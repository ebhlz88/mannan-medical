<!-- src/pages/UserDetailPage.vue -->
<template>
  <div class="user-detail-page">
    <!-- Back Button -->
    <div class="back-button">
      <router-link :to="{ name: 'UserPage' }" class="btn btn-primary"> Back to Users </router-link>
    </div>

    <!-- Loading State -->
    <div v-if="store.isLoading && !store.currentUser" class="loading-state">
      <div class="spinner"></div>
      <p>Loading user details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">❌</div>
      <h3>Error Loading User</h3>
      <p>{{ error }}</p>
      <router-link :to="{ name: 'UserPage' }" class="btn btn-primary"> Back to Users </router-link>
    </div>

    <!-- User Details -->
    <div v-else-if="store.currentUser" class="user-details">
      <!-- User Header -->
      <div class="user-header">
        <div class="user-avatar-large">
          {{ getInitials(store.currentUser.fullName) }}
        </div>
        <div class="user-info">
          <h1>{{ store.currentUser.fullName }}</h1>
          <div class="user-meta">
            <div class="meta-item">
              <span class="meta-icon"></span>
              <a :href="`tel:${store.currentUser.phoneNumber}`">
                {{ store.currentUser.phoneNumber }}
              </a>
            </div>
            <div v-if="store.currentUser.company" class="meta-item">
              <span class="meta-icon">🏢</span>
              {{ store.currentUser.company }}
            </div>
            <div class="meta-item">
              <span class="meta-icon">📅</span>
              Joined {{ formatDate(store.currentUser.createdAt) }}
            </div>
          </div>
        </div>
        <div class="user-actions">
          <button @click="editUser" class="btn btn-primary" style="width: 113px">
            ✏️ Edit User
          </button>
          <button @click="deleteUser" class="btn btn-danger" style="width: 113px">🗑️ Delete</button>
        </div>
      </div>

      <!-- User Details Grid -->
      <div class="details-grid">
        <div class="detail-card">
          <h3 class="detail-title">
            <span class="detail-icon">📋</span>
            Personal Information
          </h3>
          <div class="detail-content">
            <div class="detail-row">
              <span class="detail-label">Full Name:</span>
              <span class="detail-value">{{ store.currentUser.fullName }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Phone Number:</span>
              <span class="detail-value">
                <a :href="`tel:${store.currentUser.phoneNumber}`">
                  {{ store.currentUser.phoneNumber }}
                </a>
              </span>
            </div>
            <div v-if="store.currentUser.company" class="detail-row">
              <span class="detail-label">Company:</span>
              <span class="detail-value">{{ store.currentUser.company }}</span>
            </div>
            <div v-if="store.currentUser.address" class="detail-row">
              <span class="detail-label">Address:</span>
              <span class="detail-value">{{ truncateString(store.currentUser.address, 5) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Created:</span>
              <span class="detail-value">{{ formatFullDate(store.currentUser.createdAt) }}</span>
            </div>
          </div>
        </div>
        <!-- Add/Edit Medicine Modal -->
        <div v-if="showAddMedicine" class="modal-overlay">
          <AddMedicine @closeAddMedicine="closeAddMedicine" />
        </div>
        <!-- Medicines Section -->
        <div class="detail-card">
          <div class="detail-card-header">
            <h3 class="detail-title">
              <span class="detail-icon">💊</span>
              Medicines
              <span class="badge badge-primary">
                {{ userMedicines.length }}
              </span>
            </h3>
            <button @click="showAddMedicine = true" class="btn btn-primary btn-sm">
              Add Medicine
            </button>
          </div>

          <div class="medicines-list">
            <div v-if="userMedicines.length === 0" class="empty-medicines">
              <div class="empty-icon">💊</div>
              <p>No medicines added yet</p>
              <button @click="showAddMedicine = true" class="btn btn-primary">
                Add First Medicine
              </button>
            </div>

            <div v-else class="medicine-grid">
              <div v-for="medicine in userMedicines" :key="medicine.id" class="medicine-card">
                <div class="medicine-header">
                  <h4 @click="$router.push({ name: 'CheckOut', params: { id: medicine.id } })">
                    {{ medicine.medicineName }}
                  </h4>
                  <div class="medicine-actions">
                    <button @click="editMedicine(medicine)" class="btn-icon" title="Edit">
                      ✏️
                    </button>
                    <button
                      @click="deleteMedicine(medicine.id!, medicine.medicineName)"
                      class="btn-icon btn-danger"
                      title="Delete"
                    >
                      🗑️
                    </button>
                    <button
                      class="btn rounded-full bg-blue text-white font-lg"
                      v-if="store.currentUser.id && medicine.id"
                      @click="activateCreateOrder(store.currentUser.id, medicine.id)"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div class="medicine-details">
                  <div class="medicine-detail">
                    <span class="detail-label">Dosage:</span>
                    <span class="detail-value">{{ medicine.dosage }}</span>
                  </div>
                  <div v-if="medicine.company" class="medicine-detail">
                    <span class="detail-label">Company:</span>
                    <span class="detail-value">{{ medicine.company }}</span>
                  </div>
                  <div class="medicine-detail">
                    <span class="detail-label">Added:</span>
                    <span class="detail-value">{{ formatDate(medicine.createdAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal">
        <!-- ... Same edit modal as UsersPage.vue ... -->
      </div>
    </div>

    <q-dialog v-model="showcreateOrder">
      <create-order :activeMed="activeMed" @cancel="cancelCreateOrder" />
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserMedicineStore } from 'src/stores/user-medicine';
import CreateOrder from 'src/components/CreateOrder.vue';
import type { Medicine } from 'src/services/database';
import { truncateString, formatDate, formatFullDate } from 'src/utils/utils';
import AddMedicine from 'src/components/AddMedicine.vue';

const route = useRoute();
const router = useRouter();
const store = useUserMedicineStore();

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

const error = ref<string | null>(null);
const showEditModal = ref(false);
const showAddMedicine = ref(false);
const showEditMedicine = ref(false);
const editingMedicine = ref<Medicine | null>(null);

const userId = computed(() => parseInt(route.params.id as string));
const userMedicines = computed(() => {
  return store.getMedicinesByUserId(userId.value);
});

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const loadUserData = async () => {
  try {
    error.value = null;
    await store.loadUserWithMedicines(userId.value);
    if (!store.currentUser) {
      error.value = 'User not found';
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load user';
  }
};

const closeAddMedicine = () => {
  showAddMedicine.value = false;
};

const editUser = () => {
  showEditModal.value = true;
};

const deleteUser = async () => {
  if (!store.currentUser) return;

  if (
    confirm(
      `Are you sure you want to delete user "${store.currentUser.fullName}"? This will also delete all their medicines.`,
    )
  ) {
    try {
      await store.deleteUser(userId.value);
      await router.push({ name: 'UserPage' });
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  }
};

const editMedicine = (medicine: Medicine) => {
  editingMedicine.value = medicine;

  showEditMedicine.value = true;
};

const deleteMedicine = async (medicineId: number, medicineName: string) => {
  if (confirm(`Are you sure you want to delete medicine "${medicineName}"?`)) {
    try {
      await store.deleteMedicine(medicineId);
    } catch (err) {
      console.error('Failed to delete medicine:', err);
    }
  }
};

onMounted(async () => {
  await loadUserData();
});

watch(
  () => route.params.id,
  async () => {
    await loadUserData();
  },
);
</script>

<style scoped>
.user-detail-page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.back-button {
  margin-bottom: 1rem;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-state h3 {
  color: #dc2626;
  margin-bottom: 0.5rem;
}

.error-state p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.user-header {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
}

.user-avatar-large {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(140deg, #0c0211 0%, #ff00f5 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.5rem;
  font-weight: bold;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
}

.user-info h1 {
  font-size: 2rem;
  color: #1f2937;
  margin-bottom: 1rem;
}

.user-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
}

.meta-icon {
  opacity: 0.7;
}

.user-actions {
  display: flex;
  gap: 1rem;
  flex-shrink: 0;
  flex-direction: column;
  align-items: end;
  margin-top: auto;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.detail-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.detail-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.detail-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #1f2937;
  margin: 0;
  font-size: 1.25rem;
}

.detail-icon {
  font-size: 1.25rem;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.detail-label {
  font-weight: 500;
  color: #6b7280;
  min-width: 120px;
  flex-shrink: 0;
}

.detail-value {
  color: #1f2937;
  flex: 1;
}

.medicines-list {
  margin-top: 1rem;
}

.empty-medicines {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.medicine-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.medicine-card {
  background: #f9fafb;
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.medicine-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #4f46e5;
}

.medicine-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.medicine-header h4 {
  margin: 0;
  color: #1979ff !important;
  text-decoration: underline;
  font-size: 1.125rem;
}

.medicine-actions {
  display: flex;
  gap: 0.25rem;
}

.btn-icon {
  background: transparent;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: rgba(0, 0, 0, 0.1);
}

.btn-icon.btn-danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.medicine-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.medicine-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.medicine-detail .detail-label {
  min-width: auto;
  font-size: 0.875rem;
}

.medicine-detail .detail-value {
  font-size: 0.875rem;
  text-align: right;
}
</style>
