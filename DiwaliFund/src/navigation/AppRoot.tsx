import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FundProvider, useFund } from '../context/FundContext';
import { LoginScreen } from '../screens/LoginScreen';
import { MainTabs } from './MainTabs';
import { SheetHost } from '../sheets/SheetHost';
import { Toast } from '../components/Toast';

function Root() {
  const { authenticated, booting } = useFund();
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      {booting || !authenticated ? <LoginScreen /> : <MainTabs />}
      <SheetHost />
      <Toast />
    </View>
  );
}

export function AppRoot() {
  return (
    <SafeAreaProvider>
      <FundProvider>
        <Root />
      </FundProvider>
    </SafeAreaProvider>
  );
}
