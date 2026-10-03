import { CompanyDriver } from "./driver";

export interface PreviewUser {
  photoURL: string;
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
}

export interface BaseUserData extends PreviewUser {
  idNumber: string;
  phoneNumber: string;
  email: string;
}

export interface OverviewUserData extends BaseUserData {
  drivers: CompanyDriver[] | null;
}

export interface UserData extends BaseUserData {
  password: string;
}

export interface User extends UserData {
  type: "company" | "driver";
}

export interface LoginRequest {
  email: string;
  password: string;
}
