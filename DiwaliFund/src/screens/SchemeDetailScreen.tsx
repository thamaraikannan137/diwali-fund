import React, { useMemo } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFund } from '../context/FundContext';
import { Avatar, EmptyState, Screen } from '../components/ui';
import { colors } from '../theme/colors';
import { initials, inr, memberStatus, schemeStats } from '../utils/fund';

export function SchemeDetailScreen() {
  const insets = useSafeAreaInsets();
  const {
    schemes,
    rows,
    schemeId,
    search,
    setSearch,
    closeScheme,
    openSheet,
    openMembership,
    deleteScheme,
  } = useFund();

  const scheme = schemes.find((s) => s.id === schemeId);
  const det = scheme ? schemeStats(scheme, rows) : null;

  const members = useMemo(() => {
    if (!schemeId) return [];
    const q = search.trim().toLowerCase();
    return rows
      .filter((r) => r.schemeId === schemeId)
      .sort((a, b) => b.due - a.due)
      .filter(
        (r) =>
          !q ||
          r.m.name.toLowerCase().includes(q) ||
          r.m.phone.includes(q),
      )
      .map((r) => {
        const st = memberStatus(r);
        return {
          ...r,
          status: st.text,
          statusColor: st.color,
          unitsLabel: r.units + (r.units > 1 ? ' units' : ' unit'),
          perPeriod:
            inr(r.s.unit * r.units) + (r.s.type === 'WEEKLY' ? ' / week' : ' / month'),
          fraction: `${r.paidPeriods}/${r.per.total}`,
          pnPlural: r.pn + 's',
        };
      });
  }, [rows, schemeId, search]);

  const confirmDelete = () => {
    if (!det) return;
    Alert.alert(
      'Delete scheme?',
      `Delete “${det.name}” and all its memberships and payments? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteScheme(),
        },
      ],
    );
  };

  if (!det) return null;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View
          className="rounded-b-[28px] bg-white px-5 pb-5"
          style={{ paddingTop: insets.top + 8 }}
        >
          <View className="flex-row items-center gap-2.5">
            <Pressable
              className="-ml-1.5 h-10 w-10 items-center justify-center rounded-[13px] bg-hair"
              onPress={closeScheme}
            >
              <Ionicons name="chevron-back" size={20} color={colors.ink} />
            </Pressable>
            <View className="min-w-0 flex-1">
              <View className="flex-row items-center gap-2">
                <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: det.color }} />
                <Text className="shrink text-xl font-bold text-ink" numberOfLines={1}>
                  {det.name}
                </Text>
              </View>
              <Text className="mt-0.5 text-[13px] text-muted">
                {det.rate} · {det.memberCount} members · {det.period}
              </Text>
            </View>
            <Pressable
              className="h-10 w-10 items-center justify-center rounded-[13px] bg-brand-soft"
              onPress={() => {
                if (!scheme) return;
                openSheet('create', {
                  form: {
                    id: scheme.id,
                    name: scheme.name,
                    type: scheme.type,
                    amount: String(Math.round(scheme.unit)),
                    start: scheme.start,
                    end: scheme.end,
                  },
                });
              }}
              accessibilityRole="button"
              accessibilityLabel="Edit scheme"
            >
              <Ionicons name="create-outline" size={18} color={colors.blue} />
            </Pressable>
            <Pressable
              className="h-10 w-10 items-center justify-center rounded-[13px] bg-danger-soft"
              onPress={confirmDelete}
              accessibilityRole="button"
              accessibilityLabel="Delete scheme"
            >
              <Ionicons name="trash-outline" size={18} color={colors.red} />
            </Pressable>
          </View>
          <View className="mt-[18px] flex-row gap-3">
            <View className="flex-1 rounded-xl bg-bg px-4 py-3.5">
              <Text className="text-2xl font-bold tracking-tight text-ink">
                {det.collectedLabel}
              </Text>
              <Text className="mt-0.5 text-[12.5px] text-muted">
                Collected · {det.pctLabel}
              </Text>
            </View>
            <View className="flex-1 rounded-xl bg-danger-soft px-4 py-3.5">
              <Text className="text-2xl font-bold tracking-tight text-danger">
                {det.pendingLabel}
              </Text>
              <Text className="mt-0.5 text-[12.5px] text-muted">Pending</Text>
            </View>
          </View>
        </View>

        <View className="gap-3 px-5 pt-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-ink">Members</Text>
            <Pressable
              className="h-9 flex-row items-center gap-1.5 rounded-sm bg-brand-soft px-3.5"
              onPress={() => openSheet('add', { sel: {}, addSearch: '' })}
            >
              <Ionicons name="add" size={16} color={colors.blue} />
              <Text className="text-[13.5px] font-semibold text-brand">Add</Text>
            </Pressable>
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
              placeholder="Search members…"
              placeholderTextColor={colors.faint}
              className="h-[46px] rounded-md border border-border bg-white pl-[42px] pr-4 text-[15px] text-ink"
            />
          </View>

          <View className="gap-2.5">
            {members.map((m) => (
              <Pressable
                key={m.id}
                className="flex-row items-center gap-3 rounded-2xl border border-soft bg-white px-4 py-3.5"
                onPress={() => openMembership(m.id)}
              >
                <Avatar initials={initials(m.m.name)} color={m.s.color} />
                <View className="min-w-0 flex-1">
                  <Text className="text-[15.5px] font-bold text-ink">{m.m.name}</Text>
                  <Text className="mt-0.5 text-[12.5px] text-muted">
                    {m.unitsLabel} · {m.perPeriod}
                  </Text>
                </View>
                <View className="items-end gap-1">
                  <Text className="text-[15px] font-bold text-ink">
                    {m.fraction}{' '}
                    <Text className="text-[11.5px] font-medium text-faint">{m.pnPlural}</Text>
                  </Text>
                  <Text className="text-[12.5px] font-semibold" style={{ color: m.statusColor }}>
                    {m.status}
                  </Text>
                </View>
              </Pressable>
            ))}
            {members.length === 0 ? <EmptyState text="No members match" /> : null}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
