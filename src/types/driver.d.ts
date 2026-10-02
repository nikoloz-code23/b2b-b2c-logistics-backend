export interface CompanyDriverEssential {
  photoURL: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface CompanyDriverData extends CompanyDriverEssential {
  companyId: number;
}

export interface CompanyDriver extends CompanyDriverEssential {
  id: number;
}
