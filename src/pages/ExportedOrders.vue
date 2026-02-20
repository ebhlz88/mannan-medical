<template>
  <div>
    <!-- <div class="flex justify-end">
      <button @click="sharePDF" class="btn btn-primary">Download PDF</button>
    </div> -->
    <div
      v-for="user in orders"
      :key="user.id"
      class="text-black q-pa-lg q-my-sm bg-white rounded-pdf"
    >
      <!-- Title -->
      <div>
        <div class="flex justify-between items-center">
          <div class="text-h6">Shared Orders for last 30 Days</div>
        </div>
        <q-separator class="q-my-sm" />
        <div class="q-mb-md">
          <div class="text-caption text-bold">User Info</div>

          <div class="flex justify-between q-px-sm q-pr-xl q-mt-sm">
            <div class="text-caption">Full Name:</div>
            <div class="text-caption text-bold">
              {{ user.fullName }}
            </div>
          </div>
          <div class="flex justify-between q-px-sm q-pr-xl q-mt-sm">
            <div class="text-caption">Phone Number:</div>
            <div class="text-caption text-bold">
              {{ user.phoneNumber }}
            </div>
          </div>
          <div class="flex justify-between q-px-sm q-pr-xl q-mt-sm">
            <div class="text-caption">Company:</div>
            <div class="text-caption text-bold">
              {{ user.company }}
            </div>
          </div>
          <div class="flex justify-between q-px-sm q-pr-xl q-mt-sm">
            <div class="text-caption">Address:</div>
            <div class="text-caption text-bold">
              {{ user.address }}
            </div>
          </div>
        </div>
        <q-separator class="q-my-md" />
        <div id="String(`order-${user.id}`)">
          <div class="text-body2 text-bold q-mb-lg">Medicine Info</div>

          <div v-for="(items, i) in user.orders" :key="items.id" class="q-mb-md">
            <div class="flex justify-between">
              <div class="text-caption text-bold">
                ({{ Number(i) + 1 }}) {{ items.medicine.medicineName }}
              </div>
            </div>

            <div class="flex justify-between q-px-sm q-pr-xl q-mt-sm">
              <div class="text-caption">Dosage:</div>
              <div class="text-caption text-bold">
                {{ items.medicine.dosage }}
              </div>
            </div>
            <div class="flex justify-between q-px-sm q-pr-xl q-mt-sm">
              <div class="text-caption">Quantity:</div>
              <div class="text-caption text-bold">
                {{ items.quantity }}
              </div>
            </div>
            <q-separator class="q-my-md" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useUserMedicineStore } from 'src/stores/user-medicine';
import type { UserWithOrders } from 'src/services/database';
const store = useUserMedicineStore();
const { loadUsersWithOrders } = store;
const orders = ref<UserWithOrders[]>([]);
onMounted(async () => {
  await loadOrders();
});

async function loadOrders() {
  const data = await loadUsersWithOrders(true);

  // Add selection state per medicine item
  orders.value = data;
}
</script>

<style>
.rounded-pdf {
  border-radius: 5px;
}
</style>
