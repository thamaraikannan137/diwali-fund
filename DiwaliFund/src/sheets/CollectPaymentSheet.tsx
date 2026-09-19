import React, { useMemo } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { BottomSheet } from '../components/BottomSheet';
import { DateField } from '../components/DateField';
import { ChoiceRow, PrimaryButton } from '../components/ui';
import { useFund } from '../context/FundContext';
import { inr } from '../utils/fund';

export function CollectPaymentSheet() {
  const {
    sheet,
    rows,
    msId,
    pay,
    setPay,
    savePayment,
    deletePayment,
    closeSheet,
  } = useFund();
  const visible = sheet === 'pay';
  const editing = !!pay.id;
  const cur = rows.find((r) => r.id === msId);
  const amt = Number(pay.amount) || 0;

  const quickFills = useMemo(() => {
    if (!cur) return [];
    const qf: { val: number; label: string }[] = [
      { val: cur.inst, label: `1 ${cur.pn}` },
      { val: cur.inst * 2, label: `2 ${cur.pn}s` },
      { val: cur.inst * 4, label: `4 ${cur.pn}s` },
    ];
    if (cur.duePeriods > 1) {
      qf.push({ val: cur.due, label: `Catch up ${cur.duePeriods} ${cur.pn}s` });
    }
    return qf;
  }, [cur]);

  const covers =
    cur && amt > 0
      ? amt / cur.inst === Math.floor(amt / cur.inst)
        ? `Covers ${amt / cur.inst} ${cur.pn}${amt / cur.inst > 1 ? 's' : ''}`
        : `Partial · ${inr(cur.inst)} per ${cur.pn}`
      : `Enter amount for this ${cur?.pn ?? 'week'}`;

  if (!cur && visible) {
    return (
      <BottomSheet visible onClose={closeSheet} title={editing ? 'Edit payment' : 'Collect payment'}>
        <View />
      </BottomSheet>
    );
  }
  if (!cur) return null;

  return (
    <BottomSheet
      visible={visible}
      onClose={closeSheet}
      title={editing ? 'Edit payment' : 'Collect payment'}
      subtitle={
        editing
          ? `${cur.m.name} · ${cur.s.name}`
          : `${cur.m.name} · ${cur.s.name} · ${inr(cur.due)} due`
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View className="gap-[18px] pb-2">
          <View className="gap-1.5">
            <Text className="text-[13px] font-semibold text-muted">Amount</Text>
            <View className="h-16 flex-row items-center gap-1.5 rounded-[18px] border border-border bg-input px-[18px]">
              <Text className="text-[28px] font-bold text-faint">₹</Text>
              <TextInput
                value={pay.amount}
                onChangeText={(amount) =>
                  setPay({ amount: amount.replace(/[^\d]/g, '') })
                }
                keyboardType="number-pad"
                className="flex-1 text-[32px] font-bold tracking-tight text-ink"
              />
            </View>
            <Text className="px-1 text-[13px] font-medium text-muted">{covers}</Text>
            {!editing && amt > cur.due ? (
              <View className="rounded-[10px] bg-amber-bg px-3 py-2">
                <Text className="text-[13px] font-medium text-amber-text">
                  More than what’s owed so far — the extra is recorded as advance for
                  coming weeks.
                </Text>
              </View>
            ) : null}
          </View>

          {!editing ? (
            <View className="flex-row flex-wrap gap-2">
              {quickFills.map((q) => {
                const on = amt === q.val && q.val > 0;
                return (
                  <Pressable
                    key={q.label}
                    onPress={() => setPay({ amount: String(q.val) })}
                    className={`h-10 items-center justify-center rounded-xl border-[1.5px] px-4 ${
                      on ? 'border-brand bg-brand-soft' : 'border-border bg-white'
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${on ? 'text-brand' : 'text-ink'}`}
                    >
                      {q.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          <View className="gap-1.5">
            <Text className="text-[13px] font-semibold text-muted">Payment method</Text>
            <ChoiceRow
              value={pay.method}
              onChange={(method) => setPay({ method: method as typeof pay.method })}
              options={[
                { key: 'CASH', label: 'Cash' },
                { key: 'GPAY', label: 'GPay' },
              ]}
            />
          </View>

          <DateField
            label="Date"
            value={pay.date}
            onChange={(date) => setPay({ date })}
          />

          <PrimaryButton
            label={
              amt > 0
                ? editing
                  ? `Update ${inr(amt)}`
                  : `Save ${inr(amt)}`
                : 'Enter amount'
            }
            onPress={savePayment}
            disabled={!(amt > 0)}
          />

          {editing ? (
            <Pressable
              className="h-12 items-center justify-center rounded-lg bg-danger-soft"
              onPress={deletePayment}
            >
              <Text className="text-[15px] font-semibold text-danger">Delete payment</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </BottomSheet>
  );
}
