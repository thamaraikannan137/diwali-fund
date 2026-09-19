import React, { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFund } from '../context/FundContext';
import { SoftButton, Screen } from '../components/ui';
import { colors } from '../theme/colors';
import {
  fmtDate,
  initials,
  inr,
  memberStatus,
  methodColor,
  methodLabel,
} from '../utils/fund';

export function MemberDetailScreen() {
  const insets = useSafeAreaInsets();
  const {
    members,
    rows,
    payments,
    memberId,
    closeMember,
    openSheet,
    openMembership,
    openEditPayment,
  } = useFund();

  const member = members.find((m) => m.id === memberId);
  const rs = useMemo(
    () => rows.filter((r) => r.memberId === memberId),
    [rows, memberId],
  );
  const paid = rs.reduce((a, r) => a + r.paid, 0);
  const due = rs.reduce((a, r) => a + r.due, 0);
  const dueSchemes = rs.filter((r) => r.due > 0).length;

  const history = useMemo(
    () =>
      payments
        .filter((p) => rs.some((r) => r.id === p.msId))
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((p) => {
          const r = rs.find((x) => x.id === p.msId)!;
          return {
            id: p.id,
            scheme: r.s.name,
            color: r.s.color,
            date: fmtDate(p.date),
            amount: inr(p.amount),
            method: methodLabel(p.method),
            methodColor: methodColor(p.method),
          };
        }),
    [payments, rs],
  );

  if (!member) return null;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="rounded-b-[28px] bg-white px-5 pb-5"
          style={{ paddingTop: insets.top + 8 }}
        >
          <View className="flex-row items-center gap-2.5">
            <Pressable
              className="-ml-1.5 h-10 w-10 items-center justify-center rounded-[13px] bg-hair"
              onPress={closeMember}
            >
              <Ionicons name="chevron-back" size={20} color={colors.ink} />
            </Pressable>
            <View className="h-11 w-11 items-center justify-center rounded-[15px] bg-brand-soft">
              <Text className="text-[15px] font-bold text-brand">{initials(member.name)}</Text>
            </View>
            <View className="min-w-0 flex-1">
              <Text className="text-xl font-bold text-ink">{member.name}</Text>
              <Text className="text-[13px] text-muted">{member.phone}</Text>
            </View>
            <SoftButton
              label="Edit"
              onPress={() =>
                openSheet('memberForm', {
                  mf: { id: member.id, name: member.name, phone: member.phone },
                })
              }
              className="h-9 rounded-sm px-3.5"
            />
          </View>
          <View className="mt-[18px] flex-row gap-3">
            <View className="flex-1 rounded-xl bg-bg px-4 py-3.5">
              <Text className="text-2xl font-bold tracking-tight text-ink">{inr(paid)}</Text>
              <Text className="mt-0.5 text-[12.5px] text-muted">Total paid</Text>
            </View>
            <View
              className={`flex-1 rounded-xl px-4 py-3.5 ${due > 0 ? 'bg-danger-soft' : 'bg-success-soft'}`}
            >
              <Text
                className={`text-2xl font-bold tracking-tight ${due > 0 ? 'text-danger' : 'text-success'}`}
              >
                {inr(due)}
              </Text>
              <Text className="mt-0.5 text-[12.5px] text-muted">
                {due > 0
                  ? `Due across ${dueSchemes} scheme${dueSchemes > 1 ? 's' : ''}`
                  : 'All paid up'}
              </Text>
            </View>
          </View>
        </View>

        <View className="gap-3 px-5 pt-5">
          <Text className="text-base font-semibold text-ink">Schemes</Text>
          <View className="gap-2.5">
            {rs.map((r) => {
              const st = memberStatus(r);
              return (
                <Pressable
                  key={r.id}
                  className="flex-row overflow-hidden rounded-2xl border border-soft bg-white"
                  onPress={() => openMembership(r.id, { schemeId: r.schemeId })}
                >
                  <View className="w-1.5" style={{ backgroundColor: r.s.color }} />
                  <View className="flex-1 flex-row items-center gap-3 px-4 py-3.5">
                    <View className="min-w-0 flex-1">
                      <Text className="text-[15.5px] font-bold text-ink">{r.s.name}</Text>
                      <Text className="mt-0.5 text-[12.5px] text-muted">
                        {r.units}
                        {r.units > 1 ? ' units' : ' unit'} · {inr(r.inst)} / {r.pn}
                      </Text>
                    </View>
                    <View className="items-end gap-1">
                      <Text className="text-[15px] font-bold text-ink">
                        {r.paidPeriods}/{r.per.total}{' '}
                        <Text className="text-[11.5px] font-medium text-faint">{r.pn}s</Text>
                      </Text>
                      <Text className="text-[12.5px] font-semibold" style={{ color: st.color }}>
                        {st.text}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
            {rs.length === 0 ? (
              <View className="items-center rounded-2xl border border-dashed border-border bg-white p-6">
                <Text className="text-sm text-faint">Not in any scheme yet</Text>
              </View>
            ) : null}
          </View>

          <Text className="mt-2 text-base font-semibold text-ink">Payment history</Text>
          <Text className="-mt-1.5 text-[12.5px] text-faint">Tap a payment to edit</Text>
          <View className="overflow-hidden rounded-2xl border border-soft bg-white">
            {history.map((h, i) => (
              <Pressable
                key={h.id}
                onPress={() => openEditPayment(h.id)}
                className={`flex-row items-center gap-3 px-4 py-3 ${
                  i < history.length - 1 ? 'border-b border-hair' : ''
                }`}
              >
                <View className="h-2 w-2 rounded-full" style={{ backgroundColor: h.color }} />
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-ink">{h.scheme}</Text>
                  <Text className="text-xs text-muted">{h.date}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-[14.5px] font-bold text-ink">{h.amount}</Text>
                  <Text className="text-[11.5px] font-semibold" style={{ color: h.methodColor }}>
                    {h.method}
                  </Text>
                </View>
              </Pressable>
            ))}
            {history.length === 0 ? (
              <Text className="p-6 text-center text-sm text-faint">No payments yet</Text>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
