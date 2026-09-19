import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFund } from '../context/FundContext';
import { HomeScreen } from '../screens/HomeScreen';
import { SchemesScreen } from '../screens/SchemesScreen';
import { SchemeDetailScreen } from '../screens/SchemeDetailScreen';
import { MembersScreen } from '../screens/MembersScreen';
import { MemberDetailScreen } from '../screens/MemberDetailScreen';
import { MembershipDetailScreen } from '../screens/MembershipDetailScreen';
import { CollectScreen } from '../screens/CollectScreen';
import { SummaryScreen } from '../screens/SummaryScreen';
import { colors } from '../theme/colors';

const TABS = [
  { key: 'home' as const, label: 'Home', icon: 'home' as const, iconOutline: 'home-outline' as const },
  { key: 'schemes' as const, label: 'Schemes', icon: 'list' as const, iconOutline: 'list-outline' as const },
  { key: 'collect' as const, label: 'Collect', icon: 'wallet' as const, iconOutline: 'wallet-outline' as const },
  { key: 'members' as const, label: 'Members', icon: 'people' as const, iconOutline: 'people-outline' as const },
];

function HomePane() {
  const { summaryOpen } = useFund();
  return summaryOpen ? <SummaryScreen /> : <HomeScreen />;
}

function SchemesPane() {
  const { schemeId, membershipOpen } = useFund();
  if (membershipOpen) return <MembershipDetailScreen />;
  if (schemeId) return <SchemeDetailScreen />;
  return <SchemesScreen />;
}

function MembersPane() {
  const { memberId, membershipOpen } = useFund();
  if (membershipOpen) return <MembershipDetailScreen />;
  if (memberId) return <MemberDetailScreen />;
  return <MembersScreen />;
}

function CollectPane() {
  const { membershipOpen } = useFund();
  if (membershipOpen) return <MembershipDetailScreen />;
  return <CollectScreen />;
}

export function MainTabs() {
  const insets = useSafeAreaInsets();
  const { tab, goTab } = useFund();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1 }} pointerEvents="box-none">
        {tab === 'home' ? <HomePane /> : null}
        {tab === 'schemes' ? <SchemesPane /> : null}
        {tab === 'collect' ? <CollectPane /> : null}
        {tab === 'members' ? <MembersPane /> : null}
      </View>

      <View
        style={{
          flexDirection: 'row',
          borderTopWidth: 1,
          borderTopColor: colors.borderSoft,
          backgroundColor: colors.white,
          paddingTop: 6,
          paddingBottom: Math.max(10, insets.bottom),
          paddingHorizontal: 4,
          zIndex: 100,
          elevation: 12,
        }}
      >
        {TABS.map((t) => {
          const focused = tab === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => goTab(t.key)}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 4,
                minHeight: 48,
              }}
            >
              <View
                style={{
                  height: 30,
                  width: 52,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 999,
                  backgroundColor: focused ? colors.blueSoft : 'transparent',
                }}
              >
                <Ionicons
                  name={focused ? t.icon : t.iconOutline}
                  size={20}
                  color={focused ? colors.blue : colors.muted}
                />
              </View>
              <Text
                style={{
                  marginTop: 2,
                  fontSize: 11.5,
                  fontWeight: '600',
                  color: focused ? colors.blue : colors.muted,
                }}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
