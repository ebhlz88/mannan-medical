<template>
  <div v-if="props.medicineDetail" class="text-black q-pa-lg bg-white rounded-pdf">
    <!-- Title -->
    <div class="text-h6 text-bold">Medicine Order</div>

    <q-separator class="q-my-md" />
    <div class="q-mb-md">
      <div class="text-body1 text-bold">Medicine Info</div>

      <div class="flex justify-between q-px-sm q-pr-xl q-mt-sm">
        <div class="text-body2">Medicine Name:</div>
        <div class="text-body1 text-bold">
          {{ props.medicineDetail.medicine.medicineName }}
        </div>
      </div>
      <div class="flex justify-between q-px-sm q-pr-xl q-mt-sm">
        <div class="text-body2">Dosage:</div>
        <div class="text-body1 text-bold">
          {{ props.medicineDetail.medicine.dosage }}
        </div>
      </div>
      <div class="flex justify-between q-px-sm q-pr-xl q-mt-sm">
        <div class="text-body2">Company:</div>
        <div class="text-body1 text-bold">
          {{ props.medicineDetail.medicine.company }}
        </div>
      </div>
    </div>
    <q-separator class="q-my-md" />
    <div class="q-mb-md">
      <div class="text-body1 text-bold">User Info</div>

      <div class="flex justify-between q-px-sm q-pr-xl q-mt-sm">
        <div class="text-body2">Full Name:</div>
        <div class="text-body1 text-bold">
          {{ props.medicineDetail.user.fullName }}
        </div>
      </div>
      <div class="flex justify-between q-px-sm q-pr-xl q-mt-sm">
        <div class="text-body2">Phone Number:</div>
        <div class="text-body1 text-bold">
          {{ props.medicineDetail.user.phoneNumber }}
        </div>
      </div>
      <div class="flex justify-between q-px-sm q-pr-xl q-mt-sm">
        <div class="text-body2">Company:</div>
        <div class="text-body1 text-bold">
          {{ props.medicineDetail.medicine.company }}
        </div>
      </div>
      <div class="flex justify-between q-px-sm q-pr-xl q-mt-sm">
        <div class="text-body2">Address:</div>
        <div class="text-body1 text-bold">
          {{ props.medicineDetail.user.address }}
        </div>
      </div>
    </div>

    <q-separator class="q-my-md" />
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  medicineDetail: {
    type: Object,
    required: true,
  },
});
console.log('from pdf', props.medicineDetail);
</script>

<style>
.rounded-pdf {
  border-radius: 5px;
}
</style>
