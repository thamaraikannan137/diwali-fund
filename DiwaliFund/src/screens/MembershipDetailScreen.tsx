import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton, SoftButton, Screen } from '../components/ui';
import { useFund } from '../context/FundContext';
import { colors } from '../theme/colors';
import {
  fmtDate,
  groupCalendar,
  inr,
  methodLabel,
  todayISO,
} from '../utils/fund';

export function MembershipDetailScreen() {
  const insets = useSafeAreaInsets();
  const {
    rows,
    payments,
    msId,
    draftUnits,
    setDraftUnits,
    calOpen,
    toggleCal,
    setUnits,
    openSheet,
    closeMembership,
    showToast,
    openEditPayment,
  } = useFund();
  const cur = rows.find((r) => r.id === msId);

  if (!cur) return null;

  const history = payments
    .filter((p) => p.msId === cur.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const months = groupCalendar(cur);
  const editing = draftUnits != null;
  const progressPct = Math.min(
    100,
    Math.round((cur.paidPeriods / Math.max(1, cur.per.total)) * 100),
  );
  const notStarted = cur.per.elapsed === 0;
  const upToDate = !notStarted && cur.duePeriods === 0;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 110,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <View className="mb-6 flex-row items-center">
          <Pressable
            onPress={closeMembership}
            hitSlop={10}
            style={{
              height: 40,
              width: 40,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 13,
              backgroundColor: colors.white,
            }}
          >
            <Ionicons name="chevron-back" size={20} color={colors.ink} />
          </Pressable>
          <Text
            className="ml-3 flex-1 text-[13px] font-medium text-muted"
            numberOfLines={1}
          >
            {cur.s.name.replace(/^Diwali\s+/i, '')}
          </Text>
        </View>

        {/* Person */}
        <Text className="text-[28px] font-bold tracking-tight text-ink">{cur.m.name}</Text>
        <Text className="mt-1 text-[14px] text-muted">{cur.m.phone}</Text>

        {/* Due / paid focus */}
        <View className="mt-8">
          {notStarted ? (
            <>
              <Text className="text-[13px] font-medium text-muted">Status</Text>
              <Text className="mt-1 text-[36px] font-bold tracking-tight text-ink">
                Not started
              </Text>
              <Text className="mt-1.5 text-[14px] text-muted">
                Starts {cur.s.start} · target {inr(cur.target)}
              </Text>
            </>
          ) : upToDate ? (
            <>
              <Text className="text-[13px] font-medium text-muted">Paid so far</Text>
              <Text className="mt-1 text-[36px] font-bold tracking-tight text-ink">
                {inr(cur.paid)}
              </Text>
              <Text className="mt-1.5 text-[14px] text-muted">
                of {inr(cur.target)} · paid up
              </Text>
            </>
          ) : (
            <>
              <Text className="text-[13px] font-medium text-muted">Due now</Text>
              <Text className="mt-1 text-[36px] font-bold tracking-tight text-danger">
                {inr(cur.due)}
              </Text>
              <Text className="mt-1.5 text-[14px] text-muted">
                {cur.duePeriods} {cur.pn}
                {cur.duePeriods > 1 ? 's' : ''} behind · {inr(cur.paid)} paid of {inr(cur.target)}
              </Text>
            </>
          )}
        </View>

        {/* Quiet progress */}
        <View className="mt-6">
          <View className="h-1.5 overflow-hidden rounded-full bg-mutedbg">
            <View
              className="h-full rounded-full"
              style={{
                width: `${progressPct}%`,
                backgroundColor: upToDate ? colors.green : cur.s.color,
              }}
            />
          </View>
          <Text className="mt-2 text-[13px] text-muted">
            {cur.paidPeriods} of {cur.per.total} {cur.pn}s · {progressPct}%
          </Text>
        </View>

        {/* Rate + units — one quiet row */}
        <View className="mt-8 flex-row items-center justify-between border-t border-hair pt-5">
          <View>
            <Text className="text-[13px] text-muted">
              {inr(cur.inst)} / {cur.pn}
            </Text>
            {!editing ? (
              <Text className="mt-0.5 text-[15px] font-semibold text-ink">
                {cur.units} unit{cur.units > 1 ? 's' : ''}
              </Text>
            ) : (
              <View className="mt-2 flex-row items-center gap-3">
                <Pressable
                  onPress={() => setDraftUnits(Math.max(1, (draftUnits || 1) - 1))}
                  style={stepBtn}
                >
                  <Text className="text-lg font-semibold text-ink">−</Text>
                </Pressable>
                <Text className="min-w-[28px] text-center text-lg font-bold text-ink">
                  {draftUnits}
                </Text>
                <Pressable
                  onPress={() => setDraftUnits((draftUnits || 1) + 1)}
                  style={stepBtn}
                >
                  <Text className="text-lg font-semibold text-ink">+</Text>
                </Pressable>
              </View>
            )}
          </View>
          {!editing ? (
            <Pressable onPress={() => setDraftUnits(cur.units)} hitSlop={10}>
              <Text className="text-[14px] font-semibold text-brand">Edit units</Text>
            </Pressable>
          ) : (
            <View className="flex-row gap-2">
              <SoftButton
                label="Cancel"
                onPress={() => setDraftUnits(null)}
                style={{ height: 40, paddingHorizontal: 14 }}
              />
              <PrimaryButton
                label="Save"
                disabled={draftUnits === cur.units}
                onPress={() => {
                  setUnits(cur.id, draftUnits!);
                  setDraftUnits(null);
                  showToast('Units updated to ' + draftUnits);
                }}
                style={{ height: 40, paddingHorizontal: 16 }}
              />
            </View>
          )}
        </View>

        {/* Calendar toggle */}
        <Pressable
          onPress={toggleCal}
          className="mt-6 flex-row items-center justify-between border-t border-hair py-4"
        >
          <Text className="text-[15px] font-semibold text-ink">Calendar</Text>
          <Ionicons
            name={calOpen ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.faint}
          />
        </Pressable>

        {calOpen ? (
          <View className="mb-2 gap-4 pb-2">
            {months.map((mo) => (
              <View key={mo.key} className="gap-2">
                {(mo.label || mo.summary) && (
                  <View className="flex-row items-center justify-between">
                    {mo.label ? (
                      <Text className="text-[12px] font-semibold text-muted">{mo.label}</Text>
                    ) : (
                      <View />
                    )}
                    <Text className="text-[12px] text-faint">{mo.summary}</Text>
                  </View>
                )}
                <View className="flex-row flex-wrap gap-1.5">
                  {mo.cells.map((c) => (
                    <View
                      key={c.n}
                      className="h-9 w-10 items-center justify-center rounded-md"
                      style={{ backgroundColor: c.bg }}
                    >
                      <Text style={{ color: c.fg }} className="text-[12px] font-bold">
                        {c.day}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
            <Text className="text-[12px] text-faint">
              Green paid · Red missed · Amber current · Grey upcoming
            </Text>
          </View>
        ) : null}

        {/* History */}
        <View className="border-t border-hair pt-4">
          <Text className="mb-3 text-[15px] font-semibold text-ink">Payments</Text>
          {history.length === 0 ? (
            <Text className="py-4 text-[14px] text-faint">No payments yet</Text>
          ) : (
            history.map((h, i) => (
              <Pressable
                key={h.id}
                onPress={() => openEditPayment(h.id)}
                className={`flex-row items-center justify-between py-3.5 ${
                  i < history.length - 1 ? 'border-b border-hair' : ''
                }`}
              >
                <View>
                  <Text className="text-[15px] font-semibold text-ink">{inr(h.amount)}</Text>
                  <Text className="mt-0.5 text-[12px] text-muted">{fmtDate(h.date)}</Text>
                </View>
                <Text className="text-[13px] text-muted">{methodLabel(h.method)}</Text>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 border-t border-soft bg-bg px-5 pt-3"
        style={{ paddingBottom: Math.max(16, insets.bottom + 8) }}
      >
        <PrimaryButton
          label={
            cur.duePeriods > 0
              ? `Collect ${inr(cur.inst)}`
              : `Collect advance · ${inr(cur.inst)}`
          }
          onPress={() =>
            openSheet('pay', {
              pay: {
                amount: String(cur.inst),
                method: 'GPAY',
                date: todayISO(),
              },
            })
          }
        />
      </View>
    </Screen>
  );
}

const stepBtn = {
  height: 36,
  width: 36,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  borderRadius: 11,
  backgroundColor: colors.bgMuted,
};
