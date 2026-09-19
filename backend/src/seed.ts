import bcrypt from 'bcryptjs';
import { connectDb, sequelize } from './models';
import { User } from './models/User';
import { Member } from './models/Member';
import { Scheme } from './models/Scheme';
import { Membership } from './models/Membership';
import { Payment } from './models/Payment';

function periods(s: { type: string; start: string; end: string }, now = new Date()) {
  const st = new Date(s.start);
  const en = new Date(s.end);
  let total: number;
  let elapsed: number;
  if (s.type === 'WEEKLY') {
    total = Math.round((en.getTime() - st.getTime()) / 6048e5);
    elapsed = Math.floor((now.getTime() - st.getTime()) / 6048e5) + 1;
  } else {
    total = (en.getFullYear() - st.getFullYear()) * 12 + en.getMonth() - st.getMonth() + 1;
    elapsed =
      (now.getFullYear() - st.getFullYear()) * 12 + now.getMonth() - st.getMonth() + 1;
  }
  total = Math.max(1, total);
  return { total, elapsed: Math.max(0, Math.min(total, elapsed)) };
}

async function seed() {
  await connectDb();
  await sequelize.sync({ force: true });

  const passwordHash = await bcrypt.hash('diwali123', 10);
  await User.create({
    id: 'u1',
    name: 'Collector',
    phone: '9876543210',
    passwordHash,
  });

  const names = [
    'Ravi Kumar',
    'Kumar',
    'Suresh',
    'Mani',
    'Priya',
    'Arun',
    'Vijay',
    'Bala',
    'Dinesh',
    'Mohan',
    'Raj',
    'Selvam',
    'Karthik',
    'Sathish',
    'Prakash',
    'Gokul',
  ];

  const members = await Member.bulkCreate(
    names.map((n, i) => ({
      id: 'm' + i,
      name: n,
      phone: '98' + String(41000000 + i * 7919).padStart(8, '0'),
    })),
  );

  const schemes = await Scheme.bulkCreate([
    {
      id: 's1',
      name: 'Diwali Weekly 100',
      type: 'WEEKLY',
      unit: 100,
      start: '2026-01-05',
      end: '2026-11-08',
      color: '#E9A23B',
    },
    {
      id: 's2',
      name: 'Diwali Weekly 200',
      type: 'WEEKLY',
      unit: 200,
      start: '2026-01-05',
      end: '2026-11-08',
      color: '#1D4ED8',
    },
    {
      id: 's3',
      name: 'Diwali Monthly 500',
      type: 'MONTHLY',
      unit: 500,
      start: '2026-01-05',
      end: '2026-11-08',
      color: '#7C3AED',
    },
    {
      id: 's4',
      name: 'Diwali Monthly 1000',
      type: 'MONTHLY',
      unit: 1000,
      start: '2026-01-05',
      end: '2026-11-08',
      color: '#059669',
    },
  ]);

  const links: [number, number, number][] = [
    [0, 0, 2],
    [0, 1, 1],
    [0, 2, 3],
    [1, 0, 3],
    [2, 0, 1],
    [2, 3, 1],
    [3, 1, 2],
    [4, 2, 1],
    [5, 0, 1],
    [5, 2, 2],
    [6, 1, 1],
    [6, 3, 1],
    [7, 0, 2],
    [8, 2, 1],
    [9, 0, 1],
    [9, 1, 1],
    [10, 3, 2],
    [11, 0, 1],
    [12, 1, 1],
    [12, 2, 1],
    [13, 0, 2],
    [13, 3, 1],
    [14, 2, 2],
    [15, 0, 1],
    [15, 1, 2],
  ];

  const fr = [
    0.85, 1, 0.7, 1, 0.6, 0.95, 1, 0.5, 0.8, 1, 0.75, 0.9, 1, 0.65, 1, 0.55, 0.88, 1, 0.7, 1,
    0.92, 0.6, 1, 0.8, 0.5,
  ];

  const memberships = [];
  const payments = [];
  let pid = 0;

  for (let i = 0; i < links.length; i++) {
    const [mi, si, units] = links[i];
    const s = schemes[si];
    const id = 'ms' + i;
    memberships.push({ id, memberId: members[mi].id, schemeId: s.id, units });

    const per = periods(s);
    const k = Math.round(per.elapsed * fr[i]);
    for (let j = 0; j < k; j++) {
      const d = new Date(s.start);
      if (s.type === 'WEEKLY') d.setDate(d.getDate() + j * 7);
      else d.setMonth(d.getMonth() + j);
      d.setDate(d.getDate() + ((j + mi) % 4));
      payments.push({
        id: 'p' + pid++,
        msId: id,
        amount: s.unit * units,
        date: d.toISOString().slice(0, 10),
        method: (j + mi) % 3 === 0 ? ('CASH' as const) : ('GPAY' as const),
      });
    }
    if (fr[i] < 1 && i % 3 === 0) {
      payments.push({
        id: 'p' + pid++,
        msId: id,
        amount: (s.unit * units) / 2,
        date: '2026-09-16',
        method: 'GPAY' as const,
      });
    }
  }

  await Membership.bulkCreate(memberships);
  await Payment.bulkCreate(payments);

  console.log('Seed complete');
  console.log('Login: phone 9876543210 / password diwali123');
  console.log(`Members: ${members.length}, Schemes: ${schemes.length}`);
  console.log(`Memberships: ${memberships.length}, Payments: ${payments.length}`);
  await sequelize.close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
