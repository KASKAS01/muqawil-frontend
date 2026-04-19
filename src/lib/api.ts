import axios from 'axios';
import { getToken, clearToken } from './auth';
import type { AuthResponse, QuoteRequest, QuoteResponse, Job, Milestone, MilestoneEvidence, PaymentInfo, ContractorProfile } from '@/types/api';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      clearToken();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export const usersApi = {
  getContractorProfile: (id: string) =>
    api.get<ContractorProfile>(`/users/contractors/${id}`).then((r) => r.data),
};

export const authApi = {
  register: (data: { name: string; email: string; password: string; phone: string; role: string }) =>
    api.post<AuthResponse>('/auth/register', data).then((r) => r.data),
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data),
  me: () => api.get('/users/me').then((r) => r.data),
};

export const quotesApi = {
  create: (data: {
    category: string;
    district: string;
    description: string;
    photoUrls?: string[];
  }) => api.post<QuoteRequest>('/quotes', data).then((r) => r.data),
  listOpen: () => api.get<QuoteRequest[]>('/quotes').then((r) => r.data),
  listMine: () => api.get<QuoteRequest[]>('/quotes/mine').then((r) => r.data),
  get: (id: string) => api.get<QuoteRequest>(`/quotes/${id}`).then((r) => r.data),
  respond: (id: string, data: { price: number; notes?: string }) =>
    api.post<QuoteResponse>(`/quotes/${id}/respond`, data).then((r) => r.data),
  hire: (quoteId: string, responseId: string) =>
    api.post<Job>(`/quotes/${quoteId}/hire/${responseId}`).then((r) => r.data),
};

export const jobsApi = {
  list: () => api.get<Job[]>('/jobs').then((r) => r.data),
  get: (id: string) => api.get<Job>(`/jobs/${id}`).then((r) => r.data),
};

export const milestonesApi = {
  submitEvidence: (
    id: string,
    data: { photoUrls: string[]; notes?: string; checklistItems?: { label: string; checked: boolean }[] },
  ) => api.post<Milestone>(`/milestones/${id}/evidence`, data).then((r) => r.data),
  getEvidence: (id: string) =>
    api.get<MilestoneEvidence | null>(`/milestones/${id}/evidence`).then((r) => r.data),
  approve: (id: string) =>
    api.post<Milestone>(`/milestones/${id}/approve`).then((r) => r.data),
  reject: (id: string) =>
    api.post<Milestone>(`/milestones/${id}/reject`).then((r) => r.data),
};

export const paymentsApi = {
  pay: (milestoneId: string) =>
    api.post<PaymentInfo>(`/payments/milestones/${milestoneId}/pay`).then((r) => r.data),
  getStatus: (milestoneId: string) =>
    api.get<PaymentInfo>(`/payments/milestones/${milestoneId}`).then((r) => r.data),
};

export default api;
