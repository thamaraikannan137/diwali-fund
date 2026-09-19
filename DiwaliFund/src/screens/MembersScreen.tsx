import React, { useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFund } from '../context/FundContext';
import { Avatar, EmptyState, Screen, Segmented } from '../components/ui';
import { colors } from '../theme/colors';
import { avatar, initials, inr } from '../utils/fund';

export function MembersScreen() {
  const insets = useSafeAreaInsets();
  const {
    members,
    rows,
    mSearch,
    setMSearch,
    mFilter,
    setMFilter,
    openMember,
    openSheet,
    refresh,
    refreshing,
  } = useFund();

  const perMember = useMemo(
    () =>
      members.map((m, i) => {
        const rs = rows.filter((r) => r.memberId === m.id);
        const paid = rs.reduce((a, r) => a + r.paid, 0);
        const due = rs.reduce((a, r) => a + r.due, 0);
        const behind = rs.reduce((a, r) => a + r.duePeriods, 0);
        return { m, i, rs, paid, due, behind };
      }),
    [members, rows],
  );

  const cards = useMemo(() => {
    const mq = mSearch.trim().toLowerCase();
    return perMember
      .filter(
        (x) =>
          (!mq ||
            x.m.name.toLowerCase().includes(mq) ||
            x.m.phone.includes(mq)) &&
          (mFilter === 'ALL' ||
            (mFilter === 'DUE'
              ? x.due > 0
              : x.due === 0 && x.rs.some((r) => r.per.elapsed > 0))),
      )
      .sort((a, b) => b.due - a.due || a.m.name.localeCompare(b.m.name))
      .map((x) => ({
        id: x.m.id,
        name: x.m.name,
        phone: x.m.phone,
        initials: initials(x.m.name),
        color: avatar(x.i),
        paid: inr(x.paid),
        schemeLabel:
          x.rs.length === 0
            ? 'No scheme'
            : x.rs.length === 1
              ? x.rs[0].s.name.replace('Diwali ', '')
              : x.rs.length + ' schemes',
        status:
          x.rs.length === 0
            ? 'Not enrolled'
            : x.rs.every((r) => r.per.elapsed === 0)
              ? 'Not started'
              : x.due === 0
                ? '✓ Paid up'
                : inr(x.due) + ' due',
        statusColor:
          x.rs.length === 0
            ? colors.faint
            : x.rs.every((r) => r.per.elapsed === 0)
              ? colors.faint
              : x.due === 0
                ? colors.green
                : x.behind > 1
                  ? colors.red
                  : colors.amberText,
      }));
  }, [perMember, mSearch, mFilter]);

  const dueCount = perMember.filter((x) => x.due > 0).length;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: 24,
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
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-[26px] font-bold tracking-tight text-ink">Members</Text>
            <Text className="mt-0.5 text-[13px] text-muted">
              {members.length} members · {dueCount} with dues
            </Text>
          </View>
          <Pressable
            className="h-[42px] w-[42px] items-center justify-center rounded-md bg-brand"
            onPress={() => openSheet('memberForm', { mf: { name: '', phone: '' } })}
          >
            <Ionicons name="add" size={22} color={colors.white} />
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
            value={mSearch}
            onChangeText={setMSearch}
            placeholder="Search name or phone…"
            placeholderTextColor={colors.faint}
            className="h-[46px] rounded-md border border-border bg-white pl-[42px] pr-4 text-[15px] text-ink"
          />
        </View>

        <Segmented
          value={mFilter}
          onChange={(k) => setMFilter(k as typeof mFilter)}
          options={[
            { key: 'ALL', label: 'All' },
            { key: 'DUE', label: 'Due' },
            { key: 'PAID', label: 'Paid up' },
          ]}
        />

        <View className="gap-2.5">
          {cards.map((m) => (
            <Pressable
              key={m.id}
              className="flex-row items-center gap-3 rounded-2xl border border-soft bg-white px-4 py-3.5"
              onPress={() => openMember(m.id)}
            >
              <Avatar initials={m.initials} color={m.color} />
              <View className="min-w-0 flex-1">
                <Text className="text-[15.5px] font-bold text-ink">{m.name}</Text>
                <Text className="mt-0.5 text-[12.5px] text-muted">
                  {m.phone} · {m.schemeLabel}
                </Text>
              </View>
              <View className="items-end gap-1">
                <Text className="text-[15px] font-bold text-ink">{m.paid}</Text>
                <Text className="text-[12.5px] font-semibold" style={{ color: m.statusColor }}>
                  {m.status}
                </Text>
              </View>
            </Pressable>
          ))}
          {cards.length === 0 ? <EmptyState text="No members match" /> : null}
        </View>
      </ScrollView>
    </Screen>
  );
}
