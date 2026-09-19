import React, { useEffect } from 'react';
import { Animated, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFund } from '../context/FundContext';

export function Toast() {
  const { toast } = useFund();
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toast) {
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    } else {
      Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }).start();
    }
  }, [toast, opacity]);

  if (!toast) return null;

  return (
    <Animated.View
      className="absolute bottom-[100px] z-[100] flex-row items-center gap-2 self-center rounded-md bg-ink px-[18px] py-3 shadow-lg"
      style={{ opacity }}
      pointerEvents="none"
    >
      <Ionicons name="checkmark" size={16} color="#4ADE80" />
      <Text className="text-sm font-medium text-white">{toast}</Text>
    </Animated.View>
  );
}
