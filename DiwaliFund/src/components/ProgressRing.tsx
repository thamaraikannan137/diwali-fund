import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export function ProgressRing({
  pct,
  color,
  size = 72,
}: {
  pct: number;
  color: string;
  size?: number;
}) {
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(100, Math.max(0, pct)) / 100);
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#EEF1F5"
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={offset}
        />
      </Svg>
      <View className="absolute inset-0 items-center justify-center">
        <Text className="text-sm font-bold tracking-tight text-ink">{pct}%</Text>
      </View>
    </View>
  );
}
