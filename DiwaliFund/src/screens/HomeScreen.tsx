import React, { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFund } from '../context/FundContext';
import { Avatar, Screen } from '../components/ui';
import { colors } from '../theme/colors';
import {
  fmtDate,
  greeting,
  initials,
  methodColor,
  methodLabel,
} from '../utils/fund';

const QUICK = [
  { label: 'Schemes', tab: 'schemes' as const, icon: 'list' as const },
  { label: 'Members', tab: 'members' as const, icon: 'people' as const },
  { label: 'Collect', tab: 'collect' as const, icon: 'cash' as const },
  { label: 'Summary', tab: null, icon: 'bar-chart' as const },
];

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { rows, payments, goTab, logout, openSummary } = useFund();

  const recent = useMemo(
    () =>
      [...payments]
        .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
        .slice(0, 5)
        .map((p) => {
          const r = rows.find((x) => x.id === p.msId);
          return {
            id: p.id,
            member: r?.m?.name ?? '—',
            initials: r?.m ? initials(r.m.name) : '?',
            color: r?.s?.color ?? '#94A3B8',
            scheme: r?.s?.name.replace('Diwali ', '') ?? '',
            date: fmtDate(p.date),
            amount: '₹' + Math.round(p.amount).toLocaleString('en-IN'),
            method: methodLabel(p.method),
            methodColor: methodColor(p.method),
          };
        }),
    [payments, rows],
  );

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: 24,
          paddingHorizontal: 20,
          gap: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm text-muted">{greeting()}</Text>
            <Text className="text-[22px] font-bold tracking-tight text-ink">
              Diwali Fund 2026
            </Text>
          </View>
          <Pressable
            className="h-[42px] w-[42px] items-center justify-center rounded-md bg-amber-soft"
            onPress={() => {
              void logout();
            }}
            accessibilityRole="button"
            accessibilityLabel="Logout"
          >
            <Ionicons name="log-out-outline" size={22} color={colors.amber} />
          </Pressable>
        </View>

        <View>
          <Text className="mb-2.5 text-[15px] font-semibold text-ink">Quick actions</Text>
          <View className="flex-row gap-2.5">
            {QUICK.map((q) => (
              <Pressable
                key={q.label}
                className="flex-1 items-center gap-2 rounded-[18px] bg-white pb-3 pt-3.5"
                onPress={() => (q.tab ? goTab(q.tab) : openSummary())}
              >
                <View className="h-10 w-10 items-center justify-center rounded-[13px] bg-brand-soft">
                  <Ionicons name={q.icon} size={20} color={colors.blue} />
                </View>
                <Text className="text-xs font-semibold text-ink">{q.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View>
          <Text className="mb-2.5 text-[15px] font-semibold text-ink">Recent payments</Text>
          <View className="overflow-hidden rounded-2xl bg-white">
            {recent.map((p, i) => (
              <View
                key={p.id}
                className={`flex-row items-center gap-3 px-4 py-3.5 ${
                  i < recent.length - 1 ? 'border-b border-hair' : ''
                }`}
              >
                <Avatar initials={p.initials} color={p.color} size={38} radius={19} />
                <View className="min-w-0 flex-1">
                  <Text className="text-[15px] font-semibold text-ink" numberOfLines={1}>
                    {p.member}
                  </Text>
                  <Text className="text-[12.5px] text-muted">
                    {p.scheme} · {p.date}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-[15px] font-bold text-ink">{p.amount}</Text>
                  <Text className="text-[11.5px] font-semibold" style={{ color: p.methodColor }}>
                    {p.method}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
