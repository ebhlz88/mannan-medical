<template>
  <div>
    <div class="flex justify-end">
      <div class="flex items-center">
        <div class="text-white text-body1">Select All</div>
        <q-checkbox v-model="selectAll"></q-checkbox>
      </div>
    </div>
    <div
      v-for="user in orders"
      :key="user.id"
      :id="String(user.id)"
      class="text-black q-pa-lg q-my-sm bg-white rounded-pdf"
    >
      <!-- Title -->
      <div>
        <div class="text-h6">Medicine Order</div>
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
        <div class="text-body2 text-bold q-mb-lg">Medicine Info</div>

        <div v-for="(items, i) in user.orders" :key="items.id" class="q-mb-md">
          <div class="flex justify-between">
            <div class="text-caption text-bold">
              ({{ Number(i) + 1 }}) {{ items.medicine.medicineName }}
            </div>
            <q-checkbox class="q-pr-xl" v-model="items.selected" size="sm"></q-checkbox>
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
          <div class="flex justify-between q-px-sm q-pr-xl q-mt-sm">
            <div class="text-caption">Actions:</div>
            <div v-if="!showEditOrder" class="flex">
              <button @click="editOrder(items.id)" class="btn btn-primary btn-sm" title="Edit">
                ✏️
              </button>
              <button
                @click="deleteOrder(items.id)"
                class="btn btn-danger btn-sm q-ml-sm"
                title="Delete"
              >
                🗑️
              </button>
            </div>
            <div v-else class="grid grid-cols-[70%_30%] gap-2">
              <input
                v-model="editOrderQuantity"
                type="number"
                class="form-input"
                placeholder="e.g., Pharma Co."
              />
              <button @click="submitEdit" class="btn btn-primary">Submit</button>
            </div>
          </div>
          <q-separator class="q-my-md" />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useUserMedicineStore } from 'src/stores/user-medicine';
const store = useUserMedicineStore();
const { loadUsersWithOrders, updateOrderQuantity } = store;
const showEditOrder = ref(false);
const activeOrder = ref();
const editOrderQuantity = ref();
interface Medicine {
  medicineName: string;
  dosage: string;
}

interface OrderItem {
  id: number;
  quantity: number;
  medicine: Medicine;
  selected: boolean;
}

interface UserOrder {
  id: number;
  fullName: string;
  phoneNumber: string;
  company?: string;
  address: string;
  orders: OrderItem[];
}

const orders = ref<UserOrder[]>();
const selectAll = ref(false);
onMounted(async () => {
  await loadOrders();
});

async function loadOrders() {
  const data = await loadUsersWithOrders(false);

  // Add selection state per medicine item
  orders.value = data.map((user) => ({
    id: user.id ?? 0, // ensure number
    fullName: user.fullName,
    phoneNumber: user.phoneNumber,
    company: user.company ?? '',
    address: user.address ?? '',
    createdAt: user.createdAt,

    orders: user.orders.map((item) => ({
      id: item.id ?? 0, // ensure number
      userId: item.userId,
      medicineId: item.medicineId,
      quantity: item.quantity,
      createdAt: item.createdAt,
      exported: item.exported,
      medicine: item.medicine,
      selected: false,
    })),
  }));
}
watch(selectAll, (val) => {
  if (!orders.value) return;

  orders.value.forEach((user) => {
    user.orders.forEach((item) => {
      item.selected = val;
    });
  });
});
watch(
  orders,
  (newOrders) => {
    if (!newOrders) return;

    const allItems = newOrders.flatMap((user) => user.orders);
    selectAll.value = allItems.length > 0 && allItems.every((item) => item.selected);
  },
  { deep: true },
);
async function deleteOrder(id: number) {
  await deleteOrder(id);
}
function editOrder(id: number) {
  showEditOrder.value = true;
  activeOrder.value = id;
}
async function submitEdit() {
  if (!!activeOrder.value && !!editOrderQuantity.value) {
    await updateOrderQuantity(activeOrder.value, editOrderQuantity.value);
    await loadOrders();
    showEditOrder.value = false;
  }
}
</script>

<style>
.rounded-pdf {
  border-radius: 5px;
}
</style>
