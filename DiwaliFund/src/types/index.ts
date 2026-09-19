export type SchemeType = 'WEEKLY' | 'MONTHLY';
export type PayMethod = 'CASH' | 'GPAY';
export type DueBasis = 'to-date' | 'full';

export type Member = {
  id: string;
  name: string;
  phone: string;
};

export type Scheme = {
  id: string;
  name: string;
  type: SchemeType;
  unit: number;
  start: string;
  end: string;
  color: string;
};

export type Membership = {
  id: string;
  memberId: string;
  schemeId: string;
  units: number;
};

export type Payment = {
  id: string;
  msId: string;
  amount: number;
  date: string;
  method: PayMethod;
};

export type PeriodInfo = {
  total: number;
  elapsed: number;
};

export type ComputedRow = Membership & {
  s: Scheme;
  m: Member;
  paid: number;
  target: number;
  expected: number;
  per: PeriodInfo;
  inst: number;
  paidPeriods: number;
  duePeriods: number;
  due: number;
  pn: 'week' | 'month';
};

export type SheetKind =
  | 'create'
  | 'add'
  | 'member'
  | 'pay'
  | 'confirm'
  | 'memberForm'
  | null;

export type CreateForm = {
  id?: string;
  name: string;
  type: SchemeType;
  amount: string;
  start: string;
  end: string;
  /** Duration in calendar months (UI helper; end is derived when this changes). */
  months: string;
};

export type PayForm = {
  id?: string;
  amount: string;
  method: PayMethod;
  date: string;
};

export type MemberForm = {
  id?: string;
  name: string;
  phone: string;
};
