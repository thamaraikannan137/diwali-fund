import type {
  ComputedRow,
  DueBasis,
  Member,
  Membership,
  PayMethod,
  Payment,
  PeriodInfo,
  Scheme,
  SchemeType,
} from '../types';

export function parseLocalDate(iso: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d, 12, 0, 0, 0);
  }
  return new Date(iso);
}

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** True when today is on/after the scheme start date (local). */
export function hasSchemeStarted(s: Pick<Scheme, 'start'>, now = new Date()): boolean {
  return startOfLocalDay(now) >= startOfLocalDay(parseLocalDate(s.start));
}

export function periods(s: Pick<Scheme, 'type' | 'start' | 'end'>, now = new Date()): PeriodInfo {
  const st = parseLocalDate(s.start);
  const en = parseLocalDate(s.end);
  let total: number;
  let elapsed: number;

  if (s.type === 'WEEKLY') {
    total = Math.round((en.getTime() - st.getTime()) / 6048e5);
    elapsed = Math.floor((now.getTime() - st.getTime()) / 6048e5) + 1;
  } else {
    total =
      (en.getFullYear() - st.getFullYear()) * 12 + en.getMonth() - st.getMonth() + 1;
    elapsed =
      (now.getFullYear() - st.getFullYear()) * 12 + now.getMonth() - st.getMonth() + 1;
  }

  total = Math.max(1, total);

  // Not started yet — no periods due
  if (!hasSchemeStarted(s, now)) {
    return { total, elapsed: 0 };
  }

  return { total, elapsed: Math.max(0, Math.min(total, elapsed)) };
}

