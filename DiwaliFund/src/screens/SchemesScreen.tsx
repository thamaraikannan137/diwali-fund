import React, { useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFund } from '../context/FundContext';
import { ProgressRing } from '../components/ProgressRing';
import { Screen, Segmented } from '../components/ui';
import { colors } from '../theme/colors';
import { addMonthsISO, schemeStats, todayISO } from '../utils/fund';

export function SchemesScreen() {
  const insets = useSafeAreaInsets();
  const { schemes, rows, filter, setFilter, openScheme, openSheet, refresh, refreshing } =
    useFund();

  const cards = useMemo(
    () =>
      schemes
        .filter((s) => filter === 'ALL' || s.type === filter)
        .map((s) => schemeStats(s, rows)),
    [schemes, rows, filter],
  );

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: 24,
          paddingHorizontal: 20,
          gap: 16,
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
        <View className="flex-row items-center justify-between">
          <Text className="text-[26px] font-bold tracking-tight text-ink">Schemes</Text>
          <Pressable
            className="h-[42px] w-[42px] items-center justify-center rounded-md bg-brand"
            onPress={() => {
              const start = todayISO();
              const months = 10;
              openSheet('create', {
                form: {
                  id: undefined,
                  name: '',
                  type: 'WEEKLY',
                  amount: '',
                  start,
                  months: String(months),
                  end: addMonthsISO(start, months),
                },
              });
            }}
          >
            <Ionicons name="add" size={22} color={colors.white} />
          </Pressable>
        </View>

        <Segmented
          value={filter}
          onChange={(k) => setFilter(k as typeof filter)}
          options={[
            { key: 'ALL', label: 'All' },
            { key: 'WEEKLY', label: 'Weekly' },
            { key: 'MONTHLY', label: 'Monthly' },
          ]}
        />

        <View className="gap-3">
          {cards.map((s) => (
            <Pressable
              key={s.id}
              className="flex-row overflow-hidden rounded-card border border-soft bg-white"
              onPress={() => openScheme(s.id)}
            >
              <View className="w-1.5" style={{ backgroundColor: s.color }} />
              <View className="flex-1 gap-3.5 p-[18px]">
                <View className="flex-row items-center justify-between gap-3">
                  <Text className="flex-1 text-[17px] font-bold tracking-tight text-ink" numberOfLines={1}>
                    {s.name}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.slate} />
                </View>
                <View className="flex-row items-end justify-between gap-3">
                  <View className="min-w-0 flex-1 gap-2">
                    <Text className="text-[30px] font-bold tracking-tight text-ink">
                      {s.collectedLabel}
                    </Text>
                    <View className="gap-1">
                      <View className="flex-row flex-wrap items-baseline gap-1">
                        <Text className="text-[13px] font-bold text-danger">
                          {s.pendingLabel}
                        </Text>
                        <Text className="text-[13px] text-muted">pending</Text>
                      </View>
                      <View className="flex-row flex-wrap items-baseline gap-1">
                        <Text className="text-[13px] font-bold text-ink">
                          {s.memberCount}
                        </Text>
                        <Text className="text-[13px] text-muted">
                          members · {s.period}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <ProgressRing pct={s.pct} color={s.color} />
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
