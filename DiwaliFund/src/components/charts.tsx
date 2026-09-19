import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { colors } from '../theme/colors';
import { inr } from '../utils/fund';

type Slice = { value: number; color: string; label: string };

function polar(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, start: number, end: number) {
  const s = polar(cx, cy, r, end);
  const e = polar(cx, cy, r, start);
  const large = end - start <= 180 ? 0 : 1;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
}

function pieSlicePath(cx: number, cy: number, r: number, start: number, end: number) {
  if (end - start >= 359.99) {
    // Full circle — Path with A can fail; use two semicircles via Move+Arc
    const mid = start + 180;
    const a = polar(cx, cy, r, start);
    const b = polar(cx, cy, r, mid);
    return `M ${cx} ${cy} L ${a.x} ${a.y} A ${r} ${r} 0 1 1 ${b.x} ${b.y} A ${r} ${r} 0 1 1 ${a.x} ${a.y} Z`;
  }
  const s = polar(cx, cy, r, start);
  const e = polar(cx, cy, r, end);
  const large = end - start > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} Z`;
}

/** Filled pie: each scheme’s share of overall budget. */
export function BudgetSharePie({
  items,
  totalLabel,
}: {
  items: { id: string; name: string; color: string; value: number }[];
  totalLabel: string;
}) {
  const total = items.reduce((a, i) => a + Math.max(0, i.value), 0) || 1;
  const size = 168;
  const r = 78;
  const cx = size / 2;
  const cy = size / 2;

  const slices = useMemo(() => {
    let angle = 0;
    return items
      .filter((i) => i.value > 0)
      .map((i) => {
        const pct = Math.round((i.value / total) * 100);
        const sweep = (i.value / total) * 360;
        const start = angle;
        const end = angle + Math.max(sweep, 0.5);
        angle = end;
        return {
          ...i,
          pct,
          path: pieSlicePath(cx, cy, r, start, end),
          shortName: i.name.replace(/^Diwali\s+/i, ''),
        };
      });
  }, [items, total, cx, cy, r]);

  return (
    <View className="gap-4">
      <View className="items-center">
        <View style={{ width: size, height: size }}>
          <Svg width={size} height={size}>
            {slices.length === 0 ? (
              <Circle cx={cx} cy={cy} r={r} fill={colors.borderSoft} />
            ) : (
              slices.map((s) => <Path key={s.id} d={s.path} fill={s.color} />)
            )}
            <Circle cx={cx} cy={cy} r={42} fill={colors.white} />
          </Svg>
          <View className="absolute inset-0 items-center justify-center px-6">
            <Text className="text-center text-[11px] font-medium text-muted">Overall</Text>
            <Text className="text-center text-[13px] font-bold text-ink" numberOfLines={1}>
              {totalLabel}
            </Text>
          </View>
        </View>
      </View>

      <View className="gap-2.5">
        {slices.map((s) => (
          <View key={s.id} className="flex-row items-center gap-2.5">
            <View className="h-3 w-3 rounded-sm" style={{ backgroundColor: s.color }} />
            <Text className="min-w-0 flex-1 text-[13px] font-semibold text-ink" numberOfLines={1}>
              {s.shortName}
            </Text>
            <Text className="text-[12px] font-medium text-muted">{inr(s.value)}</Text>
            <Text className="w-11 text-right text-[13px] font-bold text-ink">{s.pct}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Donut: collected vs balance (or any slices). */
export function DonutChart({
  slices,
  size = 160,
  stroke = 22,
  centerLabel,
  centerValue,
}: {
  slices: Slice[];
  size?: number;
  stroke?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = slices.reduce((a, s) => a + Math.max(0, s.value), 0) || 1;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;

  const arcs = useMemo(() => {
    let angle = 0;
    return slices
      .filter((s) => s.value > 0)
      .map((s) => {
        const sweep = (s.value / total) * 360;
        const start = angle;
        const end = angle + Math.max(sweep, 0.01);
        angle = end;
        return { ...s, start, end, path: arcPath(cx, cy, r, start, end) };
      });
  }, [slices, total, cx, cy, r]);

  const single = arcs.length === 1;

  return (
    <View style={{ width: size, height: size, alignSelf: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={colors.borderSoft}
          strokeWidth={stroke}
          fill="none"
        />
        {single ? (
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            stroke={arcs[0].color}
            strokeWidth={stroke}
            fill="none"
          />
        ) : (
          <G>
            {arcs.map((a) => (
              <Path
                key={a.label}
                d={a.path}
                stroke={a.color}
                strokeWidth={stroke}
                fill="none"
                strokeLinecap="butt"
              />
            ))}
          </G>
        )}
      </Svg>
      {(centerValue || centerLabel) && (
        <View className="absolute inset-0 items-center justify-center px-3">
          {centerValue ? (
            <Text className="text-center text-base font-bold tracking-tight text-ink" numberOfLines={1}>
              {centerValue}
            </Text>
          ) : null}
          {centerLabel ? (
            <Text className="mt-0.5 text-center text-[11px] font-medium text-muted">{centerLabel}</Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

/** Horizontal bars comparing each scheme's budget / collected / balance. */
export function SchemeCompareBars({
  items,
}: {
  items: {
    id: string;
    name: string;
    color: string;
    target: number;
    collected: number;
    pending: number;
  }[];
}) {
  const max = Math.max(...items.map((i) => i.target), 1);

  return (
    <View className="gap-4">
      {items.map((item) => {
        const collectedW = Math.min(100, (item.collected / max) * 100);
        const pendingW = Math.min(100 - collectedW, (item.pending / max) * 100);
        const shortName = item.name.replace(/^Diwali\s+/i, '');
        return (
          <View key={item.id} className="gap-1.5">
            <View className="flex-row items-center justify-between gap-2">
              <View className="min-w-0 flex-1 flex-row items-center gap-2">
                <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <Text className="flex-1 text-[13px] font-semibold text-ink" numberOfLines={1}>
                  {shortName}
                </Text>
              </View>
              <Text className="text-[12px] font-medium text-muted">Budget {inr(item.target)}</Text>
            </View>
            <View className="h-3.5 flex-row overflow-hidden rounded-md bg-mutedbg">
              {collectedW > 0 ? (
                <View
                  className="h-full"
                  style={{ width: `${collectedW}%`, backgroundColor: item.color }}
                />
              ) : null}
              {pendingW > 0 ? (
                <View
                  className="h-full opacity-35"
                  style={{ width: `${pendingW}%`, backgroundColor: item.color }}
                />
              ) : null}
            </View>
            <View className="flex-row flex-wrap gap-x-3">
              <Text className="text-[11px] font-medium text-muted">
                Collected {inr(item.collected)}
              </Text>
              <Text className="text-[11px] font-medium text-danger">
                Balance {inr(item.pending)}
              </Text>
            </View>
          </View>
        );
      })}
      <View className="flex-row flex-wrap gap-x-4 gap-y-1 pt-1">
        <LegendDot color={colors.ink} label="Solid = collected" solid />
        <LegendDot color={colors.ink} label="Faded = balance due" solid={false} />
      </View>
    </View>
  );
}

function LegendDot({
  color,
  label,
  solid,
}: {
  color: string;
  label: string;
  solid: boolean;
}) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View
        className="h-2.5 w-2.5 rounded-sm"
        style={{ backgroundColor: color, opacity: solid ? 1 : 0.35 }}
      />
      <Text className="text-[11px] font-medium text-muted">{label}</Text>
    </View>
  );
}
