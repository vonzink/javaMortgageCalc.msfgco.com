export interface User {
  id: string;
  email: string;
  name: string;
  initials: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface ProcessingRecord {
  id: string;
  type: string;
  borrower: string;
  loanNumber: string;
  address: string;
  vendor: string;
  status: string;
  orderedDate: string;
  reference: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessingSearchParams {
  q?: string;
  status?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface ProcessingSearchResponse {
  results: ProcessingRecord[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface SiteConfig {
  siteName?: string;
  companyName?: string;
  nmls?: string;
  logoUrl?: string;
  aiEnabled?: boolean;
  aiProvider?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}
