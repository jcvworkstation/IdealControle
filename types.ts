export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum MealType {
  BREAKFAST = 'BREAKFAST',
  LUNCH = 'LUNCH',
  DINNER = 'DINNER'
}

export interface Company {
  id: string;
  name: string;
  logoUrl?: string; // Simulated URL
}

export interface User {
  id: string;
  name: string;
  companyId: string;
  role: UserRole;
  password?: string; // For simplicity in this demo
}

export interface MealRecord {
  id: string;
  userId: string;
  companyId: string;
  userName: string; // Denormalized for easier reporting
  companyName: string; // Denormalized for easier reporting
  type: MealType;
  date: string; // ISO String
}

export interface AppState {
  currentUser: User | null;
}