import React, { useMemo } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from '../components/BottomSheet';
import { PrimaryButton } from '../components/ui';
import { useFund } from '../context/FundContext';
import { colors } from '../theme/colors';

export function AddMembersSheet() {
  const {
    sheet,
    schemes,
    schemeId,
    members,
    rows,
    sel,
    setSel,
    addSearch,
    setAddSearch,
    addToScheme,
    closeSheet,
  } = useFund();
  const visible = sheet === 'add';
  const scheme = schemes.find((s) => s.id === schemeId);
  const inScheme = useMemo(
    () => new Set(rows.filter((r) => r.schemeId === schemeId).map((r) => r.memberId)),
    [rows, schemeId],
  );

  const list = useMemo(() => {
    const aq = addSearch.trim().toLowerCase();
    return members.filter(
      (m) => !inScheme.has(m.id) && (!aq || m.name.toLowerCase().includes(aq)),
    );
  }, [members, inScheme, addSearch]);

  const selCount = Object.keys(sel).length;

  return (
    <BottomSheet
      visible={visible}
      onClose={closeSheet}
      title="Add members"
      subtitle={scheme?.name}
    >
      <View className="relative mb-3.5">
        <Ionicons
          name="search"
          size={18}
          color={colors.faint}
          style={{ position: 'absolute', left: 14, top: 14, zIndex: 1 }}
        />
        <TextInput
          value={addSearch}
          onChangeText={setAddSearch}
          placeholder="Search members…"
          placeholderTextColor={colors.faint}
          className="h-[46px] rounded-md border border-border bg-input pl-[42px] pr-4 text-[15px] text-ink"
        />
      </View>

      <ScrollView
        className="max-h-[280px] rounded-lg border border-hair"
        keyboardShouldPersistTaps="handled"
      >
        {list.map((m) => {
          const units = sel[m.id];
          const selected = !!units;
          return (
            <Pressable
              key={m.id}
              className="flex-row items-center gap-3 border-b border-hair bg-white px-3.5 py-3"
              onPress={() =>
                setSel((s) => {
                  const next = { ...s };
                  if (next[m.id]) delete next[m.id];
                  else next[m.id] = 1;
                  return next;
                })
              }
            >
              <View
                className={`h-6 w-6 items-center justify-center rounded-lg border-2 ${
                  selected ? 'border-brand bg-brand' : 'border-slate bg-white'
                }`}
              >
                {selected ? (
                  <Ionicons name="checkmark" size={14} color={colors.white} />
                ) : null}
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-semibold text-ink">{m.name}</Text>
                <Text className="text-[12.5px] text-muted">{m.phone}</Text>
              </View>
              {selected ? (
                <View className="flex-row items-center gap-1.5">
                  <Pressable
                    className="h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-hair"
                    onPress={(e) => {
                      e.stopPropagation?.();
                      setSel((s) => ({
                        ...s,
                        [m.id]: Math.max(1, (s[m.id] || 1) - 1),
                      }));
                    }}
                  >
                    <Text className="text-base font-bold text-ink">−</Text>
                  </Pressable>
                  <Text className="min-w-[22px] text-center font-bold text-ink">{units}</Text>
                  <Pressable
                    className="h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-hair"
                    onPress={(e) => {
                      e.stopPropagation?.();
                      setSel((s) => ({
                        ...s,
                        [m.id]: (s[m.id] || 1) + 1,
                      }));
                    }}
                  >
                    <Text className="text-base font-bold text-ink">+</Text>
                  </Pressable>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>

      <PrimaryButton
        label={
          selCount
            ? `Add ${selCount} member${selCount > 1 ? 's' : ''}`
            : 'Select members'
        }
        onPress={addToScheme}
        disabled={!selCount}
        className="mt-3.5"
      />
    </BottomSheet>
  );
}
