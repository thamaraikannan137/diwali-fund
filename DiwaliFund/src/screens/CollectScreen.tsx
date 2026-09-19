import React, { useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFund } from '../context/FundContext';
import { Avatar, EmptyState, Screen } from '../components/ui';
import { colors } from '../theme/colors';
import { initials, inr, todayISO } from '../utils/fund';

export function CollectScreen() {
  const insets = useSafeAreaInsets();
  const { schemes, rows, openSheet, openMembership, refresh, refreshing } = useFund();
  const [search, setSearch] = React.useState('');
  const [schemeFilter, setSchemeFilter] = React.useState<string>('ALL');

  const dueRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows
      .filter((r) => r.due > 0)
      .filter((r) => schemeFilter === 'ALL' || r.schemeId === schemeFilter)
      .filter(
        (r) =>
          !q ||
          r.m.name.toLowerCase().includes(q) ||
          r.m.phone.includes(q) ||
          r.s.name.toLowerCase().includes(q),
      )
      .sort((a, b) => b.due - a.due || a.m.name.localeCompare(b.m.name));
  }, [rows, search, schemeFilter]);

  const totals = useMemo(() => {
    const allDue = rows.filter((r) => r.due > 0);
    const amount = allDue.reduce((a, r) => a + r.due, 0);
    const people = new Set(allDue.map((r) => r.memberId)).size;
    return { amount, people, entries: allDue.length };
  }, [rows]);

  const filters = useMemo(
    () => [
      { key: 'ALL', label: 'All' },
      ...schemes.map((s) => ({
        key: s.id,
        label: s.name.replace('Diwali ', '').replace('Weekly ', 'W').replace('Monthly ', 'M'),
      })),
    ],
    [schemes],
  );

  const collect = (msId: string, inst: number) => {
    openSheet('pay', {
      msId,
      pay: { amount: String(inst), method: 'GPAY', date: todayISO() },
    });
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: 28,
          paddingHorizontal: 20,
          gap: 14,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              void refresh();
            }}
            tintColor={colors.blue}
            colors={[colors.blue]}
          />
        }
      >
        <View>
          <Text className="text-[26px] font-bold tracking-tight text-ink">Collect</Text>
          <Text className="text-[13px] text-muted">
            {totals.people} people · {totals.entries} dues
          </Text>
        </View>

        <View className="flex-row items-center gap-3 rounded-card bg-white px-[18px] py-[18px]">
          <View className="flex-1 gap-1">
            <Text className="text-xs font-semibold uppercase tracking-wide text-faint">
              Total outstanding
            </Text>
            <Text className="text-[32px] font-bold tracking-tight text-danger">
              {inr(totals.amount)}
            </Text>
          </View>
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft">
            <Ionicons name="wallet-outline" size={22} color={colors.blue} />
          </View>
        </View>

        <View className="relative">
          <Ionicons
            name="search"
            size={18}
            color={colors.faint}
            style={{ position: 'absolute', left: 14, top: 14, zIndex: 1 }}
          />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search name, phone, scheme…"
            placeholderTextColor={colors.faint}
            className="h-[46px] rounded-md border border-border bg-white pl-[42px] pr-4 text-[15px] text-ink"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
        >
          {filters.map((f) => {
            const on = schemeFilter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setSchemeFilter(f.key)}
                className={`h-[34px] max-w-[140px] items-center justify-center rounded-[11px] px-3.5 ${
                  on ? 'bg-brand' : 'bg-mutedbg'
                }`}
              >
                <Text
                  className={`text-[13px] font-semibold ${on ? 'text-white' : 'text-muted'}`}
                  numberOfLines={1}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View className="gap-2.5">
          {dueRows.map((r) => (
            <Pressable
              key={r.id}
              className="flex-row overflow-hidden rounded-2xl border border-soft bg-white"
              onPress={() => openMembership(r.id, { schemeId: r.schemeId })}
            >
              <View className="w-1.5" style={{ backgroundColor: r.s.color }} />
              <View className="flex-1 gap-3 p-3.5">
                <View className="flex-row items-center gap-3">
                  <Avatar initials={initials(r.m.name)} color={r.s.color} />
                  <View className="min-w-0 flex-1">
                    <Text className="text-[15.5px] font-bold text-ink" numberOfLines={1}>
                      {r.m.name}
                    </Text>
                    <Text className="mt-0.5 text-[12.5px] text-muted" numberOfLines={1}>
                      {r.s.name.replace('Diwali ', '')} · {r.units}
                      {r.units > 1 ? ' units' : ' unit'}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-base font-bold text-danger">{inr(r.due)}</Text>
                    <Text className="mt-0.5 text-[11.5px] font-semibold text-amber-text">
                      {r.duePeriods} {r.pn}
                      {r.duePeriods > 1 ? 's' : ''} behind
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center justify-between pt-0.5">
                  <Text className="text-[13px] font-medium text-muted">
                    {inr(r.inst)} / {r.pn}
                  </Text>
                  <Pressable
                    className="h-[38px] items-center justify-center rounded-xl bg-brand px-4"
                    onPress={(e) => {
                      e.stopPropagation?.();
                      collect(r.id, r.inst);
                    }}
                  >
                    <Text className="text-[13.5px] font-bold text-white">
                      Collect {inr(r.inst)}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          ))}
          {dueRows.length === 0 ? (
            <EmptyState
              text={
                totals.amount === 0 ? 'Everyone is paid up' : 'No dues match your filters'
              }
            />
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}
