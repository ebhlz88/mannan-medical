import Dexie, { type Table } from 'dexie';

// Interfaces
export interface User {
  id?: number;
  fullName: string;
  company?: string | undefined;
  phoneNumber: string;
  address?: string | undefined;
  createdAt: Date;
}

export interface Medicine {
  id?: number;
  userId: number; // Foreign key reference to User
  medicineName: string;
  dosage: string;
  company?: string | undefined;
  createdAt: Date;
}

export interface Order {
  id?: number;
  userId: number; // Foreign key reference to User
  medicineId: number; // Foreign key reference to Medicine
  quantity: number;
  createdAt: Date;
  exported: 0 | 1;
}
export interface UserWithOrders extends User {
  orders: (Order & { medicine: Medicine })[];
  orderStats?: {
    totalOrders: number;
    totalQuantity: number;
    averageQuantity: number;
    lastOrderDate: Date | null;
  };
}
export type MedicineUpdate = Partial<Omit<Medicine, 'id' | 'createdAt'>> & {
  id?: never; // Ensure id cannot be updated
  createdAt?: never; // Ensure createdAt cannot be updated
};

// Database class
export class UserMedicineDatabase extends Dexie {
  users!: Table<User>;
  medicines!: Table<Medicine>;
  order!: Table<Order>;

  constructor() {
    super('UserMedicineDatabase');

    this.version(1)
      .stores({
        users: '++id, fullName, phoneNumber, company, address, createdAt',
        medicines: '++id, userId, medicineName, dosage, company, createdAt, &[userId+medicineName]',
        order: '++id, userId, medicineId, quantity, createdAt, exported, [userId+exported]',
      })
      .upgrade((tx) => {
        // Add any upgrade logic here if needed
        console.log(tx);
      });
  }
}

export const db = new UserMedicineDatabase();

// Database operations
export const userService = {
  // User operations
  async getAllUsers(): Promise<User[]> {
    return await db.users.toArray();
  },

  async getUserById(id: number): Promise<User | undefined> {
    return await db.users.get(id);
  },

  async addUser(
    fullName: string,
    phoneNumber: string,
    company?: string,
    address?: string,
  ): Promise<number> {
    const user: User = {
      fullName,
      phoneNumber,
      company,
      address,
      createdAt: new Date(),
    };
    return await db.users.add(user);
  },

  async updateUser(id: number, updates: Partial<User>): Promise<number> {
    return await db.users.update(id, updates);
  },

  async deleteUser(id: number): Promise<void> {
    // Delete user and all associated medicines (cascade delete)
    await db.transaction('rw', db.users, db.medicines, async () => {
      await db.medicines.where('userId').equals(id).delete();
      await db.users.delete(id);
    });
  },

  async searchUsers(searchTerm: string): Promise<User[]> {
    const lowerSearchTerm = searchTerm.toLowerCase();

    return await db.users
      .filter((user) => {
        const matchesName = user.fullName.toLowerCase().includes(lowerSearchTerm);
        const matchesPhone = user.phoneNumber.includes(searchTerm);
        const matchesCompany = user.company
          ? user.company.toLowerCase().includes(lowerSearchTerm)
          : false;
        const matchesAddress = user.address
          ? user.address.toLowerCase().includes(lowerSearchTerm)
          : false;

        return matchesName || matchesPhone || matchesCompany || matchesAddress;
      })
      .toArray();
  },

  async clearAllUsers(): Promise<void> {
    await db.transaction('rw', db.users, db.medicines, async () => {
      await db.medicines.clear();
      await db.users.clear();
    });
  },

  async getUserCount(): Promise<number> {
    return await db.users.count();
  },

  // Get user with their medicines
  async getUserWithMedicines(
    userId: number,
  ): Promise<{ user: User | undefined; medicines: Medicine[] }> {
    const [user, medicines] = await Promise.all([
      db.users.get(userId),
      db.medicines.where('userId').equals(userId).toArray(),
    ]);
    return { user, medicines };
  },

  // Get all users with their medicines
  async getAllUsersWithMedicines(): Promise<Array<{ user: User; medicines: Medicine[] }>> {
    const users = await db.users.toArray();
    const result = await Promise.all(
      users.map(async (user) => {
        const medicines = await db.medicines.where('userId').equals(user.id!).toArray();
        return { user, medicines };
      }),
    );
    return result;
  },
};

