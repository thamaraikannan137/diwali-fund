import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export type PayMethod = 'CASH' | 'GPAY';

export type PaymentAttributes = {
  id: string;
  msId: string;
  amount: number;
  date: string;
  method: PayMethod;
  createdAt?: Date;
  updatedAt?: Date;
};

type PaymentCreation = Optional<PaymentAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export class Payment extends Model<PaymentAttributes, PaymentCreation> implements PaymentAttributes {
  declare id: string;
  declare msId: string;
  declare amount: number;
  declare date: string;
  declare method: PayMethod;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export function initPayment(sequelize: Sequelize) {
  Payment.init(
    {
      id: { type: DataTypes.STRING, primaryKey: true },
      msId: { type: DataTypes.STRING, allowNull: false },
      amount: { type: DataTypes.FLOAT, allowNull: false },
      date: { type: DataTypes.STRING(10), allowNull: false },
      method: { type: DataTypes.ENUM('CASH', 'GPAY'), allowNull: false },
    },
    { sequelize, tableName: 'payments' },
  );
  return Payment;
}
