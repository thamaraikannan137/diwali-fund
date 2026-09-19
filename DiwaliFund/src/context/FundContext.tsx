import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  CreateForm,
  DueBasis,
  Member,
  MemberForm,
  Membership,
  PayForm,
  Payment,
  Scheme,
  SchemeType,
  SheetKind,
} from '../types';
import { addMonthsISO, computeRows, inr, methodLabel, todayISO } from '../utils/fund';
import { apiErrorMessage, getToken } from '../api/client';
import {
  addMembershipsBulkApi,
  createMemberApi,
  createPaymentApi,
  createSchemeApi,
  deleteMemberApi,
  deletePaymentApi,
  deleteSchemeApi,
  fetchBootstrap,
  updateSchemeApi,
  loginRequest,
  logoutRequest,
  removeMembershipApi,
  updateMemberApi,
  updateMembershipUnitsApi,
  updatePaymentApi,
  type AuthUser,
} from '../api/fund';

type TabKey = 'home' | 'schemes' | 'collect' | 'members';

type FundState = {
  authenticated: boolean;
  booting: boolean;
  authBusy: boolean;
  user: AuthUser | null;
  tab: TabKey;
  members: Member[];
  schemes: Scheme[];
  ms: Membership[];
  payments: Payment[];
  filter: 'ALL' | SchemeType;
  mFilter: 'ALL' | 'DUE' | 'PAID';
  schemeId: string | null;
  memberId: string | null;
  msId: string | null;
  membershipOpen: boolean;
  summaryOpen: boolean;
  search: string;
  mSearch: string;
  addSearch: string;
  sheet: SheetKind;
  form: CreateForm;
  pay: PayForm;
  mf: MemberForm;
  sel: Record<string, number>;
  draftUnits: number | null;
  calOpen: boolean;
  toast: string | null;
  dueBasis: DueBasis;
};

type FundContextValue = FundState & {
  rows: ReturnType<typeof computeRows>;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  refreshing: boolean;
  goTab: (tab: TabKey) => void;
  setFilter: (f: FundState['filter']) => void;
  setMFilter: (f: FundState['mFilter']) => void;
  openScheme: (id: string) => void;
  closeScheme: () => void;
  openMember: (id: string) => void;
  closeMember: () => void;
  setSearch: (s: string) => void;
  setMSearch: (s: string) => void;
  setAddSearch: (s: string) => void;
  openSheet: (sheet: SheetKind, patch?: Partial<FundState>) => void;
  closeSheet: () => void;
  openMembership: (msId: string, extra?: Partial<FundState>) => void;
  closeMembership: () => void;
  openSummary: () => void;
  closeSummary: () => void;
  setForm: (patch: Partial<CreateForm>) => void;
  setPay: (patch: Partial<PayForm>) => void;
  setMf: (patch: Partial<MemberForm>) => void;
  setSel: (updater: (sel: Record<string, number>) => Record<string, number>) => void;
  setDraftUnits: (n: number | null) => void;
  toggleCal: () => void;
  createScheme: () => void;
  deleteScheme: () => void;
  deleteMember: (id?: string) => Promise<void>;
  addToScheme: () => void;
  savePayment: () => void;
  deletePayment: () => void;
  openEditPayment: (paymentId: string) => void;
  saveMember: () => void;
  confirmRemove: () => void;
  setUnits: (id: string, units: number) => void;
  showToast: (msg: string) => void;
};

const FundContext = createContext<FundContextValue | null>(null);

const defaultForm = (): CreateForm => {
  const start = todayISO();
  const months = 10;
  return {
    name: '',
    type: 'WEEKLY',
    amount: '',
    start,
    months: String(months),
    end: addMonthsISO(start, months),
  };
};

const defaultPay = (): PayForm => ({
  amount: '',
  method: 'GPAY',
  date: todayISO(),
});

