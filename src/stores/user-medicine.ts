import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  db,
  userService,
  medicineService,
  orderService,
  type User,
  type Medicine,
  type MedicineUpdate,
  type Order,
} from 'src/services/database';

export const useUserMedicineStore = defineStore('userMedicine', () => {
  // State
  const users = ref<User[]>([]);
  const medicines = ref<Medicine[]>([]);
  const orders = ref<Order[]>([]);
  const currentOrder = ref<Order | null>(null);
  const currentUser = ref<User | null>(null);
  const currentMedicine = ref<Medicine | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const totalUsers = computed(() => users.value.length);
  const totalMedicines = computed(() => medicines.value.length);
  const totalOrders = computed(() => orders.value.length);
  const usersWithMedicines = computed(() => {
    return users.value.filter((user) =>
      medicines.value.some((medicine) => medicine.userId === user.id),
    ).length;
  });
  const averageMedicinesPerUser = computed(() => {
    return totalUsers.value > 0 ? totalMedicines.value / totalUsers.value : 0;
  });

  // Get medicines for a specific user
  const getMedicinesByUserId = computed(() => (userId: number) => {
    return medicines.value.filter((medicine) => medicine.userId === userId);
  });

  // Get user by ID
  const getUserById = computed(() => (id: number) => {
    return users.value.find((user) => user.id === id);
  });

  // Get medicine by ID
  const getMedicineById = computed(() => (id: number) => {
    return medicines.value.find((medicine) => medicine.id === id);
  });

  // Actions
  const setError = (message: string | null) => {
    error.value = message;
  };

  const clearError = () => {
    error.value = null;
  };

  // User Actions
  const loadUsers = async () => {
    try {
      isLoading.value = true;
      clearError();
      users.value = await userService.getAllUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const loadUserById = async (id: number) => {
    try {
      isLoading.value = true;
      clearError();
      const user = await userService.getUserById(id);
      if (user) {
        currentUser.value = user;
        return user;
      }
      throw new Error('User not found');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const createUser = async (
    fullName: string,
    phoneNumber: string,
    company?: string,
    address?: string,
  ) => {
    try {
      isLoading.value = true;
      clearError();
      const userId = await userService.addUser(fullName, phoneNumber, company, address);

      // Refresh users list
      await loadUsers();

      // Load the newly created user
      await loadUserById(userId);

      return userId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateUser = async (id: number, updates: Partial<User>) => {
    try {
      isLoading.value = true;
      clearError();
      const updated = await userService.updateUser(id, updates);

      if (updated > 0) {
        // Update local state
        const index = users.value.findIndex((user) => user.id === id);
        if (index !== -1) {
          users.value[index] = { ...users.value[index], ...updates } as User;
        }

        // Update current user if it's the one being updated
        if (currentUser.value?.id === id) {
          currentUser.value = { ...currentUser.value, ...updates };
        }
      }

      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteUser = async (id: number) => {
    try {
      isLoading.value = true;
      clearError();
      await userService.deleteUser(id);

      // Update local state
      users.value = users.value.filter((user) => user.id !== id);

      // Clear current user if it's the one being deleted
      if (currentUser.value?.id === id) {
        currentUser.value = null;
      }

      // Remove medicines associated with this user
      medicines.value = medicines.value.filter((medicine) => medicine.userId !== id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const searchUsers = async (searchTerm: string) => {
    try {
      isLoading.value = true;
      clearError();
      const results = await userService.searchUsers(searchTerm);
      return results;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search users');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const clearUsers = async () => {
    try {
      isLoading.value = true;
      clearError();
      await userService.clearAllUsers();
      users.value = [];
      medicines.value = [];
      currentUser.value = null;
      currentMedicine.value = null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear users');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Medicine Actions
  const loadMedicines = async () => {
    try {
      isLoading.value = true;
      clearError();
      medicines.value = await medicineService.getAllMedicines();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load medicines');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const loadMedicinesByUser = async (userId: number) => {
    try {
      isLoading.value = true;
      clearError();
      return await medicineService.getMedicinesByUser(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load medicines');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const loadMedicineUserById = async (id: number) => {
    try {
      isLoading.value = true;
      clearError();
      return await medicineService.getMedicineUserById(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load medicine');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const loadUserWithMedicines = async (userId: number) => {
    try {
      isLoading.value = true;
      clearError();
      const result = await userService.getUserWithMedicines(userId);

      if (result.user) {
        currentUser.value = result.user;
        // Update medicines for this user in local state
        medicines.value = [
          ...medicines.value.filter((m) => m.userId !== userId),
          ...result.medicines,
        ];
      }

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user with medicines');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const loadAllUsersWithMedicines = async () => {
    try {
      isLoading.value = true;
      clearError();
      const results = await userService.getAllUsersWithMedicines();

      // Update local state
      users.value = results.map((r) => r.user);
      medicines.value = results.flatMap((r) => r.medicines);

      return results;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users with medicines');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const createMedicine = async (
    userId: number,
    medicineName: string,
    dosage: string,
    company?: string,
  ) => {
    try {
      isLoading.value = true;
      clearError();
      const medicineId = await medicineService.addMedicine(userId, medicineName, dosage, company);

      // Refresh medicines list
      await loadMedicines();

      // Load the newly created medicine
      const newMedicine = await medicineService.getMedicineById(medicineId);
      if (newMedicine) {
        currentMedicine.value = newMedicine;
      }

      return medicineId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create medicine');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateMedicine = async (id: number, updates: MedicineUpdate) => {
    try {
      isLoading.value = true;
      clearError();
      const updated = await medicineService.updateMedicine(id, updates);

      if (updated > 0) {
        // Update local state
        const index = medicines.value.findIndex((medicine) => medicine.id === id);
        if (index !== -1) {
          medicines.value[index] = { ...medicines.value[index], ...updates } as Medicine;
        }

        // Update current medicine if it's the one being updated
        if (currentMedicine.value?.id === id) {
          currentMedicine.value = { ...currentMedicine.value, ...updates };
        }
      }

      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update medicine');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteMedicine = async (id: number) => {
    try {
      isLoading.value = true;
      clearError();
      await medicineService.deleteMedicine(id);

      // Update local state
      medicines.value = medicines.value.filter((medicine) => medicine.id !== id);

      // Clear current medicine if it's the one being deleted
      if (currentMedicine.value?.id === id) {
        currentMedicine.value = null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete medicine');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const searchMedicines = async (searchTerm: string) => {
    try {
      isLoading.value = true;
      clearError();
      const results = await medicineService.searchMedicines(searchTerm);
      return results;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search medicines');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const searchMedicinesByUser = async (userId: number, searchTerm: string) => {
    try {
      isLoading.value = true;
      clearError();
      const results = await medicineService.searchMedicinesByUser(userId, searchTerm);
      return results;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search medicines');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Combined Actions
  const createUserWithMedicines = async (
    userData: {
      fullName: string;
      phoneNumber: string;
      company?: string;
      address?: string;
    },
    medicinesData: Array<{
      medicineName: string;
      dosage: string;
      company?: string;
    }>,
  ) => {
    try {
      isLoading.value = true;
      clearError();

      // Create user
      const userId = await userService.addUser(
        userData.fullName,
        userData.phoneNumber,
        userData.company,
        userData.address,
      );

      // Create medicines
      const medicineIds: number[] = [];
      for (const medicine of medicinesData) {
        const medicineId = await medicineService.addMedicine(
          userId,
          medicine.medicineName,
          medicine.dosage,
          medicine.company,
        );
        medicineIds.push(medicineId);
      }

      // Refresh data
      await loadAllUsersWithMedicines();

      return { userId, medicineIds };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user with medicines');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const getStatistics = async () => {
    try {
      isLoading.value = true;
      clearError();

      const [userCount, medicineCount] = await Promise.all([
        userService.getUserCount(),
        medicineService.getMedicineCount(),
      ]);

      return {
        totalUsers: userCount,
        totalMedicines: medicineCount,
        usersWithMedicines: usersWithMedicines.value,
        averageMedicinesPerUser: averageMedicinesPerUser.value,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get statistics');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  // order
  const getOrdersByUserId = computed(() => (userId: number) => {
    return orders.value.filter((order) => order.userId === userId);
  });
  const getOrderById = computed(() => (id: number) => {
    return orders.value.find((order) => order.id === id);
  });
  const getUnexportedOrdersByUserId = async (userId: number) => {
    return orderService.getUnexportedOrderByUserId(userId);
  };
  const loadOrdersByUserId = async (userId: number) => {
    try {
      isLoading.value = true;
      clearError();
      const userOrders = await orderService.getOrderByUserId(userId);

      // Update local state with these orders
      // Remove existing orders for this user and add fresh ones
      orders.value = [...orders.value.filter((order) => order.userId !== userId), ...userOrders];

      return userOrders;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user orders');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  const loadAllOrders = async () => {
    try {
      isLoading.value = true;
      clearError();
      const orders = await orderService.getAllOrders();
      return orders;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  const loadUsersWithOrders = async (exportedBoolean?: boolean) => {
    try {
      isLoading.value = true;
      clearError();
      const orders = await orderService.getUsersWithOrders(exportedBoolean);
      return orders;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  const createOrder = async (
    userId: number,
    medicineId: number,
    quantity: number,
    exported: 0 | 1 = 0,
  ) => {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
    try {
      isLoading.value = true;
      clearError();

      // Verify user exists
      const user = await userService.getUserById(userId);
      if (!user) throw new Error('User not found');

      // Verify medicine exists
      const medicine = await medicineService.getMedicineById(medicineId);
      if (!medicine) throw new Error('Medicine not found');

      const orderId = await orderService.addOrder({
        userId,
        medicineId,
        quantity,
        exported,
      });

      // Refresh orders list
      await orderService.getAllOrders();

      // Load the newly created order
      await orderService.getOrderById(orderId);

      return orderId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  const updateOrderQuantity = async (id: number, quantity: number) => {
    try {
      isLoading.value = true;
      clearError();

      if (quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }

      const updated = await orderService.editQuantity(id, quantity);

      if (updated > 0) {
        // Update local state
        const index = orders.value.findIndex((order) => order.id === id);
        if (index !== -1) {
          orders.value[index] = { ...orders.value[index], quantity } as Order;
        }
        if (currentOrder.value?.id === id) {
          currentOrder.value = { ...currentOrder.value, quantity };
        }
      }

      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order quantity');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  const updateOrder = async (
    id: number,
    updates: Partial<Omit<Order, 'id' | 'createdAt' | 'userId'>>,
  ) => {
    try {
      isLoading.value = true;
      clearError();

      const updated = await orderService.editOrder(id, updates);

      if (updated > 0) {
        // Update local state
        const index = orders.value.findIndex((order) => order.id === id);
        if (index !== -1) {
          orders.value[index] = { ...orders.value[index], ...updates } as Order;
        }
        if (currentOrder.value?.id === id) {
          currentOrder.value = { ...currentOrder.value, ...updates };
        }
      }

      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  const deleteOrder = async (id: number) => {
    try {
      isLoading.value = true;
      clearError();
      await orderService.deleteOrder(id);

      // Update local state
      orders.value = orders.value.filter((order) => order.id !== id);
      if (currentOrder.value?.id === id) {
        currentOrder.value = null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete order');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  const deleteOrdersOlderThan = async (days: number = 30) => {
    try {
      isLoading.value = true;
      clearError();

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const deletedCount = await orderService.deleteOrdersOlderThan(days);

      // Remove deleted orders from local state
      orders.value = orders.value.filter((order) => order.createdAt >= cutoffDate);

      // Clear current order if it was deleted
      if (currentOrder.value && currentOrder.value.createdAt < cutoffDate) {
        currentOrder.value = null;
      }

      return deletedCount;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete old orders');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  const butSetExport = async (ids: number[], exported: 0 | 1) => {
    try {
      isLoading.value = true;
      clearError();
      await orderService.bulkSetExported(ids, exported);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set Export order');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  const exportData = async () => {
    try {
      isLoading.value = true;
      clearError();

      const [usersData, medicinesData] = await Promise.all([
        userService.getAllUsers(),
        medicineService.getAllMedicines(),
      ]);

      return {
        users: usersData,
        medicines: medicinesData,
        exportedAt: new Date(),
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const importData = async (data: { users: User[]; medicines: Medicine[] }) => {
    try {
      isLoading.value = true;
      clearError();

      await userService.clearAllUsers();
      await db.transaction('rw', db.users, db.medicines, async () => {
        await db.users.bulkAdd(data.users);
        await db.medicines.bulkAdd(data.medicines);
      });

      // Refresh local state
      users.value = data.users;
      medicines.value = data.medicines;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import data');
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Initialize store
  const initialize = async () => {
    try {
      isLoading.value = true;
      clearError();
      await loadAllUsersWithMedicines();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize store');
    } finally {
      isLoading.value = false;
    }
  };

  return {
    // State
    users,
    medicines,
    orders,
    currentOrder,
    totalOrders,
    currentUser,
    currentMedicine,
    isLoading,
    error,

    // Getters
    totalUsers,
    totalMedicines,
    usersWithMedicines,
    averageMedicinesPerUser,
    getMedicinesByUserId,
    getUserById,
    getMedicineById,

    // Actions
    setError,
    clearError,

    // User Actions
    loadUsers,
    loadUserById,
    createUser,
    updateUser,
    deleteUser,
    searchUsers,
    clearUsers,

    // Medicine Actions
    loadMedicines,
    loadMedicineUserById,
    loadMedicinesByUser,
    loadUserWithMedicines,
    loadAllUsersWithMedicines,
    createMedicine,
    updateMedicine,
    deleteMedicine,
    searchMedicines,
    searchMedicinesByUser,

    //order Actions
    loadAllOrders,
    getOrderById,
    getOrdersByUserId,
    loadUsersWithOrders,
    getUnexportedOrdersByUserId,
    loadOrdersByUserId,
    createOrder,
    updateOrder,
    updateOrderQuantity,
    deleteOrder,
    deleteOrdersOlderThan,
    butSetExport,

    // Combined Actions
    createUserWithMedicines,
    getStatistics,
    exportData,
    importData,

    // Initialization
    initialize,
  };
});
