import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export type SchemeType = 'WEEKLY' | 'MONTHLY';

export type SchemeAttributes = {
  id: string;
  name: string;
  type: SchemeType;
  unit: number;
  start: string;
  end: string;
  color: string;
  createdAt?: Date;
  updatedAt?: Date;
};

type SchemeCreation = Optional<SchemeAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export class Scheme extends Model<SchemeAttributes, SchemeCreation> implements SchemeAttributes {
  declare id: string;
  declare name: string;
  declare type: SchemeType;
  declare unit: number;
  declare start: string;
  declare end: string;
  declare color: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export function initScheme(sequelize: Sequelize) {
  Scheme.init(
    {
      id: { type: DataTypes.STRING, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      type: { type: DataTypes.ENUM('WEEKLY', 'MONTHLY'), allowNull: false },
      unit: { type: DataTypes.FLOAT, allowNull: false },
      start: { type: DataTypes.STRING(10), allowNull: false },
      end: { type: DataTypes.STRING(10), allowNull: false },
      color: { type: DataTypes.STRING(16), allowNull: false },
    },
    { sequelize, tableName: 'schemes' },
  );
  return Scheme;
}
