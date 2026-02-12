<!-- src/pages/DashboardPage.vue -->
<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h4>Dashboard</h4>
      <p class="dashboard-subtitle">Overview of your user and medicine data</p>
    </div>

    <!-- Statistics Grid -->
    <div class="statistics-grid">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <h3>Total Users</h3>
          <div class="stat-number">{{ store.totalUsers }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">💊</div>
        <div class="stat-content">
          <h3>Total Medicines</h3>
          <div class="stat-number">{{ store.totalMedicines }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <h3>Users with Medicines</h3>
          <div class="stat-number">{{ store.usersWithMedicines }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-content">
          <h3>Avg Medicines/User</h3>
          <div class="stat-number">{{ store.averageMedicinesPerUser.toFixed(1) }}</div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">⚡ Quick Actions</h2>
      </div>
      <div class="quick-actions-grid">
        <router-link :to="{ name: 'AddUserPage' }" class="quick-action">
          <div class="quick-action-icon">➕</div>
          <h6>Add New User</h6>
          <p>Create a new user profile</p>
        </router-link>

        <button @click="exportData" class="quick-action" :disabled="store.isLoading">
          <div class="quick-action-icon">💾</div>
          <h6>Export Data</h6>
          <p>Backup all your data</p>
        </button>

        <button @click="store.clearUsers" class="quick-action" :disabled="store.isLoading">
          <div class="quick-action-icon">🗑️</div>
          <h6>Clear All Data</h6>
          <p>Reset the database</p>
        </button>
      </div>
    </div>

    <!-- Recent Users -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">👥 Recent Users</h2>
        <router-link :to="{ name: 'UserPage' }" class="btn btn-secondary"> View All </router-link>
      </div>
      <div class="table-container">
        <table class="table" v-if="recentUsers.length > 0">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Company</th>
              <th>Medicines</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in recentUsers" :key="user.id">
              <td>{{ user.fullName }}</td>
              <td>{{ user.phoneNumber }}</td>
              <td>{{ user.company || 'N/A' }}</td>
              <td>
                <span class="badge badge-primary">
                  {{ store.getMedicinesByUserId(user.id!).length }} meds
                </span>
              </td>
              <td class="table-actions">
                <router-link
                  :to="{ name: 'UserDetailPage', params: { id: user.id } }"
                  class="btn btn-primary btn-sm"
                >
                  View
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state">
          <div class="empty-state-icon">👤</div>
          <h6>No users yet</h6>
          <p class="q-mt-sm">Add your first user to get started</p>
          <router-link :to="{ name: 'AddUserPage' }" class="btn btn-primary">
            Add User
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useUserMedicineStore } from 'src/stores/user-medicine';

const store = useUserMedicineStore();

const recentUsers = computed(() => {
  return store.users.slice(0, 5);
});

const exportData = async () => {
  const data = await store.exportData();
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `user-medicine-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

onMounted(async () => {
  if (store.users.length === 0) {
    await store.initialize();
  }
});
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.dashboard-header {
  margin-bottom: 1rem;
}

.dashboard-header h1 {
  font-size: 8px;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.dashboard-subtitle {
  color: #ffffff;
  font-size: 1rem;
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  font-size: 2.5rem;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 1rem;
  color: white;
}

.stat-content h3 {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.quick-action {
  background: #f9fafb;
  border: 2px dashed #e5e7eb;
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.quick-action:hover {
  background: white;
  border-color: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(79, 70, 229, 0.1);
}

.quick-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.quick-action-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.quick-action h3 {
  color: #1f2937;
  margin: 0;
}

.quick-action p {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
}
</style>
