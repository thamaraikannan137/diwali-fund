import React, { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFund } from '../context/FundContext';
import { Avatar, Screen } from '../components/ui';
import { BudgetSharePie, DonutChart, SchemeCompareBars } from '../components/charts';
import { colors } from '../theme/colors';
import { initials, inr, schemeStats } from '../utils/fund';

export function SummaryScreen() {
  const insets = useSafeAreaInsets();
  const {
    schemes,
    rows,
    payments,
    members,
    closeSummary,
    goTab,
    openScheme,
    openMembership,
  } = useFund();

  const stats = useMemo(() => {
    const collected = rows.reduce((a, r) => a + r.paid, 0);
    const pending = rows.reduce((a, r) => a + r.due, 0);
    const target = rows.reduce((a, r) => a + r.target, 0);
    const pct = target ? Math.round((collected / target) * 100) : 0;

    const now = new Date();
    const mk = now.toISOString().slice(0, 7);
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekIso = weekAgo.toISOString().slice(0, 10);

    const thisMonth = payments
      .filter((p) => p.date.startsWith(mk))
      .reduce((a, p) => a + p.amount, 0);
    const last7 = payments
      .filter((p) => p.date >= weekIso)
      .reduce((a, p) => a + p.amount, 0);

    const cash = payments
      .filter((p) => p.method === 'CASH')
      .reduce((a, p) => a + p.amount, 0);
    const gpay = payments
      .filter((p) => p.method === 'GPAY')
      .reduce((a, p) => a + p.amount, 0);

    const behind = rows.filter((r) => r.due > 0);
    const peopleBehind = new Set(behind.map((r) => r.memberId)).size;
    const paidUp = members.filter((m) => {
      const rs = rows.filter((r) => r.memberId === m.id && r.per.elapsed > 0);
      return rs.length > 0 && rs.every((r) => r.due === 0);
    }).length;

    const weeklyRows = rows.filter((r) => r.s.type === 'WEEKLY');
    const monthlyRows = rows.filter((r) => r.s.type === 'MONTHLY');
    const byType = {
      weekly: {
        collected: weeklyRows.reduce((a, r) => a + r.paid, 0),
        pending: weeklyRows.reduce((a, r) => a + r.due, 0),
        target: weeklyRows.reduce((a, r) => a + r.target, 0),
        count: schemes.filter((s) => s.type === 'WEEKLY').length,
      },
      monthly: {
        collected: monthlyRows.reduce((a, r) => a + r.paid, 0),
        pending: monthlyRows.reduce((a, r) => a + r.due, 0),
        target: monthlyRows.reduce((a, r) => a + r.target, 0),
        count: schemes.filter((s) => s.type === 'MONTHLY').length,
      },
    };

    const topDues = [...behind]
      .sort((a, b) => b.due - a.due)
      .slice(0, 5)
      .map((r) => ({
        id: r.id,
        schemeId: r.schemeId,
        name: r.m.name,
        initials: initials(r.m.name),
        color: r.s.color,
        scheme: r.s.name.replace('Diwali ', ''),
        due: r.due,
        duePeriods: r.duePeriods,
        pn: r.pn,
        inst: r.inst,
      }));

    const schemeCards = schemes
      .map((s) => schemeStats(s, rows))
      .sort((a, b) => b.target - a.target);

    return {
      collected,
      pending,
      target,
      pct,
      thisMonth,
      last7,
      cash,
      gpay,
      peopleBehind,
      paidUp,
      schemeCards,
      topDues,
      byType,
      memberCount: members.length,
      schemeCount: schemes.length,
      paymentCount: payments.length,
      isSingleScheme: schemes.length === 1,
    };
  }, [schemes, rows, payments, members]);

  const methodTotal = stats.cash + stats.gpay || 1;
  const cashPct = Math.round((stats.cash / methodTotal) * 100);
  const gpayPct = 100 - cashPct;

  const overallSlices = [
    { value: stats.collected, color: colors.blue, label: 'Collected' },
    { value: stats.pending, color: colors.red, label: 'Balance' },
  ];

  const single = stats.isSingleScheme ? stats.schemeCards[0] : null;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: 36,
          paddingHorizontal: 20,
          gap: 14,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            className="h-10 w-10 items-center justify-center rounded-[13px] bg-white"
            onPress={closeSummary}
          >
            <Ionicons name="chevron-back" size={20} color={colors.ink} />
          </Pressable>
          <Text className="text-[17px] font-bold text-ink">Summary</Text>
          <View className="w-10" />
        </View>

        {/* Overall budget */}
        <View className="gap-4 rounded-card bg-white p-5">
          <View>
            <Text className="text-[13px] font-semibold text-muted">
              {stats.isSingleScheme && single
                ? single.name.replace(/^Diwali\s+/i, '')
                : 'Overall · all schemes'}
            </Text>
            <Text className="mt-1 text-[13px] font-medium text-muted">Total budget</Text>
            <Text className="mt-0.5 text-[32px] font-bold tracking-tight text-ink">
              {inr(stats.target)}
            </Text>
          </View>

          <View className="flex-row items-center gap-4">
            <DonutChart
              slices={overallSlices}
              size={132}
              stroke={20}
              centerValue={`${stats.pct}%`}
              centerLabel="done"
            />
            <View className="min-w-0 flex-1 gap-3">
              <MetricRow
                color={colors.blue}
                label="Collected"
                value={inr(stats.collected)}
              />
              <MetricRow
                color={colors.red}
                label="Balance"
                value={inr(stats.pending)}
              />
              <MetricRow
                color={colors.faint}
                label="Budget"
                value={inr(stats.target)}
              />
            </View>
          </View>

          <View className="flex-row gap-2.5">
            <View className="flex-1 rounded-xl bg-bg px-3 py-3">
              <Text className="text-base font-bold text-ink">{inr(stats.thisMonth)}</Text>
              <Text className="mt-0.5 text-[11px] font-medium text-muted">This month</Text>
            </View>
            <View className="flex-1 rounded-xl bg-bg px-3 py-3">
              <Text className="text-base font-bold text-ink">{inr(stats.last7)}</Text>
              <Text className="mt-0.5 text-[11px] font-medium text-muted">Last 7 days</Text>
            </View>
            <View className="flex-1 rounded-xl bg-bg px-3 py-3">
              <Text className="text-base font-bold text-ink">{stats.schemeCount}</Text>
              <Text className="mt-0.5 text-[11px] font-medium text-muted">
                Scheme{stats.schemeCount === 1 ? '' : 's'}
              </Text>
            </View>
          </View>
        </View>

        {/* Snapshot */}
        <View className="flex-row rounded-xl bg-white px-1 py-3.5">
          <Stat icon="people-outline" label="Members" value={String(stats.memberCount)} />
          <Stat icon="checkmark-circle-outline" label="Paid up" value={String(stats.paidUp)} />
          <Stat
            icon="alert-circle-outline"
            label="Behind"
            value={String(stats.peopleBehind)}
            alert={stats.peopleBehind > 0}
          />
          <Stat icon="receipt-outline" label="Payments" value={String(stats.paymentCount)} />
        </View>

        {/* Multi-scheme charts */}
        {!stats.isSingleScheme && stats.schemeCards.length > 0 ? (
          <>
            <Text className="text-[15px] font-bold text-ink">Share of overall budget</Text>
            <View className="rounded-xl bg-white p-4">
              <Text className="mb-3 text-[12px] font-medium text-muted">
                Each slice = that scheme’s budget as % of total ({inr(stats.target)})
              </Text>
              <BudgetSharePie
                totalLabel={inr(stats.target)}
                items={stats.schemeCards.map((s) => ({
                  id: s.id,
                  name: s.name,
                  color: s.color,
                  value: s.target,
                }))}
              />
              <View className="mt-4 flex-row gap-2.5 border-t border-hair pt-3.5">
                <View className="flex-1 rounded-xl bg-amber-bg px-3 py-2.5">
                  <Text className="text-[11px] font-medium text-amber-text">All weekly</Text>
                  <Text className="mt-0.5 text-[15px] font-bold text-ink">
                    {stats.target
                      ? Math.round((stats.byType.weekly.target / stats.target) * 100)
                      : 0}
                    %
                  </Text>
                  <Text className="text-[11px] font-medium text-muted">
                    {inr(stats.byType.weekly.target)}
                  </Text>
                </View>
                <View className="flex-1 rounded-xl bg-brand-soft px-3 py-2.5">
                  <Text className="text-[11px] font-medium text-brand">All monthly</Text>
                  <Text className="mt-0.5 text-[15px] font-bold text-ink">
                    {stats.target
                      ? Math.round((stats.byType.monthly.target / stats.target) * 100)
                      : 0}
                    %
                  </Text>
                  <Text className="text-[11px] font-medium text-muted">
                    {inr(stats.byType.monthly.target)}
                  </Text>
                </View>
              </View>
            </View>

            <Text className="text-[15px] font-bold text-ink">Collected vs balance</Text>
            <View className="rounded-xl bg-white p-4">
              <SchemeCompareBars
                items={stats.schemeCards.map((s) => ({
                  id: s.id,
                  name: s.name,
                  color: s.color,
                  target: s.target,
                  collected: s.collected,
                  pending: s.pending,
                }))}
              />
            </View>
          </>
        ) : null}

        {/* Single scheme detail */}
        {single ? (
          <>
            <Text className="text-[15px] font-bold text-ink">This scheme</Text>
            <View className="gap-3 rounded-xl bg-white p-4">
              <View className="flex-row gap-2.5">
                <View className="flex-1 rounded-xl bg-brand-soft px-3 py-3">
                  <Text className="text-lg font-bold text-brand">{single.collectedLabel}</Text>
                  <Text className="mt-0.5 text-xs font-medium text-muted">Collected</Text>
                </View>
                <View className="flex-1 rounded-xl bg-danger-soft px-3 py-3">
                  <Text className="text-lg font-bold text-danger">{single.pendingLabel}</Text>
                  <Text className="mt-0.5 text-xs font-medium text-muted">Balance</Text>
                </View>
              </View>
              <View className="rounded-xl bg-bg px-3 py-3">
                <Text className="text-base font-bold text-ink">{single.targetLabel}</Text>
                <Text className="mt-0.5 text-xs font-medium text-muted">
                  Total budget · {single.memberCount} members · {single.period}
                </Text>
              </View>
            </View>
          </>
        ) : null}

        {/* Weekly vs Monthly */}
        <Text className="text-[15px] font-bold text-ink">By type</Text>
        <View className="flex-row gap-2.5">
          <TypeCard
            title="Weekly"
            count={stats.byType.weekly.count}
            budget={stats.byType.weekly.target}
            collected={stats.byType.weekly.collected}
            pending={stats.byType.weekly.pending}
            accent={colors.amber}
          />
          <TypeCard
            title="Monthly"
            count={stats.byType.monthly.count}
            budget={stats.byType.monthly.target}
            collected={stats.byType.monthly.collected}
            pending={stats.byType.monthly.pending}
            accent={colors.purple}
          />
        </View>

        {/* Per-scheme list */}
        <Text className="text-[15px] font-bold text-ink">
          {stats.isSingleScheme ? 'Scheme detail' : 'Each scheme'}
        </Text>
        <View className="gap-2.5">
          {stats.schemeCards.map((s) => (
            <Pressable
              key={s.id}
              className="gap-3 rounded-xl bg-white p-3.5"
              onPress={() => {
                closeSummary();
                goTab('schemes');
                setTimeout(() => openScheme(s.id), 0);
              }}
            >
              <View className="flex-row items-center gap-3">
                <View
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <Text className="min-w-0 flex-1 text-[15px] font-bold text-ink" numberOfLines={1}>
                  {s.name.replace(/^Diwali\s+/i, '')}
                </Text>
                <Text className="text-sm font-bold text-muted">{s.pct}%</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.slate} />
              </View>
              <View className="h-2 overflow-hidden rounded-full bg-mutedbg">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, s.pct)}%`,
                    backgroundColor: s.color,
                  }}
                />
              </View>
              <View className="flex-row gap-2">
                <MiniStat label="Budget" value={s.targetLabel} />
                <MiniStat label="Collected" value={s.collectedLabel} />
                <MiniStat label="Balance" value={s.pendingLabel} danger={s.pending > 0} />
              </View>
              <Text className="text-[11px] font-medium text-muted">
                {s.memberCount} members · {s.typeLabel} · {s.period}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Top dues */}
        {stats.topDues.length > 0 ? (
          <>
            <View className="flex-row items-center justify-between">
              <Text className="text-[15px] font-bold text-ink">Top dues</Text>
              <Pressable
                onPress={() => {
                  closeSummary();
                  goTab('collect');
                }}
              >
                <Text className="text-[13px] font-semibold text-brand">See all</Text>
              </Pressable>
            </View>
            <View className="overflow-hidden rounded-xl bg-white">
              {stats.topDues.map((d, i) => (
                <Pressable
                  key={d.id}
                  className={`flex-row items-center gap-3 px-4 py-3.5 ${
                    i < stats.topDues.length - 1 ? 'border-b border-hair' : ''
                  }`}
                  onPress={() => {
                    closeSummary();
                    goTab('collect');
                    setTimeout(() => openMembership(d.id, { schemeId: d.schemeId }), 0);
                  }}
                >
                  <Avatar initials={d.initials} color={d.color} size={40} radius={13} />
                  <View className="min-w-0 flex-1">
                    <Text className="text-[15px] font-bold text-ink" numberOfLines={1}>
                      {d.name}
                    </Text>
                    <Text className="text-[12.5px] text-muted">
                      {d.scheme} · {d.duePeriods} {d.pn}
                      {d.duePeriods > 1 ? 's' : ''} behind
                    </Text>
                  </View>
                  <Text className="text-[15px] font-bold text-danger">{inr(d.due)}</Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}

        {/* Methods */}
        <Text className="text-[15px] font-bold text-ink">Payment methods</Text>
        <View className="gap-3.5 rounded-xl bg-white p-4">
          <View className="h-3 flex-row gap-0.5 overflow-hidden rounded-md">
            {cashPct > 0 ? (
              <View className="h-full bg-success" style={{ flex: cashPct }} />
            ) : null}
            {gpayPct > 0 ? (
              <View className="h-full bg-brand" style={{ flex: gpayPct }} />
            ) : null}
            {cashPct === 0 && gpayPct === 0 ? (
              <View className="h-full flex-1 bg-mutedbg" />
            ) : null}
          </View>
          <View className="flex-row gap-5">
            <View className="flex-1 flex-row items-center gap-2.5">
              <View className="h-2.5 w-2.5 rounded-full bg-success" />
              <View>
                <Text className="text-xs font-medium text-muted">Cash</Text>
                <Text className="mt-px text-sm font-bold text-ink">
                  {inr(stats.cash)} · {cashPct}%
                </Text>
              </View>
            </View>
            <View className="flex-1 flex-row items-center gap-2.5">
              <View className="h-2.5 w-2.5 rounded-full bg-brand" />
              <View>
                <Text className="text-xs font-medium text-muted">GPay</Text>
                <Text className="mt-px text-sm font-bold text-ink">
                  {inr(stats.gpay)} · {gpayPct}%
                </Text>
              </View>
            </View>
          </View>
        </View>

        {stats.pending > 0 ? (
          <Pressable
            className="h-[54px] flex-row items-center justify-center gap-2 rounded-lg bg-brand"
            onPress={() => {
              closeSummary();
              goTab('collect');
            }}
          >
            <Text className="text-[15px] font-bold text-white">
              Collect outstanding · {inr(stats.pending)}
            </Text>
            <Ionicons name="arrow-forward" size={18} color={colors.white} />
          </Pressable>
        ) : (
          <View className="flex-row items-center justify-center gap-2 rounded-xl bg-success-soft py-4">
            <Ionicons name="checkmark-circle" size={22} color={colors.green} />
            <Text className="text-[15px] font-semibold text-success">Everyone is paid up</Text>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

function MetricRow({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-2.5">
      <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      <View className="min-w-0 flex-1">
        <Text className="text-[11px] font-medium text-muted">{label}</Text>
        <Text className="text-[15px] font-bold text-ink" numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function MiniStat({
  label,
  value,
  danger,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <View className="min-w-0 flex-1 rounded-lg bg-bg px-2.5 py-2">
      <Text className="text-[10px] font-medium text-muted">{label}</Text>
      <Text
        className={`mt-0.5 text-[12px] font-bold ${danger ? 'text-danger' : 'text-ink'}`}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

function Stat({
  icon,
  label,
  value,
  alert,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <View className="flex-1 items-center gap-1">
      <Ionicons name={icon} size={16} color={alert ? colors.red : colors.muted} />
      <Text className={`text-base font-bold ${alert ? 'text-danger' : 'text-ink'}`}>
        {value}
      </Text>
      <Text className="text-[11px] font-medium text-muted">{label}</Text>
    </View>
  );
}

function TypeCard({
  title,
  count,
  budget,
  collected,
  pending,
  accent,
}: {
  title: string;
  count: number;
  budget: number;
  collected: number;
  pending: number;
  accent: string;
}) {
  const pct = budget ? Math.round((collected / budget) * 100) : 0;
  return (
    <View className="flex-1 gap-2 rounded-xl bg-white p-3.5">
      <View className="flex-row items-center gap-2">
        <View className="h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
        <Text className="text-[13px] font-bold text-ink">{title}</Text>
        <Text className="text-[11px] text-faint">· {count}</Text>
      </View>
      <Text className="text-[11px] font-medium text-muted">Budget {inr(budget)}</Text>
      <Text className="text-lg font-bold text-ink">{inr(collected)}</Text>
      <Text className="text-xs font-medium text-muted">{pct}% collected</Text>
      <Text className="text-xs font-medium text-danger">{inr(pending)} balance</Text>
    </View>
  );
}