export const medicineService = {
  // Medicine operations
  async getMedicinesByUser(userId: number): Promise<Medicine[]> {
    return await db.medicines.where('userId').equals(userId).toArray();
  },

  async getAllMedicines(): Promise<Medicine[]> {
    return await db.medicines.toArray();
  },

  async getMedicineById(id: number): Promise<Medicine | undefined> {
    return await db.medicines.get(id);
  },
  async getMedicineUserById(
    id: number,
  ): Promise<{ medicine: Medicine | undefined; user: User | undefined }> {
    const medicine = await db.medicines.get(id);

    if (!medicine) {
      return { medicine: undefined, user: undefined };
    }

    const user = await db.users.get(medicine.userId);

    return { medicine, user };
  },

  async addMedicine(
    userId: number,
    medicineName: string,
    dosage: string,
    company?: string,
  ): Promise<number> {
    // Check if user exists
    const userExists = await db.users.get(userId);
    if (!userExists) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Check for duplicate medicine name for the same user
    const existingMedicine = await db.medicines
      .where('[userId+medicineName]')
      .equals([userId, medicineName])
      .first();

    if (existingMedicine) {
      throw new Error(`Medicine "${medicineName}" already exists for this user`);
    }

    const medicine: Medicine = {
      userId,
      medicineName,
      dosage,
      company,
      createdAt: new Date(),
    };
    return await db.medicines.add(medicine);
  },

  async updateMedicine(id: number, updates: Partial<Medicine>): Promise<number> {
    const medicine = await db.medicines.get(id);
    if (!medicine) {
      throw new Error(`Medicine with ID ${id} not found`);
    }

    // If medicineName is being updated, check for duplicates
    if (updates.medicineName && updates.medicineName !== medicine.medicineName) {
      const existingMedicine = await db.medicines
        .where('[userId+medicineName]')
        .equals([medicine.userId, updates.medicineName])
        .first();

      if (existingMedicine) {
        throw new Error(`Medicine "${updates.medicineName}" already exists for this user`);
      }
    }

    return await db.medicines.update(id, updates);
  },

  async deleteMedicine(id: number): Promise<void> {
    await db.medicines.delete(id);
  },

  async deleteAllMedicinesForUser(userId: number): Promise<void> {
    await db.medicines.where('userId').equals(userId).delete();
  },

  async searchMedicines(searchTerm: string): Promise<Medicine[]> {
    const lowerSearchTerm = searchTerm.toLowerCase();

    return await db.medicines
      .filter((medicine) => {
        const matchesName = medicine.medicineName.toLowerCase().includes(lowerSearchTerm);
        const matchesDosage = medicine.dosage.toLowerCase().includes(lowerSearchTerm);
        const matchesCompany = medicine.company
          ? medicine.company.toLowerCase().includes(lowerSearchTerm)
          : false;

        return matchesName || matchesDosage || matchesCompany;
      })
      .toArray();
  },

  async searchMedicinesByUser(userId: number, searchTerm: string): Promise<Medicine[]> {
    const lowerSearchTerm = searchTerm.toLowerCase();

    return await db.medicines
      .where('userId')
      .equals(userId)
      .filter((medicine) => {
        const matchesName = medicine.medicineName.toLowerCase().includes(lowerSearchTerm);
        const matchesDosage = medicine.dosage.toLowerCase().includes(lowerSearchTerm);
        const matchesCompany = medicine.company
          ? medicine.company.toLowerCase().includes(lowerSearchTerm)
          : false;

        return matchesName || matchesDosage || matchesCompany;
      })
      .toArray();
  },

  async getMedicineCount(): Promise<number> {
    return await db.medicines.count();
  },

  async getMedicineCountByUser(userId: number): Promise<number> {
    return await db.medicines.where('userId').equals(userId).count();
  },

  // Clear all medicines (for testing)
  async clearAllMedicines(): Promise<void> {
    await db.medicines.clear();
  },
};

