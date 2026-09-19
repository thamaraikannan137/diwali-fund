import React from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { colors } from '../theme/colors';

export function Screen({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}) {
  return (
    <View className={`flex-1 bg-bg ${className ?? ''}`} style={style}>
      {children}
    </View>
  );
}

export function Avatar({
  initials,
  color,
  size = 42,
  radius = 14,
}: {
  initials: string;
  color: string;
  size?: number;
  radius?: number;
}) {
  return (
    <View
      className="items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: color + '18',
      }}
    >
      <Text
        className="font-bold"
        style={{ color, fontSize: size * 0.33 }}
      >
        {initials}
      </Text>
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  danger,
  style,
  className,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  danger?: boolean;
  style?: StyleProp<ViewStyle>;
  className?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`h-[54px] items-center justify-center rounded-lg ${
        danger ? 'bg-danger' : 'bg-brand'
      } ${disabled ? 'opacity-45' : ''} ${className ?? ''}`}
      style={style}
    >
      <Text className="text-base font-semibold text-white">{label}</Text>
    </Pressable>
  );
}

export function SoftButton({
  label,
  onPress,
  style,
  className,
}: {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`h-[52px] items-center justify-center rounded-lg bg-hair px-[18px] ${className ?? ''}`}
      style={style}
    >
      <Text className="text-[15px] font-semibold text-ink">{label}</Text>
    </Pressable>
  );
}

export function Field({
  label,
  style,
  className,
  ...props
}: { label?: string; className?: string } & TextInputProps) {
  return (
    <View className="gap-1.5">
      {label ? (
        <Text className="text-[13px] font-semibold text-muted">{label}</Text>
      ) : null}
      <TextInput
        placeholderTextColor={colors.faint}
        className={`h-[50px] rounded-md border border-border bg-input px-4 text-base text-ink ${className ?? ''}`}
        style={style}
        {...props}
      />
    </View>
  );
}

export function Segmented({
  options,
  value,
  onChange,
}: {
  options: { key: string; label: string }[];
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 8,
        borderRadius: 14,
        backgroundColor: colors.bgMuted,
        padding: 4,
      }}
    >
      {options.map((o) => {
        const on = o.key === value;
        return (
          <Pressable
            key={o.key}
            onPress={() => onChange(o.key)}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            style={{
              height: 38,
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 11,
              backgroundColor: on ? colors.white : 'transparent',
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: on ? colors.ink : colors.muted,
              }}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ChoiceRow({
  options,
  value,
  onChange,
}: {
  options: { key: string; label: string }[];
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {options.map((o) => {
        const on = o.key === value;
        return (
          <Pressable
            key={o.key}
            onPress={() => onChange(o.key)}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            style={{
              height: 46,
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 13,
              borderWidth: 1.5,
              borderColor: on ? colors.blue : colors.border,
              backgroundColor: on ? colors.blueSoft : colors.white,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: on ? colors.blue : colors.ink,
              }}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <View className="items-center p-7">
      <Text className="text-sm text-faint">{text}</Text>
    </View>
  );
}
