<template>
  <div>
    <div class="flex justify-end">
      <button @click="downloadPdf" class="btn btn-secondary q-mb-sm">Download PDF</button>
    </div>
    <MedicinePDF id="medicine-order" :medicineDetail="medicine"></MedicinePDF>
  </div>
</template>
<script setup lang="ts">
// import type { Medicine, User } from 'src/services/database';
import MedicinePDF from 'src/components/MedicinePDF.vue';
import html2pdf from 'html2pdf.js';
import { useUserMedicineStore } from 'src/stores/user-medicine';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const userMedicineStore = useUserMedicineStore();

const { loadMedicineUserById } = userMedicineStore;
const medicine = ref();
async function downloadPdf() {
  const element = document.getElementById('medicine-order');
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
  await html2pdf().set(options).from(element).save();
}
onMounted(async () => {
  medicine.value = await loadMedicineUserById(Number(route.params.id));
  console.log(medicine.value);
});
</script>
