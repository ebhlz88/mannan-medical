<!-- src/pages/UsersPage.vue -->
<template>
  <div class="users-page">
    <div class="page-header text-white">
      <div>
        <div class="header-actions">
          <router-link :to="{ name: 'AddUserPage' }" class="back-link"> Add User </router-link>
        </div>
        <h6>Users</h6>
        <p class="page-subtitle">Manage your users and their medicines</p>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="card">
      <div class="search-section">
        <div class="search-input-container">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search users by name, phone, company, or address..."
            class="search-input"
            @input="handleSearch"
          />
          <span class="search-icon">🔍</span>
        </div>
        <div class="search-actions">
          <button @click="clearSearch" class="btn btn-secondary" :disabled="!searchQuery">
            Clear
          </button>
        </div>
      </div>
    </div>

    <!-- Users List -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">
          Users ({{ displayedUsers.length }})
          <span v-if="searchQuery" class="search-info"> - Searching for "{{ searchQuery }}" </span>
        </h2>
      </div>

      <div class="table-container">
        <table class="table" v-if="displayedUsers.length > 0">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Company</th>
              <th>Address</th>
              <th>Medicines</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in displayedUsers" :key="user.id">
              <td class="user-name">
                <div class="user-avatar">
                  {{ getInitials(user.fullName) }}
                </div>
                <div>
                  <div class="user-fullname">{{ user.fullName }}</div>
                </div>
              </td>
              <td>
                <a :href="`tel:${user.phoneNumber}`" class="phone-link">
                  {{ user.phoneNumber }}
                </a>
              </td>
              <td>{{ user.company || 'N/A' }}</td>
              <td>
                <div class="truncate-text" :title="user.address || 'N/A'">
                  {{ truncateText(user.address || 'N/A', 30) }}
                </div>
              </td>
              <td>
                <span class="badge badge-primary">
                  {{ store.getMedicinesByUserId(user.id!).length }} meds
                </span>
              </td>
              <td>
                {{ formatDate(user.createdAt) }}
              </td>
              <td class="table-actions">
                <router-link
                  :to="{ name: 'UserDetailPage', params: { id: user.id } }"
                  class="btn btn-primary btn-sm"
                  title="View Details"
                >
                  👁️
                </router-link>
                <button @click="editUser(user.id!)" class="btn btn-secondary btn-sm" title="Edit">
                  ✏️
                </button>
                <button
                  @click="confirmDeleteUser(user.id!, user.fullName)"
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
            {{ searchQuery ? '🔍' : '👤' }}
          </div>
          <h3>{{ searchQuery ? 'No users found' : 'No users yet' }}</h3>
          <p v-if="searchQuery">No users match your search "{{ searchQuery }}"</p>
          <p v-else>Add your first user to get started</p>
          <router-link v-if="!searchQuery" :to="{ name: 'AddUserPage' }" class="btn btn-primary">
            Add User
          </router-link>
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>Edit User</h3>
          <button @click="closeEditModal" class="btn-close">×</button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUserMedicineStore } from 'src/stores/user-medicine';
// import { useRouter } from 'vue-router';

const store = useUserMedicineStore();
// const router = useRouter();

const searchQuery = ref('');
const showEditModal = ref(false);
const editForm = ref({
  id: 0,
  fullName: '',
  phoneNumber: '',
  company: '',
  address: '',
});

const displayedUsers = computed(() => {
  if (searchQuery.value.trim() === '') {
    return store.users;
  }
  return store.users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.phoneNumber.includes(searchQuery.value) ||
      (user.company && user.company.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
      (user.address && user.address.toLowerCase().includes(searchQuery.value.toLowerCase())),
  );
});

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString();
};

const handleSearch = () => {
  // Debounce could be added here for performance
};

const clearSearch = () => {
  searchQuery.value = '';
};

const editUser = (id: number) => {
  const user = store.users.find((u) => u.id === id);
  if (user) {
    editForm.value = {
      id: user.id!,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      company: user.company || '',
      address: user.address || '',
    };
    showEditModal.value = true;
  }
};

const closeEditModal = () => {
  showEditModal.value = false;
  editForm.value = {
    id: 0,
    fullName: '',
    phoneNumber: '',
    company: '',
    address: '',
  };
};

const submitEditForm = async () => {
  try {
    await store.updateUser(editForm.value.id, {
      fullName: editForm.value.fullName,
      phoneNumber: editForm.value.phoneNumber,
      company: editForm.value.company || undefined,
      address: editForm.value.address || undefined,
    });
    closeEditModal();
  } catch (error) {
    console.error('Failed to update user:', error);
  }
};

const confirmDeleteUser = async (id: number, name: string) => {
  if (
    confirm(
      `Are you sure you want to delete user "${name}"? This will also delete all their medicines.`,
    )
  ) {
    try {
      await store.deleteUser(id);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  }
};

onMounted(async () => {
  if (store.users.length === 0) {
    await store.loadUsers();
  }
});
</script>

<style scoped>
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
.users-page {
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.page-header h1 {
  font-size: 2rem;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: #ffffff;
}

.header-actions {
  display: flex;
  gap: 1rem;
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
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #4f46e5;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-info {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: normal;
}

.user-name {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(140deg, #0c0211 0%, #ff00f5 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.875rem;
}

.user-fullname {
  font-weight: 500;
  color: #1f2937;
}

.phone-link {
  color: #4f46e5;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.phone-link:hover {
  text-decoration: underline;
}

.truncate-text {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 1rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  color: #1f2937;
}

.modal-body {
  padding: 1.5rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}
</style>
