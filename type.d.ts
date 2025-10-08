export interface customerRouter {
  postCustomer: void;
  patchCustomer: void;
  deleteCustomer: void;
}

export interface user {}

export interface user {}

export interface user {}

export interface user {}

export interface user {}

export interface User {
  id: number;
  companyId: number;
  name: string;
  email: string;
  employeeNumber: string;
  phoneNumber: string;
  imageUrl: string;
  isAdmin: boolean;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
    interface User {
      id: number;
      companyId: number;
      name: string;
      email: string;
      employeeNumber: string;
      phoneNumber: string;
      imageUrl: string;
      isAdmin: boolean;
      password: string;
      createdAt: Date;
      updatedAt: Date;
    }
  }
  interface Request {
    user: User;
  }
}

export {};
