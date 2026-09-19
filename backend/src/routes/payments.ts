import { Router } from 'express';
import { z } from 'zod';
import { Payment } from '../models/Payment';
import { Membership } from '../models/Membership';
import { HttpError } from '../middleware/error';

const router = Router();

const paymentSchema = z.object({
  msId: z.string().min(1),
  amount: z.number().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  method: z.enum(['CASH', 'GPAY']),
});

router.get('/', async (req, res, next) => {
  try {
    const where: Record<string, string> = {};
    if (typeof req.query.msId === 'string') where.msId = req.query.msId;
    const payments = await Payment.findAll({
      where,
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
    });
    res.json(payments);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) throw new HttpError(404, 'Payment not found');
    res.json(payment);
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const body = paymentSchema.parse({
      ...req.body,
      amount: Number(req.body.amount),
    });
    const ms = await Membership.findByPk(body.msId);
    if (!ms) throw new HttpError(404, 'Membership not found');

    const payment = await Payment.create({
      id: 'p' + Date.now(),
      msId: body.msId,
      amount: body.amount,
      date: body.date,
      method: body.method,
    });
    res.status(201).json(payment);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const body = paymentSchema.omit({ msId: true }).partial().extend({
      amount: z.number().positive().optional(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      method: z.enum(['CASH', 'GPAY']).optional(),
    }).parse({
      ...req.body,
      amount: req.body.amount !== undefined ? Number(req.body.amount) : undefined,
    });

    const payment = await Payment.findByPk(req.params.id);
    if (!payment) throw new HttpError(404, 'Payment not found');
    await payment.update(body);
    res.json(payment);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) throw new HttpError(404, 'Payment not found');
    await payment.destroy();
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
