import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export type MembershipAttributes = {
  id: string;
  memberId: string;
  schemeId: string;
  units: number;
  createdAt?: Date;
  updatedAt?: Date;
};

type MembershipCreation = Optional<MembershipAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export class Membership
  extends Model<MembershipAttributes, MembershipCreation>
  implements MembershipAttributes
{
  declare id: string;
  declare memberId: string;
  declare schemeId: string;
  declare units: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export function initMembership(sequelize: Sequelize) {
  Membership.init(
    {
      id: { type: DataTypes.STRING, primaryKey: true },
      memberId: { type: DataTypes.STRING, allowNull: false },
      schemeId: { type: DataTypes.STRING, allowNull: false },
      units: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    },
    { sequelize, tableName: 'memberships' },
  );
  return Membership;
}
