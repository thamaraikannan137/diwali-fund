import React from 'react';
import { CreateSchemeSheet } from './CreateSchemeSheet';
import { AddMembersSheet } from './AddMembersSheet';
import { CollectPaymentSheet } from './CollectPaymentSheet';
import { MemberFormSheet } from './MemberFormSheet';

export function SheetHost() {
  return (
    <>
      <CreateSchemeSheet />
      <AddMembersSheet />
      <CollectPaymentSheet />
      <MemberFormSheet />
    </>
  );
}
