import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function BottomSheet({
  visible,
  onClose,
  children,
  title,
  subtitle,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-ink/45" onPress={onClose} />
        <View
          className="max-h-[88%] rounded-t-[26px] bg-white px-5 pt-3"
          style={{ paddingBottom: Math.max(28, insets.bottom + 12) }}
        >
          <View className="mb-4 h-1 w-10 self-center rounded-sm bg-border" />
          {title ? (
            <View className="mb-[18px] gap-1">
              <Text className="text-xl font-bold text-ink">{title}</Text>
              {subtitle ? (
                <Text className="text-[13.5px] text-muted">{subtitle}</Text>
              ) : null}
            </View>
          ) : null}
          {children}
        </View>
      </View>
    </Modal>
  );
}