const emptyData = {
  members: [] as Member[],
  schemes: [] as Scheme[],
  ms: [] as Membership[],
  payments: [] as Payment[],
};

export function FundProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FundState>({
    authenticated: false,
    booting: true,
    authBusy: false,
    user: null,
    tab: 'home',
    ...emptyData,
    filter: 'ALL',
    mFilter: 'ALL',
    schemeId: null,
    memberId: null,
    msId: null,
    membershipOpen: false,
    summaryOpen: false,
    search: '',
    mSearch: '',
    addSearch: '',
    sheet: null,
    form: defaultForm(),
    pay: defaultPay(),
    mf: { name: '', phone: '' },
    sel: {},
    draftUnits: null,
    calOpen: false,
    toast: null,
    dueBasis: 'to-date',
  });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const patch = useCallback((update: Partial<FundState> | ((s: FundState) => Partial<FundState>)) => {
    setState((s) => ({ ...s, ...(typeof update === 'function' ? update(s) : update) }));
  }, []);

  const showToast = useCallback(
    (msg: string) => {
      patch({ toast: msg });
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => patch({ toast: null }), 2200);
    },
    [patch],
  );

  const applyBootstrap = useCallback(
    async (user?: AuthUser | null) => {
      const data = await fetchBootstrap();
      patch({
        authenticated: true,
        booting: false,
        authBusy: false,
        ...(user ? { user } : {}),
        ...data,
        tab: 'home',
      });
    },
    [patch],
  );

  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await fetchBootstrap();
      patch({ ...data });
    } catch (err) {
      showToast(apiErrorMessage(err, 'Could not refresh'));
    } finally {
      setRefreshing(false);
    }
  }, [patch, showToast]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        if (!token) {
          if (!cancelled) patch({ booting: false, authenticated: false });
          return;
        }
        const data = await fetchBootstrap();
        if (cancelled) return;
        patch({
          authenticated: true,
          booting: false,
          ...data,
        });
      } catch {
        await logoutRequest();
        if (!cancelled) {
          patch({
            authenticated: false,
            booting: false,
            user: null,
            ...emptyData,
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [patch]);

  const rows = useMemo(
    () => computeRows(state.members, state.schemes, state.ms, state.payments, state.dueBasis),
    [state.members, state.schemes, state.ms, state.payments, state.dueBasis],
  );

  const login = useCallback(
    async (phone: string, password: string) => {
      patch({ authBusy: true });
      try {
        const { user } = await loginRequest(phone, password);
        await applyBootstrap(user);
        showToast('Welcome back');
      } catch (err) {
        patch({ authBusy: false });
        throw new Error(apiErrorMessage(err, 'Login failed'));
      }
    },
    [applyBootstrap, patch, showToast],
  );

  const logout = useCallback(async () => {
    await logoutRequest();
    patch({
      authenticated: false,
      user: null,
      tab: 'home',
      schemeId: null,
      memberId: null,
      msId: null,
      membershipOpen: false,
      summaryOpen: false,
      sheet: null,
      search: '',
      mSearch: '',
      ...emptyData,
    });
  }, [patch]);

  const value: FundContextValue = {
    ...state,
    rows,
    login,
    logout,
    refresh,
    refreshing,
    goTab: (tab) =>
      patch({
        tab,
        schemeId: null,
        memberId: null,
        search: '',
        msId: null,
        membershipOpen: false,
        summaryOpen: false,
      }),
    setFilter: (filter) => patch({ filter }),
    setMFilter: (mFilter) => patch({ mFilter }),
    openScheme: (schemeId) => patch({ schemeId, search: '' }),
    closeScheme: () => patch({ schemeId: null }),
    openMember: (memberId) => patch({ memberId }),
    closeMember: () => patch({ memberId: null }),
    setSearch: (search) => patch({ search }),
    setMSearch: (mSearch) => patch({ mSearch }),
    setAddSearch: (addSearch) => patch({ addSearch }),
    openSheet: (sheet, extra) => patch({ sheet, ...(extra || {}) }),
    closeSheet: () => patch({ sheet: null, pay: defaultPay() }),
    openMembership: (msId, extra) =>
      patch({
        msId,
        membershipOpen: true,
        draftUnits: null,
        calOpen: false,
        sheet: null,
        ...(extra || {}),
      }),
    closeMembership: () =>
      patch({
        msId: null,
        membershipOpen: false,
        draftUnits: null,
        calOpen: false,
        sheet: null,
      }),
    openSummary: () => patch({ summaryOpen: true, tab: 'home' }),
    closeSummary: () => patch({ summaryOpen: false }),
    setForm: (p) => patch((s) => ({ form: { ...s.form, ...p } })),
    setPay: (p) => patch((s) => ({ pay: { ...s.pay, ...p } })),
    setMf: (p) => patch((s) => ({ mf: { ...s.mf, ...p } })),
    setSel: (updater) => patch((s) => ({ sel: updater(s.sel) })),
    setDraftUnits: (draftUnits) => patch({ draftUnits }),
    toggleCal: () => patch((s) => ({ calOpen: !s.calOpen })),
    createScheme: () => {
      void (async () => {
        try {
          const f = state.form;
          const payload = {
            name: f.name.trim(),
            type: f.type,
            unit: Number(f.amount),
            start: f.start,
            end: f.end,
          };
          if (f.id) {
            const existing = state.schemes.find((s) => s.id === f.id);
            const scheme = await updateSchemeApi(f.id, {
              ...payload,
              color: existing?.color,
            });
            patch({
              schemes: state.schemes.map((s) => (s.id === scheme.id ? scheme : s)),
              sheet: null,
              form: defaultForm(),
            });
            showToast('Scheme updated');
            return;
          }
          const scheme = await createSchemeApi(payload);
          patch({
            schemes: [...state.schemes, scheme],
            sheet: null,
            form: defaultForm(),
            filter: 'ALL',
          });
          showToast('Scheme created');
        } catch (err) {
          showToast(apiErrorMessage(err, 'Could not save scheme'));
        }
      })();
    },
    deleteScheme: () => {
      void (async () => {
        try {
          const id = state.schemeId;
          if (!id) return;
          const msIds = new Set(state.ms.filter((m) => m.schemeId === id).map((m) => m.id));
          await deleteSchemeApi(id);
          patch({
            schemes: state.schemes.filter((s) => s.id !== id),
            ms: state.ms.filter((m) => m.schemeId !== id),
            payments: state.payments.filter((p) => !msIds.has(p.msId)),
            schemeId: null,
            membershipOpen: false,
            msId: null,
            sheet: null,
          });
          showToast('Scheme deleted');
        } catch (err) {
          showToast(apiErrorMessage(err, 'Could not delete scheme'));
        }
      })();
    },
    deleteMember: async (idArg) => {
      try {
        const id = idArg || state.memberId;
        if (!id) {
          showToast('No member selected');
          return;
        }
        const msIds = new Set(state.ms.filter((m) => m.memberId === id).map((m) => m.id));
        await deleteMemberApi(id);
        patch({
          members: state.members.filter((m) => m.id !== id),
          ms: state.ms.filter((m) => m.memberId !== id),
          payments: state.payments.filter((p) => !msIds.has(p.msId)),
          memberId: null,
          membershipOpen: false,
          msId: null,
          sheet: null,
        });
        showToast('Member deleted');
      } catch (err) {
        showToast(apiErrorMessage(err, 'Could not delete member'));
        throw err;
      }
    },
    addToScheme: () => {
      void (async () => {
        try {
          if (!state.schemeId) return;
          const items = Object.entries(state.sel).map(([memberId, units]) => ({
            memberId,
            units,
          }));
          if (!items.length) return;
          const added = await addMembershipsBulkApi(state.schemeId, items);
          patch({
            ms: [...state.ms, ...added],
            sheet: null,
            sel: {},
          });
          showToast(added.length + (added.length > 1 ? ' members added' : ' member added'));
        } catch (err) {
          showToast(apiErrorMessage(err, 'Could not add members'));
        }
      })();
    },
    savePayment: () => {
      void (async () => {
        try {
          const amt = Number(state.pay.amount);
          if (!(amt > 0) || !state.msId) return;
          const method = state.pay.method || 'GPAY';
          const date = state.pay.date || todayISO();
          if (state.pay.id) {
            const updated = await updatePaymentApi(state.pay.id, { amount: amt, date, method });
            patch({
              payments: state.payments.map((p) => (p.id === updated.id ? updated : p)),
              sheet: null,
              pay: defaultPay(),
            });
            showToast(`${inr(amt)} updated`);
            return;
          }
          const created = await createPaymentApi({
            msId: state.msId,
            amount: amt,
            date,
            method,
          });
          patch({
            payments: [...state.payments, created],
            sheet: null,
            pay: defaultPay(),
          });
          showToast(`${inr(amt)} saved via ${methodLabel(method)}`);
        } catch (err) {
          showToast(apiErrorMessage(err, 'Could not save payment'));
        }
      })();
    },
    deletePayment: () => {
      void (async () => {
        try {
          if (!state.pay.id) return;
          const id = state.pay.id;
          await deletePaymentApi(id);
          patch({
            payments: state.payments.filter((p) => p.id !== id),
            sheet: null,
            pay: defaultPay(),
          });
          showToast('Payment deleted');
        } catch (err) {
          showToast(apiErrorMessage(err, 'Could not delete payment'));
        }
      })();
    },
    openEditPayment: (paymentId) => {
      setState((s) => {
        const p = s.payments.find((x) => x.id === paymentId);
        if (!p) return s;
        return {
          ...s,
          msId: p.msId,
          sheet: 'pay',
          pay: {
            id: p.id,
            amount: String(Math.round(p.amount)),
            method: p.method,
            date: p.date,
          },
        };
      });
    },
    saveMember: () => {
      void (async () => {
        try {
          const f = state.mf;
          const phone = (f.phone || '').replace(/\D/g, '');
          const name = f.name.trim();
          if (f.id) {
            const updated = await updateMemberApi(f.id, { name, phone });
            patch({
              members: state.members.map((m) => (m.id === updated.id ? updated : m)),
              sheet: null,
            });
            showToast('Member updated');
            return;
          }
          const created = await createMemberApi({ name, phone });
          patch({
            members: [...state.members, created],
            sheet: null,
            memberId: created.id,
          });
          showToast(name + ' added');
        } catch (err) {
          showToast(apiErrorMessage(err, 'Could not save member'));
        }
      })();
    },
    confirmRemove: () => {
      void (async () => {
        try {
          if (!state.msId) return;
          const id = state.msId;
          await removeMembershipApi(id);
          patch({
            ms: state.ms.filter((x) => x.id !== id),
            payments: state.payments.filter((p) => p.msId !== id),
            sheet: null,
            msId: null,
            membershipOpen: false,
          });
          showToast('Member removed from scheme');
        } catch (err) {
          showToast(apiErrorMessage(err, 'Could not remove membership'));
        }
      })();
    },
    setUnits: (id, units) => {
      void (async () => {
        try {
          const updated = await updateMembershipUnitsApi(id, units);
          patch((s) => ({
            ms: s.ms.map((x) => (x.id === id ? updated : x)),
          }));
        } catch (err) {
          showToast(apiErrorMessage(err, 'Could not update units'));
        }
      })();
    },
    showToast,
  };

  return <FundContext.Provider value={value}>{children}</FundContext.Provider>;
}

export function useFund() {
  const ctx = useContext(FundContext);
  if (!ctx) throw new Error('useFund must be used within FundProvider');
  return ctx;
}
