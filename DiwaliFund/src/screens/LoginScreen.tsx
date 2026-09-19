import React, { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFund } from '../context/FundContext';
import { Field, PrimaryButton, Screen } from '../components/ui';
import { colors } from '../theme/colors';

export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login, authBusy, booting } = useFund();
  const [phone, setPhone] = useState('9876543210');
  const [pw, setPw] = useState('diwali123');
  const [error, setError] = useState<string | null>(null);

  const onLogin = async () => {
    setError(null);
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setError('Enter a valid 10-digit phone number');
      return;
    }
    if (pw.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }
    try {
      await login(digits, pw);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
    }
  };

  if (booting) {
    return (
      <Screen className="items-center justify-center bg-white">
        <ActivityIndicator size="large" color={colors.blue} />
        <Text className="mt-3 text-[14px] text-muted">Loading…</Text>
      </Screen>
    );
  }

  return (
    <Screen
      className="justify-center gap-7 bg-white px-7"
      style={{ paddingTop: insets.top + 48, paddingBottom: insets.bottom + 24 }}
    >
      <View className="items-center gap-3.5">
        <View className="h-[72px] w-[72px] items-center justify-center rounded-[24px] bg-amber-soft">
          <Ionicons name="flame" size={34} color={colors.amber} />
        </View>
        <Text className="text-center text-[28px] font-bold tracking-tight text-ink">
          Diwali Fund <Text className="text-amber">2026</Text>
        </Text>
        <Text className="-mt-1.5 text-[15px] text-muted">Manage your fund simply.</Text>
      </View>

      <View className="gap-3">
        <Field
          placeholder="Phone number"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          editable={!authBusy}
          className="h-[54px] rounded-lg text-base"
        />
        <Field
          placeholder="Password"
          secureTextEntry
          value={pw}
          onChangeText={setPw}
          editable={!authBusy}
          className="h-[54px] rounded-lg text-base"
        />
        {error ? <Text className="text-[13px] font-medium text-danger">{error}</Text> : null}
        <PrimaryButton
          label={authBusy ? 'Signing in…' : 'Login'}
          onPress={() => {
            void onLogin();
          }}
          disabled={authBusy}
          className="mt-1"
        />
      </View>

      <Text className="text-center text-[13px] text-faint">
        Demo: 9876543210 / diwali123
      </Text>
    </Screen>
  );
}
