import React from 'react';
import { Text, View } from 'react-native';
import { BottomSheet } from '../components/BottomSheet';
import { Field, PrimaryButton } from '../components/ui';
import { useFund } from '../context/FundContext';

export function MemberFormSheet() {
  const { sheet, mf, setMf, members, saveMember, closeSheet } = useFund();
  const visible = sheet === 'memberForm';
  const phone = (mf.phone || '').replace(/\D/g, '');
  const dup =
    phone.length >= 10 && members.some((m) => m.phone === phone && m.id !== mf.id);
  const disabled =
    !(mf.name && mf.name.trim().length > 1 && phone.length === 10) || dup;

  return (
    <BottomSheet
      visible={visible}
      onClose={closeSheet}
      title={mf.id ? 'Edit member' : 'New member'}
    >
      <View className="gap-[18px] pb-2">
        <Field
          label="Full name"
          placeholder="e.g. Ravi Kumar"
          value={mf.name}
          onChangeText={(name) => setMf({ name })}
        />
        <Field
          label="Phone"
          placeholder="10-digit mobile"
          keyboardType="phone-pad"
          value={mf.phone}
          onChangeText={(phone) =>
            setMf({ phone: phone.replace(/\D/g, '').slice(0, 10) })
          }
        />
        {dup ? (
          <View className="rounded-[10px] bg-amber-bg px-3 py-2">
            <Text className="text-[13px] font-medium text-amber-text">
              A member with this phone already exists.
            </Text>
          </View>
        ) : null}
        <PrimaryButton
          label={mf.id ? 'Save changes' : 'Add member'}
          onPress={saveMember}
          disabled={disabled}
        />
      </View>
    </BottomSheet>
  );
}
