<template>
  <div class="">
    <!-- Search and Filters -->
    <!-- <div class="card">
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
    </div> -->

    <!-- Users List -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">
          Orders ()
          <!-- <span v-if="searchQuery" class="search-info"> - Searching for "{{ searchQuery }}" </span> -->
        </h2>
      </div>

      <div class="table-container">
        <table class="table">
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
            <tr v-for="order in orders" :key="order.id">
              <td class="user-name">
                <div class="user-avatar">
                  {{ order.userId }}
                </div>
                <div>
                  <div class="user-fullname">{{ order.medicineId }}</div>
                </div>
              </td>
              <td>
                {{ order.quantity }}
              </td>
              <!-- <td class="table-actions">
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
              </td> -->
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useUserMedicineStore } from 'src/stores/user-medicine';
const store = useUserMedicineStore();
const { loadUsersWithOrders } = store;
const orders = ref();
onMounted(async () => {
  orders.value = await loadUsersWithOrders(false);
  console.log(orders.value);
});
</script>