export function inr(n: number): string {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

export function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

export function initials(n: string): string {
  const p = n.split(' ');
  return (p[0][0] + (p[1] ? p[1][0] : '')).toUpperCase();
}

export function avatar(i: number): string {
  return ['#1D4ED8', '#7C3AED', '#0891B2', '#DB2777', '#059669', '#C9822A'][i % 6];
}

export function methodColor(m: PayMethod): string {
  return m === 'GPAY' ? '#1D4ED8' : '#059669';
}

export function methodLabel(m: PayMethod): string {
  return m === 'GPAY' ? 'GPay' : 'Cash';
}

export function greeting(now = new Date()): string {
  const h = now.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function todayISO(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function computeRows(
  members: Member[],
  schemes: Scheme[],
  ms: Membership[],
  payments: Payment[],
  dueBasis: DueBasis = 'to-date',
): ComputedRow[] {
  const sMap = Object.fromEntries(schemes.map((s) => [s.id, s]));
  const mMap = Object.fromEntries(members.map((m) => [m.id, m]));
  return ms.map((x) => {
    const s = sMap[x.schemeId];
    const m = mMap[x.memberId];
    const per = periods(s);
    const paid = payments.filter((p) => p.msId === x.id).reduce((a, p) => a + p.amount, 0);
    const target = s.unit * x.units * per.total;
    const expected = s.unit * x.units * (dueBasis === 'full' ? per.total : per.elapsed);
    const inst = s.unit * x.units;
    const paidPeriods = inst ? Math.floor(paid / inst) : 0;
    const duePeriods = Math.max(0, (dueBasis === 'full' ? per.total : per.elapsed) - paidPeriods);
    return {
      ...x,
      s,
      m,
      paid,
      target,
      expected,
      per,
      inst,
      paidPeriods,
      duePeriods,
      due: Math.max(0, expected - paid),
      pn: s.type === 'WEEKLY' ? 'week' : 'month',
    };
  });
}

export function schemeStats(s: Scheme, rows: ComputedRow[]) {
  const rs = rows.filter((r) => r.schemeId === s.id);
  const collected = rs.reduce((a, r) => a + r.paid, 0);
  const pending = rs.reduce((a, r) => a + r.due, 0);
  const target = rs.reduce((a, r) => a + r.target, 0);
  const pct = target ? Math.round((collected / target) * 100) : 0;
  const per = periods(s);
  const circ = 2 * Math.PI * 30;
  return {
    ...s,
    typeLabel: s.type === 'WEEKLY' ? 'Weekly' : 'Monthly',
    memberCount: rs.length,
    collected,
    pending,
    target,
    collectedLabel: inr(collected),
    pendingLabel: inr(pending),
    targetLabel: inr(target),
    pct,
    pctLabel: pct + '%',
    dash: circ,
    dashOffset: circ * (1 - pct / 100),
    rate: inr(s.unit) + (s.type === 'WEEKLY' ? ' / week' : ' / month'),
    period: !hasSchemeStarted(s)
      ? 'Not started'
      : per.elapsed + ' of ' + per.total + (s.type === 'WEEKLY' ? ' weeks' : ' months'),
    started: hasSchemeStarted(s),
  };
}

export function memberStatus(r: ComputedRow) {
  if (!hasSchemeStarted(r.s) || r.per.elapsed === 0) {
    return { text: 'Not started', color: '#94A3B8' };
  }
  if (r.duePeriods === 0) {
    return { text: '✓ Paid up', color: '#059669' };
  }
  if (r.duePeriods === 1) {
    return { text: `This ${r.pn} · ${inr(r.due)}`, color: '#B45309' };
  }
  return { text: `${r.duePeriods} ${r.pn}s · ${inr(r.due)}`, color: '#DC2626' };
}

export function createHint(form: {
  type?: SchemeType;
  amount?: string;
  start?: string;
  end?: string;
}): string {
  const amt = Number(form.amount) || 0;
  if (
    form.type &&
    amt &&
    form.start &&
    form.end &&
    new Date(form.end) > new Date(form.start)
  ) {
    const per = periods({ type: form.type, start: form.start, end: form.end });
    return (
      per.total +
      (form.type === 'WEEKLY' ? ' weeks' : ' months') +
      ' · ' +
      inr(amt * per.total) +
      ' per unit'
    );
  }
  return 'Enter a name, amount and dates to see the target per unit.';
}

export type CalCell = {
  n: number;
  day: string;
  title: string;
  bg: string;
  fg: string;
  borderColor: string;
  paid: boolean;
  past: boolean;
  now: boolean;
  mkey: string;
  mlabel: string;
};

export function calendarCells(cur: ComputedRow): CalCell[] {
  return Array.from({ length: cur.per.total }, (_, i) => {
    const n = i + 1;
    const paid = n <= cur.paidPeriods;
    const isNow = n === cur.per.elapsed;
    const past = n < cur.per.elapsed && !paid;
    const d = new Date(cur.s.start);
    if (cur.s.type === 'WEEKLY') d.setDate(d.getDate() + i * 7);
    else d.setMonth(d.getMonth() + i);
    return {
      n,
      paid,
      now: isNow,
      past,
      day:
        cur.s.type === 'WEEKLY'
          ? String(d.getDate())
          : d.toLocaleDateString('en-IN', { month: 'short' }),
      mkey: d.getFullYear() + '-' + d.getMonth(),
      mlabel:
        cur.s.type === 'WEEKLY'
          ? d.toLocaleDateString('en-IN', { month: 'short' })
          : String(d.getFullYear()),
      title: `${cur.pn} ${n} · ${fmtDate(d.toISOString().slice(0, 10))}`,
      bg: paid ? '#059669' : past ? '#FEF2F2' : isNow ? '#FFF8EB' : '#F4F5F8',
      fg: paid ? '#fff' : past ? '#B91C1C' : isNow ? '#B45309' : '#94A3B8',
      borderColor: paid ? '#059669' : isNow ? '#E9A23B' : past ? '#FECACA' : '#EDEFF3',
    };
  });
}

export function groupCalendar(cur: ComputedRow) {
  const cells = calendarCells(cur);
  const g: { key: string; label: string; cells: CalCell[]; summary: string }[] = [];
  cells.forEach((c) => {
    const k = cur.s.type === 'WEEKLY' ? c.mkey : 'all';
    let m = g.find((x) => x.key === k);
    if (!m) {
      m = { key: k, label: cur.s.type === 'WEEKLY' ? c.mlabel : '', cells: [], summary: '' };
      g.push(m);
    }
    m.cells.push(c);
  });
  g.forEach((m) => {
    const p = m.cells.filter((c) => c.paid).length;
    const miss = m.cells.filter((c) => c.past).length;
    m.summary = p === m.cells.length ? 'Paid' : miss ? miss + ' missed' : p + '/' + m.cells.length;
  });
  return g;
}
