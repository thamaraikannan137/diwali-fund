import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

function parseISODate(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(value + 'T12:00:00');
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDisplay(value: string): string {
  const d = parseISODate(value);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function DateField({
  label,
  value,
  onChange,
  style,
}: {
  label?: string;
  value: string;
  onChange: (iso: string) => void;
  style?: ViewStyle;
}) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => parseISODate(value || toISODate(new Date())));
  const date = useMemo(() => parseISODate(value || toISODate(new Date())), [value]);

  useEffect(() => {
    if (open) setDraft(date);
  }, [open, date]);

  const close = () => setOpen(false);

  const confirm = () => {
    onChange(toISODate(draft));
    close();
  };

  const onAndroidChange = (event: DateTimePickerEvent, selected?: Date) => {
    setOpen(false);
    if (event.type === 'dismissed') return;
    if (selected) onChange(toISODate(selected));
  };

  if (Platform.OS === 'web') {
    return (
      <View className="gap-1.5" style={style}>
        {label ? (
          <Text className="text-[13px] font-semibold text-muted">{label}</Text>
        ) : null}
        <View className="h-[50px] justify-center rounded-md border border-border bg-input px-4">
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 16,
              color: colors.ink,
              fontFamily: 'inherit',
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <View className="gap-1.5" style={style}>
      {label ? (
        <Text className="text-[13px] font-semibold text-muted">{label}</Text>
      ) : null}
      <Pressable
        onPress={() => setOpen(true)}
        className="h-[50px] justify-center rounded-md border border-border bg-input px-4"
      >
        <Text className="text-base text-ink">
          {value ? formatDisplay(value) : 'Select date'}
        </Text>
      </Pressable>

      {/* Android: system dialog — only one can show at a time */}
      {Platform.OS === 'android' && open ? (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onAndroidChange}
        />
      ) : null}

      {/* iOS: bottom sheet modal so fields stay visible and never overlap */}
      {Platform.OS === 'ios' ? (
        <Modal
          visible={open}
          transparent
          animationType="slide"
          onRequestClose={close}
        >
          <View className="flex-1 justify-end">
            <Pressable className="absolute inset-0 bg-ink/40" onPress={close} />
            <View
              className="rounded-t-[22px] bg-white px-4 pt-3"
              style={{ paddingBottom: Math.max(16, insets.bottom + 8) }}
            >
              <View className="mb-2 flex-row items-center justify-between">
                <Pressable onPress={close} hitSlop={12} className="px-2 py-2">
                  <Text className="text-[16px] font-medium text-muted">Cancel</Text>
                </Pressable>
                <Text className="text-[15px] font-semibold text-ink">
                  {label || 'Select date'}
                </Text>
                <Pressable onPress={confirm} hitSlop={12} className="px-2 py-2">
                  <Text className="text-[16px] font-semibold text-brand">Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={draft}
                mode="date"
                display="spinner"
                themeVariant="light"
                onChange={(_e, selected) => {
                  if (selected) setDraft(selected);
                }}
                style={{ alignSelf: 'center' }}
              />
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}
