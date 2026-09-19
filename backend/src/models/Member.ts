import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export type MemberAttributes = {
  id: string;
  name: string;
  phone: string;
  createdAt?: Date;
  updatedAt?: Date;
};

type MemberCreation = Optional<MemberAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export class Member extends Model<MemberAttributes, MemberCreation> implements MemberAttributes {
  declare id: string;
  declare name: string;
  declare phone: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export function initMember(sequelize: Sequelize) {
  Member.init(
    {
      id: { type: DataTypes.STRING, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      phone: { type: DataTypes.STRING(15), allowNull: false, unique: true },
    },
    { sequelize, tableName: 'members' },
  );
  return Member;
}
