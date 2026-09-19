import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { BottomSheet } from '../components/BottomSheet';
import { DateField } from '../components/DateField';
import { ChoiceRow, Field, PrimaryButton } from '../components/ui';
import { useFund } from '../context/FundContext';
import { createHint } from '../utils/fund';

export function CreateSchemeSheet() {
  const { sheet, form, setForm, createScheme, closeSheet } = useFund();
  const visible = sheet === 'create';
  const editing = !!form.id;
  const amt = Number(form.amount) || 0;
  const disabled = !(
    form.name &&
    form.type &&
    amt &&
    form.start &&
    form.end &&
    new Date(form.end) > new Date(form.start)
  );

  return (
    <BottomSheet
      visible={visible}
      onClose={closeSheet}
      title={editing ? 'Edit scheme' : 'Create scheme'}
    >
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View className="gap-[18px] pb-2">
          <Field
            label="Scheme name"
            placeholder="e.g. Diwali Weekly 500"
            value={form.name}
            onChangeText={(name) => setForm({ name })}
          />
          <View className="gap-1.5">
            <Text className="text-[13px] font-semibold text-muted">Type</Text>
            <ChoiceRow
              value={form.type}
              onChange={(type) => setForm({ type: type as typeof form.type })}
              options={[
                { key: 'WEEKLY', label: 'Weekly' },
                { key: 'MONTHLY', label: 'Monthly' },
              ]}
            />
          </View>
          <Field
            label="Unit amount (₹)"
            placeholder="100"
            keyboardType="number-pad"
            value={form.amount}
            onChangeText={(amount) => setForm({ amount: amount.replace(/[^\d]/g, '') })}
          />
          <View className="flex-row gap-3">
            <View className="flex-1">
              <DateField
                label="Start date"
                value={form.start}
                onChange={(start) => setForm({ start })}
              />
            </View>
            <View className="flex-1">
              <DateField
                label="End date"
                value={form.end}
                onChange={(end) => setForm({ end })}
              />
            </View>
          </View>
          <View className="rounded-xl bg-bg px-3.5 py-2.5">
            <Text className="text-[13px] text-muted">{createHint(form)}</Text>
          </View>
          <PrimaryButton
            label={editing ? 'Save changes' : 'Create scheme'}
            onPress={createScheme}
            disabled={disabled}
          />
        </View>
      </ScrollView>
    </BottomSheet>
  );
}
