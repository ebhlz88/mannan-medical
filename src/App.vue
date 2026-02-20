<!-- src/App.vue -->
<template>
  <div id="app">
    <nav class="navbar">
      <div style="width: 100%">
        <q-scroll-area :visible="false" style="height: 50px; max-width: 100%">
          <div class="row no-wrap text-caption">
            <router-link to="/" class="navbar-item" active-class="active"> Dashboard </router-link>
            <router-link :to="{ name: 'UserPage' }" class="navbar-item" active-class="active">
              Users ({{ store.totalUsers }})
            </router-link>
            <router-link :to="{ name: 'AddUserPage' }" class="navbar-item" active-class="active">
              Add User
            </router-link>
            <router-link :to="{ name: 'MedicinePage' }" class="navbar-item" active-class="active">
              Medicines ({{ store.totalMedicines }})
            </router-link>
            <router-link :to="{ name: 'CheckOut' }" class="navbar-item" active-class="active">
              Orders
            </router-link>
          </div>
        </q-scroll-area>
      </div>
      <!-- <div class="navbar-actions">
        <button @click="store.initialize()" class="btn btn-refresh" :disabled="store.isLoading">
          🔄 Refresh
        </button>
      </div> -->
    </nav>

    <div class="app-container">
      <div class="app-content">
        <router-view />
      </div>
    </div>

    <div v-if="store.error" class="error-toast">
      <div class="error-content">
        <span>❌ {{ store.error }}</span>
        <button @click="store.clearError()" class="btn-close">×</button>
      </div>
    </div>

    <div v-if="store.isLoading" class="loading-overlay">
      <div class="spinner"></div>
      <div>Loading...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUserMedicineStore } from 'src/stores/user-medicine';

const store = useUserMedicineStore();
const { deleteOrdersOlderThan } = store;
onMounted(async () => {
  await store.initialize();
  await deleteOrdersOlderThan(30);
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background: linear-gradient(140deg, #0c0211 0%, #ff00f5 100%);
  min-height: 100vh;
}

#app {
  min-height: 100vh;
}

/* Navbar Styles */
.navbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  padding-top: 60px !important;
  top: 0;
  z-index: 1000;
  margin-top: 11px;
}

.navbar-brand {
  font-size: 10px;
  font-weight: bold;
  color: #4f46e5;
}

.navbar-logo {
  text-decoration: none;
  color: inherit;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.navbar-menu {
  display: flex;
  gap: 2rem;
  flex-grow: 1;
  margin-left: 3rem;
}

.navbar-item {
  text-decoration: none;
  color: #6b7280;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.navbar-item:hover {
  color: #4f46e5;
  background: rgba(79, 70, 229, 0.1);
}

.navbar-item.active {
  color: #4f46e5;
  background: rgba(79, 70, 229, 0.1);
}

.navbar-actions {
  display: flex;
  gap: 1rem;
}

/* App Container */
.app-container {
  padding: 2rem;
  min-height: calc(100vh - 80px);
}

.app-content {
  max-width: 1200px;
  margin: 0 auto;
}

/* Button Styles */
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
}

.btn-primary {
  background: #4f46e5;
  color: white;
}

.btn-primary:hover {
  background: #4338ca;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-refresh {
  background: transparent;
  border: 2px solid #4f46e5;
  color: #4f46e5;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0 0.5rem;
}

/* Form Styles */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #4f46e5;
}

.form-input.error {
  border-color: #ef4444;
}

.form-error {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* Error Toast */
.error-toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #fef2f2;
  border: 2px solid #fecaca;
  border-radius: 0.5rem;
  padding: 1rem;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease;
}

.error-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e5e7eb;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Card Styles */
.card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f3f4f6;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Table Styles */
.table-container {
  overflow-x: auto;
  border-radius: 0.75rem;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  background: #f9fafb;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #6b7280;
  border-bottom: 2px solid #e5e7eb;
}

.table td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.table tr:hover {
  background: #f9fafb;
}

.table-actions {
  display: flex;
  gap: 0.5rem;
}

/* Badge Styles */
.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-primary {
  background: #e0e7ff;
  color: #4f46e5;
}

.badge-success {
  background: #d1fae5;
  color: #059669;
}

.badge-warning {
  background: #fef3c7;
  color: #d97706;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.empty-state-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Responsive */
@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .navbar-menu {
    margin-left: 0;
    justify-content: center;
  }

  .app-container {
    padding: 0.5rem 1rem;
    padding-top: 0 !important;
  }

  .card {
    padding: 1rem;
  }

  .table th,
  .table td {
    padding: 0.75rem 0.5rem;
  }
}
</style>
