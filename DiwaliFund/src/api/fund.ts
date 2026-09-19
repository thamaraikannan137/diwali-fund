import type { Member, Membership, PayMethod, Payment, Scheme, SchemeType } from '../types';
import { api, clearToken, saveToken } from './client';

export type AuthUser = { id: string; name: string; phone: string };

export type BootstrapData = {
  members: Member[];
  schemes: Scheme[];
  ms: Membership[];
  payments: Payment[];
};

function pickMember(m: Member): Member {
  return { id: m.id, name: m.name, phone: m.phone };
}

function pickScheme(s: Scheme): Scheme {
  return {
    id: s.id,
    name: s.name,
    type: s.type,
    unit: s.unit,
    start: s.start,
    end: s.end,
    color: s.color,
  };
}

function pickMembership(m: Membership): Membership {
  return {
    id: m.id,
    memberId: m.memberId,
    schemeId: m.schemeId,
    units: m.units,
  };
}

function pickPayment(p: Payment): Payment {
  return {
    id: p.id,
    msId: p.msId,
    amount: p.amount,
    date: p.date,
    method: p.method,
  };
}

export async function loginRequest(phone: string, password: string) {
  const { data } = await api.post<{ token: string; user: AuthUser }>('/auth/login', {
    phone,
    password,
  });
  await saveToken(data.token);
  return data;
}

export async function logoutRequest() {
  await clearToken();
}

export async function fetchBootstrap(): Promise<BootstrapData> {
  const { data } = await api.get<BootstrapData>('/bootstrap');
  return {
    members: (data.members || []).map(pickMember),
    schemes: (data.schemes || []).map(pickScheme),
    ms: (data.ms || []).map(pickMembership),
    payments: (data.payments || []).map(pickPayment),
  };
}

export async function createSchemeApi(input: {
  name: string;
  type: SchemeType;
  unit: number;
  start: string;
  end: string;
}) {
  const { data } = await api.post<Scheme>('/schemes', input);
  return pickScheme(data);
}

export async function updateSchemeApi(
  id: string,
  input: {
    name: string;
    type: SchemeType;
    unit: number;
    start: string;
    end: string;
    color?: string;
  },
) {
  const { data } = await api.put<Scheme>(`/schemes/${id}`, input);
  return pickScheme(data);
}

export async function deleteSchemeApi(id: string) {
  await api.delete(`/schemes/${id}`);
}

export async function createMemberApi(input: { name: string; phone: string }) {
  const { data } = await api.post<Member>('/members', input);
  return pickMember(data);
}

export async function updateMemberApi(id: string, input: { name: string; phone: string }) {
  const { data } = await api.put<Member>(`/members/${id}`, input);
  return pickMember(data);
}

export async function deleteMemberApi(id: string) {
  await api.delete(`/members/${id}`);
}

export async function addMembershipsBulkApi(
  schemeId: string,
  items: { memberId: string; units: number }[],
) {
  const { data } = await api.post<Membership[]>('/memberships/bulk', { schemeId, items });
  return data.map(pickMembership);
}

export async function updateMembershipUnitsApi(id: string, units: number) {
  const { data } = await api.patch<Membership>(`/memberships/${id}/units`, { units });
  return pickMembership(data);
}

export async function removeMembershipApi(id: string) {
  await api.delete(`/memberships/${id}`);
}

export async function createPaymentApi(input: {
  msId: string;
  amount: number;
  date: string;
  method: PayMethod;
}) {
  const { data } = await api.post<Payment>('/payments', input);
  return pickPayment(data);
}

export async function updatePaymentApi(
  id: string,
  input: { amount?: number; date?: string; method?: PayMethod },
) {
  const { data } = await api.put<Payment>(`/payments/${id}`, input);
  return pickPayment(data);
}

export async function deletePaymentApi(id: string) {
  await api.delete(`/payments/${id}`);
}