export const orderService = {
  async getOrderByUserId(userId: number): Promise<Order[]> {
    return await db.order.where('userId').equals(userId).toArray();
  },
  async getUnexportedOrderByUserId(userId: number): Promise<Order[]> {
    return await db.order
      .where('userId')
      .equals(userId)
      .and((order) => order.exported === 0)
      .toArray();
  },
  async getOrderById(id: number): Promise<Order[]> {
    return await db.order.where('id').equals(id).toArray();
  },
  async addOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<number> {
    const newOrder: Order = {
      ...order,
      createdAt: new Date(),
    };
    return await db.order.add(newOrder);
  },
  async editQuantity(id: number, newQuantity: number): Promise<number> {
    return await db.order.update(id, { quantity: newQuantity });
  },
  async editOrder(id: number, updates: Partial<Omit<Order, 'id' | 'createdAt'>>): Promise<number> {
    return await db.order.update(id, updates);
  },
  async deleteOrder(id: number): Promise<void> {
    return await db.order.delete(id);
  },
  async getAllOrders(): Promise<Order[]> {
    return await db.order.toArray();
  },
  async deleteOrdersOlderThan(days: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const oldOrders = await db.order.where('createdAt').below(cutoffDate).toArray();

    if (oldOrders.length === 0) {
      return 0; // No orders to delete
    }

    await db.order.bulkDelete(oldOrders.map((order) => order.id!));
    return oldOrders.length; // Return count of deleted orders
  },
  async getUsersWithOrders(exportedFilter?: boolean): Promise<UserWithOrders[]> {
    // Get all users
    const users = await db.users.toArray();
    console.log(users);
    let orders: Order[];
    if (typeof exportedFilter === 'boolean') {
      orders = await db.order
        .where('exported')
        .equals(exportedFilter ? 1 : 0)
        .toArray();
    } else {
      orders = await db.order.toArray();
    }
    // Get all medicines for enrichment
    const medicines = await db.medicines.toArray();
    const medicineMap = new Map(medicines.map((m) => [m.id, m]));

    // Group orders by userId
    const ordersByUser = orders.reduce(
      (acc, order) => {
        if (!acc[order.userId]) {
          acc[order.userId] = [];
        }

        // Enrich order with medicine details
        const enrichedOrder = {
          ...order,
          medicine:
            medicineMap.get(order.medicineId) ||
            ({
              id: order.medicineId,
              medicineName: 'Deleted Medicine',
              dosage: '',
              userId: order.userId,
              company: '',
            } as Medicine),
        };
        acc[order.userId]!.push(enrichedOrder);

        return acc;
      },
      {} as Record<number, (Order & { medicine: Medicine })[]>,
    );

    // Filter users to only include those with orders, then build their data
    return users
      .filter((user) => {
        const userOrders = ordersByUser[user.id!];
        return userOrders && userOrders.length > 0; // Only keep users with orders
      })
      .map((user) => {
        const userOrders = ordersByUser[user.id!]!; // Now safe to use ! since we filtered

        // Calculate order statistics
        const totalOrders = userOrders.length;
        const totalQuantity = userOrders.reduce((sum, order) => sum + order.quantity, 0);
        const averageQuantity = totalQuantity / totalOrders; // No need for check since totalOrders > 0

        // Get last order date
        const lastOrderDate = new Date(
          Math.max(...userOrders.map((o) => new Date(o.createdAt).getTime())),
        );

        return {
          ...user,
          orders: userOrders,
          orderStats: {
            totalOrders,
            totalQuantity,
            averageQuantity,
            lastOrderDate,
          },
        };
      });
  },

  // Get single user with enriched orders
  async getUserWithOrders(userId: number): Promise<UserWithOrders | undefined> {
    const user = await db.users.get(userId);
    if (!user) return undefined;

    // Get user's orders
    const orders = await db.order.where('userId').equals(userId).toArray();

    // Get all relevant medicines
    const medicineIds = [...new Set(orders.map((o) => o.medicineId))];
    const medicines = await db.medicines.bulkGet(medicineIds);
    const medicineMap = new Map(medicines.filter(Boolean).map((m) => [m!.id, m]));

    // Enrich orders with medicine details
    const enrichedOrders = orders.map((order) => ({
      ...order,
      medicine:
        medicineMap.get(order.medicineId) ||
        ({
          id: order.medicineId,
          medicineName: 'Deleted Medicine',
          dosage: '',
          userId: order.userId,
          company: '',
        } as Medicine),
    }));

    // Calculate statistics
    const totalOrders = enrichedOrders.length;
    const totalQuantity = enrichedOrders.reduce((sum, order) => sum + order.quantity, 0);
    const averageQuantity = totalOrders > 0 ? totalQuantity / totalOrders : 0;
    const lastOrderDate =
      enrichedOrders.length > 0
        ? new Date(Math.max(...enrichedOrders.map((o) => new Date(o.createdAt).getTime())))
        : null;

    return {
      ...user,
      orders: enrichedOrders,
      orderStats: {
        totalOrders,
        totalQuantity,
        averageQuantity,
        lastOrderDate,
      },
    };
  },
  async bulkSetExported(orderIds: number[], exported: 0 | 1): Promise<number> {
    if (orderIds.length === 0) return 0;

    const updates = orderIds.map((id) => ({
      key: id,
      changes: { exported },
    }));

    await db.order.bulkUpdate(updates);

    return orderIds.length;
  },
};

