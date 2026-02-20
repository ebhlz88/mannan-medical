<template>
  <div>
    <div class="flex justify-end">
      <button @click="$router.push({ name: 'ExportedOrders' })" class="btn btn-primary">
        Shared Orders
      </button>
    </div>

    <div
      v-for="user in orders"
      :key="user.id"
      class="text-black q-pa-lg q-my-sm bg-white rounded-pdf"
    >
      <!-- Title -->
      <div>
        <div class="flex justify-between items-center">
          <div class="text-h6">Medicine Order</div>
          <div class="flex space-x-6 items-center">
            <q-icon
              v-if="user.id && user.fullName"
              @click="shareOrderPDF(user.fullName, user)"
              size="md"
              color="blue"
              name="description"
            ></q-icon>
            <q-icon
              v-if="user.id && user.fullName"
              @click="shareOrderText(user)"
              size="md"
              color="blue"
              class="q-ml-lg"
              name="share"
            ></q-icon>
          </div>
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
        <div :id="String(`order-${user.id}`)">
          <div class="text-body2 text-bold q-mb-lg">Medicine Info</div>

          <div v-for="(items, i) in user.orders" :key="items.id" class="q-mb-md">
            <div class="flex justify-between">
              <div class="text-caption text-bold">
                ({{ Number(i) + 1 }}) {{ items.medicine.medicineName }}
              </div>
            </div>

            <div class="flex justify-between q-px-sm q-pr-sm q-mt-sm">
              <div class="text-caption">Dosage:</div>
              <div class="text-caption text-bold">
                {{ items.medicine.dosage }}
              </div>
            </div>
            <div class="flex justify-between q-px-sm q-pr-sm q-mt-sm">
              <div class="text-caption">Quantity:</div>
              <div class="text-caption text-bold">
                {{ items.quantity }}
              </div>
            </div>
            <div class="flex justify-between q-px-sm q-pr-sm q-mt-sm">
              <div class="text-caption">Actions:</div>
              <div v-if="!showEditOrder && items.id" class="flex">
                <button @click="editOrder(items.id)" class="btn btn-primary btn-sm" title="Edit">
                  ✏️
                </button>
                <button
                  @click="removeOrder(items.id)"
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
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useUserMedicineStore } from 'src/stores/user-medicine';
import { generatePDFFromHTML, shareSingleOrder } from 'src/services/shareOrder';
import type { UserWithOrders } from 'src/services/database';
const store = useUserMedicineStore();
const { loadUsersWithOrders, updateOrderQuantity, deleteOrder } = store;
const showEditOrder = ref(false);
const activeOrder = ref();
const editOrderQuantity = ref();
const orders = ref<UserWithOrders[]>([]);
onMounted(async () => {
  await loadOrders();
});

async function loadOrders() {
  const data = await loadUsersWithOrders(false);

  // Add selection state per medicine item
  orders.value = data;
}
async function removeOrder(id: number) {
  await deleteOrder(id);
  await loadOrders();
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
async function shareOrderText(userOrder: UserWithOrders) {
  await shareSingleOrder(userOrder);
  await loadOrders();
}
function buildOrdersElement(orders: UserWithOrders) {
  const wrapper = document.createElement('div');
  wrapper.style.padding = '0.5in';
  if (!orders) return wrapper;

  orders.orders.forEach((item, i) => {
    const div = document.createElement('div');
    div.textContent = `${i + 1}- ${item.medicine.medicineName} ${item.medicine.dosage}. ${item.quantity}`;
    wrapper.appendChild(div);
  });

  return wrapper;
}

async function shareOrderPDF(userName: string, userOrder: UserWithOrders) {
  try {
    const element = buildOrdersElement(userOrder);
    console.log(element);
    await generatePDFFromHTML(element, `order-${userName}.pdf`, userOrder);
  } catch (error) {
    console.log(error);
  }
  await loadOrders();
}
</script>

<style>
.rounded-pdf {
  border-radius: 5px;
}
.page-break {
  page-break-after: always;
}
</style>
