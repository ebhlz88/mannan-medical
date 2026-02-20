import html2pdf from 'html2pdf.js';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import type { UserWithOrders } from './database';
import { useUserMedicineStore } from 'src/stores/user-medicine';
import { Notify } from 'quasar';

const store = useUserMedicineStore();
const { updateOrderExported } = store;
/**
 * Method 1: Generate PDF from HTML content
 * @param {HTMLElement} element - The HTML element to convert to PDF
 * @param {string} filename - Name of the PDF file
 */
export const generatePDFFromHTML = async (
  element: HTMLElement,
  filename: string,
  userOrder: UserWithOrders,
) => {
  try {
    const options = {
      margin: 0.5,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    } as const;

    // Generate PDF as blob
    const pdfBlob = await html2pdf().set(options).from(element).outputPdf('blob');
    await html2pdf().set(options).from(element).save();
    return await savePDFToDevice(pdfBlob, filename, userOrder);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * Save PDF blob to device
 * @param {Blob} pdfBlob - PDF blob data
 * @param {string} filename - File name
 */
const savePDFToDevice = async (pdfBlob: Blob, filename: string, userOrder: UserWithOrders) => {
  try {
    const reader = new FileReader();

    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const parts = reader.result.split(',');
          if (parts[1]) {
            resolve(parts[1]); // guaranteed string
          } else {
            reject(new Error('Failed to extract base64 data'));
          }
        } else {
          reject(new Error('Unexpected FileReader result type'));
        }
      };
    });

    reader.readAsDataURL(pdfBlob);
    const base64Data = await base64Promise;

    return await saveBase64PDF(base64Data, filename, userOrder);
  } catch (error) {
    console.error('Error saving PDF:', error);
    throw error;
  }
};

/**
 * Save base64 PDF to device storage
 * @param {string} base64String - Base64 PDF data
 * @param {string} filename - File name
 */
const saveBase64PDF = async (base64String: string, filename: string, userOrder: UserWithOrders) => {
  try {
    // Remove prefix if present
    const base64Data = base64String.startsWith('data:application/pdf;base64,')
      ? base64String.split(',')[1]
      : base64String;

    if (!base64Data) {
      throw new Error('Invalid base64 PDF string');
    }

    // For Android, use Documents directory
    const directory = Capacitor.getPlatform() === 'android' ? Directory.Documents : Directory.Data;

    // Save file
    const result = await Filesystem.writeFile({
      path: `${filename}`,
      data: base64Data,
      directory: directory,
      recursive: true,
    });

    console.log('File saved at:', result.uri);

    // Get the file URI
    const fileUri = await Filesystem.getUri({
      path: filename,
      directory: directory,
    });
    await Share.share({
      url: result.uri,
    });
    for (const order of userOrder.orders) {
      if (order.id) await updateOrderExported(order.id, 1);
    }
    await Filesystem.deleteFile({
      path: filename,
      directory: directory,
    });

    return {
      uri: fileUri.uri,
      path: `PDFs/${filename}`,
    };
  } catch (error) {
    console.error('Error saving PDF to device:', error);
    throw error;
  }
};

export const shareSingleOrder = async (userOrder: UserWithOrders) => {
  const ordersText = userOrder.orders
    .map((order, index) => {
      return `${index + 1} ${order.medicine.medicineName} ${order.medicine.dosage} - ${order.quantity}`;
    })
    .join('\n');

  const message = ordersText;
  console.log(message);

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

export const exportData = async (fileName: string) => {
  const data = await store.exportData();
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
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
    const directory = Capacitor.getPlatform() === 'android' ? Directory.Documents : Directory.Data;
    const result = await Filesystem.writeFile({
      path: `${fileName}`,
      data: blob,
      directory: directory,
      recursive: true,
    });

    await Share.share({
      url: result.uri,
    });
  } catch (error) {
    console.log(error);
  }
};
