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
export type MedicineUpdate = Partial<Omit<Medicine, 'id' | 'createdAt'>> & {
  id?: never; // Ensure id cannot be updated
  createdAt?: never; // Ensure createdAt cannot be updated
};

// Database class
export class UserMedicineDatabase extends Dexie {
  users!: Table<User>;
  medicines!: Table<Medicine>;

  constructor() {
    super('UserMedicineDatabase');

    this.version(1).stores({
      users: '++id, fullName, phoneNumber, company, address, createdAt',
      medicines: '++id, userId, medicineName, dosage, company, createdAt, &[userId+medicineName]',
    });

    // Define relationships and constraints
    this.version(2)
      .stores({
        users: '++id, fullName, phoneNumber, company, address, createdAt',
        medicines: '++id, userId, medicineName, dosage, company, createdAt, &[userId+medicineName]',
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