// Combined service for complex operations
export const combinedService = {
  // Get statistics
  async getStatistics(): Promise<{
    totalUsers: number;
    totalMedicines: number;
    usersWithMedicines: number;
    averageMedicinesPerUser: number;
  }> {
    const [totalUsers, totalMedicines, allUsersWithMedicines] = await Promise.all([
      db.users.count(),
      db.medicines.count(),
      userService.getAllUsersWithMedicines(),
    ]);

    const usersWithMedicines = allUsersWithMedicines.filter(
      (item) => item.medicines.length > 0,
    ).length;
    const averageMedicinesPerUser = totalUsers > 0 ? totalMedicines / totalUsers : 0;

    return {
      totalUsers,
      totalMedicines,
      usersWithMedicines,
      averageMedicinesPerUser,
    };
  },

  // Bulk operations
  async addUserWithMedicines(
    userData: Omit<User, 'id' | 'createdAt'>,
    medicinesData: Array<Omit<Medicine, 'id' | 'userId' | 'createdAt'>>,
  ): Promise<{ userId: number; medicineIds: number[] }> {
    return await db.transaction('rw', db.users, db.medicines, async () => {
      // Add user
      const userId = await userService.addUser(
        userData.fullName,
        userData.phoneNumber,
        userData.company,
        userData.address,
      );

      // Add medicines
      const medicineIds = await Promise.all(
        medicinesData.map(async (medicine) => {
          return await medicineService.addMedicine(
            userId,
            medicine.medicineName,
            medicine.dosage,
            medicine.company,
          );
        }),
      );

      return { userId, medicineIds };
    });
  },

  // Import/export data
  async exportData(): Promise<{
    users: User[];
    medicines: Medicine[];
    exportedAt: Date;
  }> {
    const [users, medicines] = await Promise.all([db.users.toArray(), db.medicines.toArray()]);

    return {
      users,
      medicines,
      exportedAt: new Date(),
    };
  },

  async importData(data: { users: User[]; medicines: Medicine[] }): Promise<void> {
    await db.transaction('rw', db.users, db.medicines, async () => {
      // Clear existing data
      await db.medicines.clear();
      await db.users.clear();

      // Import new data
      await db.users.bulkAdd(data.users);
      await db.medicines.bulkAdd(data.medicines);
    });
  },
};

// Helper functions for search logic
export const searchHelpers = {
  userMatchesSearch(user: User, searchTerm: string, lowerSearchTerm: string): boolean {
    const matchesName = user.fullName.toLowerCase().includes(lowerSearchTerm);
    const matchesPhone = user.phoneNumber.includes(searchTerm);
    const matchesCompany = user.company
      ? user.company.toLowerCase().includes(lowerSearchTerm)
      : false;
    const matchesAddress = user.address
      ? user.address.toLowerCase().includes(lowerSearchTerm)
      : false;

    return matchesName || matchesPhone || matchesCompany || matchesAddress;
  },

  medicineMatchesSearch(medicine: Medicine, lowerSearchTerm: string): boolean {
    const matchesName = medicine.medicineName.toLowerCase().includes(lowerSearchTerm);
    const matchesDosage = medicine.dosage.toLowerCase().includes(lowerSearchTerm);
    const matchesCompany = medicine.company
      ? medicine.company.toLowerCase().includes(lowerSearchTerm)
      : false;

    return matchesName || matchesDosage || matchesCompany;
  },
};
