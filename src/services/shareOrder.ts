import type { UserWithOrders } from 'src/services/database';
import { Share } from '@capacitor/share';
import { Notify } from 'quasar';
import { Capacitor } from '@capacitor/core';
import { useUserMedicineStore } from 'src/stores/user-medicine';
const store = useUserMedicineStore();
const { updateOrderExported } = store;

export const shareSingleOrder = async (userOrder: UserWithOrders) => {
  const ordersText = userOrder.orders
    .map((order, index) => {
      return `
Order #${index + 1}
Medicine: ${order.medicine.medicineName}
Dosage: ${order.medicine.dosage}
Company: ${order.medicine.company}
Quantity: ${order.quantity}
Date: ${new Date(order.createdAt).toLocaleString()}
`;
    })
    .join('\n------------------\n');

  const message = `
Customer Details
------------------
Name: ${userOrder.fullName}
Phone: ${userOrder.phoneNumber}
Company: ${userOrder.company}
Address: ${userOrder.address}

Orders
==================
${ordersText}
`;

  try {
    // Check if Share is available on the platform
    if (Capacitor.isNativePlatform()) {
      const { value } = await Share.canShare();
      if (!value) {
        Notify.create({
          message: 'Sharing is not available on this device',
          type: 'warning',
        });
        return;
      }
    }
    console.log(message);
    console.log(userOrder.fullName);
    const shareResult = await Share.share({
      title: 'Customer Order Details',
      text: message,
      dialogTitle: `Share with ${userOrder.fullName}`,
    });

    // Check if share was completed
    if (shareResult.activityType) {
      console.log('Shared via:', shareResult.activityType);
    }
    for (const order of userOrder.orders) {
      if (order.id) await updateOrderExported(order.id, 1);
    }
  } catch (error) {
    console.error('Share failed:', error);
    Notify.create({
      message: 'Sharing is not available',
      type: 'warning',
    });
    // }
    // else {
    Notify.create({
      message: 'Failed to share',
      type: 'negative',
    });
    // }
  }
};
