import { Sequelize } from 'sequelize';
import { env } from '../config/env';
import { initUser, User } from './User';
import { initMember, Member } from './Member';
import { initScheme, Scheme } from './Scheme';
import { initMembership, Membership } from './Membership';
import { initPayment, Payment } from './Payment';

const isLocalDb =
  /localhost|127\.0\.0\.1/.test(env.databaseUrl) || !/sslmode=require/i.test(env.databaseUrl);

export const sequelize = new Sequelize(env.databaseUrl, {
  dialect: 'postgres',
  logging: env.nodeEnv === 'development' ? console.log : false,
  dialectOptions: isLocalDb
    ? {}
    : {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
});

initUser(sequelize);
initMember(sequelize);
initScheme(sequelize);
initMembership(sequelize);
initPayment(sequelize);

Member.hasMany(Membership, { foreignKey: 'memberId', as: 'memberships', onDelete: 'CASCADE' });
Membership.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

Scheme.hasMany(Membership, { foreignKey: 'schemeId', as: 'memberships', onDelete: 'CASCADE' });
Membership.belongsTo(Scheme, { foreignKey: 'schemeId', as: 'scheme' });

Membership.hasMany(Payment, { foreignKey: 'msId', as: 'payments', onDelete: 'CASCADE' });
Payment.belongsTo(Membership, { foreignKey: 'msId', as: 'membership' });

export const models = { User, Member, Scheme, Membership, Payment };

export async function connectDb() {
  await sequelize.authenticate();
  await sequelize.sync();
}
