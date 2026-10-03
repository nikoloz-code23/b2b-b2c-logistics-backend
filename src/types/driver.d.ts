export interface CompanyDriverPreview {
  photoURL: string;
  firstName: string;
  lastName: string;
}

export interface CompanyDriverEssential extends CompanyDriverPreview {
  photoURL: string;
}

export interface CompanyDriverData extends CompanyDriverEssential {
  companyId: number;
}

export interface CompanyDriver extends CompanyDriverEssential {
  id: number;
}
