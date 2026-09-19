import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export type UserAttributes = {
  id: string;
  name: string;
  phone: string;
  passwordHash: string;
  createdAt?: Date;
  updatedAt?: Date;
};

type UserCreation = Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export class User extends Model<UserAttributes, UserCreation> implements UserAttributes {
  declare id: string;
  declare name: string;
  declare phone: string;
  declare passwordHash: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export function initUser(sequelize: Sequelize) {
  User.init(
    {
      id: { type: DataTypes.STRING, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      phone: { type: DataTypes.STRING(15), allowNull: false, unique: true },
      passwordHash: { type: DataTypes.STRING, allowNull: false },
    },
    { sequelize, tableName: 'users' },
  );
  return User;
}
