<template>
  <div>
    <div class="flex justify-end">
      <button @click="downloadAll" class="btn btn-primary">Download PDF</button>
    </div>
    <div
      v-for="user in orders"
      :key="user.id"
      :id="String(`order-${user.id}`)"
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
</template>
<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useUserMedicineStore } from 'src/stores/user-medicine';
import html2pdf from 'html2pdf.js';
import type { UserWithOrders } from 'src/services/database';
const store = useUserMedicineStore();
const { loadUsersWithOrders, updateOrderQuantity, deleteOrder, butSetExport } = store;
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

const allOrderIds = computed<number[]>(() => {
  return orders.value.flatMap((user) =>
    user.orders.map((item) => item.id).filter((id): id is number => id !== undefined),
  );
});

const allUserIds = computed<number[]>(() => {
  return orders.value.flatMap((user) => user.id ?? 0);
});

async function downloadAll() {
  for (const id of allUserIds.value) {
    await downloadPdf(id);
  }
  await butSetExport(allOrderIds.value, 1);
}

async function downloadPdf(id: number) {
  const element = document.getElementById(`order-${id}`);
  console.log(`order-${id}`);
  console.log(element);
  const options = {
    margin: 10,
    filename: 'medicine-order.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  } as const;
  if (!element) {
    console.error('Receipt element not found');
    return;
  }
  const worker = html2pdf().set(options).from(element);

  const pdfBlob = await worker.outputPdf('blob');

  const url = URL.createObjectURL(pdfBlob);

  // Open in new tab instead of download
  window.open(url, '_blank');
}
</script>

<style>
.rounded-pdf {
  border-radius: 5px;
}
</style>
