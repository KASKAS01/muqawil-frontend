export type Role = 'CLIENT' | 'CONTRACTOR' | 'ADMIN';

export type Category =
  | 'PLUMBING'
  | 'ELECTRICAL'
  | 'PAINTING'
  | 'TILING'
  | 'CARPENTRY'
  | 'HVAC'
  | 'GENERAL';

export type QuoteRequestStatus = 'OPEN' | 'HIRED' | 'CLOSED';
export type QuoteResponseStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type JobStatus = 'ACTIVE' | 'COMPLETED' | 'DISPUTED';
export type MilestoneType = 'UPFRONT' | 'MID' | 'FINAL';
export type MilestoneStatus = 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID';

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
  phone: string;
  createdAt: string;
}

export interface QuoteResponse {
  id: string;
  quoteRequestId: string;
  contractorId: string;
  contractor: { id: string; name: string; phone: string };
  price: string;
  notes?: string;
  status: QuoteResponseStatus;
  createdAt: string;
}

export interface QuoteRequest {
  id: string;
  clientId: string;
  client?: { id: string; name: string };
  category: Category;
  district: string;
  description: string;
  photoUrls: string[];
  status: QuoteRequestStatus;
  createdAt: string;
  responses?: QuoteResponse[];
}

export interface ChecklistItem {
  label: string;
  checked: boolean;
}

export interface MilestoneEvidence {
  id: string;
  milestoneId: string;
  photoUrls: string[];
  notes?: string;
  checklistItems: ChecklistItem[];
  createdAt: string;
}

export type PaymentStatus = 'PENDING' | 'PAID';

export interface PaymentInfo {
  milestoneId: string;
  amount: string;
  paymentStatus: PaymentStatus;
  paymentIntentId: string | null;
  paidAt: string | null;
}

export interface Milestone {
  id: string;
  jobId: string;
  type: MilestoneType;
  percentage: number;
  amount: string;
  status: MilestoneStatus;
  paymentIntentId?: string | null;
  paidAt?: string | null;
  createdAt: string;
  evidence?: MilestoneEvidence | null;
}

export interface Job {
  id: string;
  clientId: string;
  contractorId: string;
  client: { id: string; name: string; phone: string };
  contractor: { id: string; name: string; phone: string };
  quoteResponse: { price: string; notes?: string };
  status: JobStatus;
  createdAt: string;
  milestones: Milestone[];
}

export interface ContractorProfileJob {
  id: string;
  category: Category;
  district: string;
  price: string;
  createdAt: string;
}

export interface ContractorProfile {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
  completedJobsCount: number;
  activeJobsCount: number;
  completedJobs: ContractorProfileJob[];
}

export interface AuthResponse {
  access_token: string;
  role: Role;
}
