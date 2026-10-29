import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { store } from '../../storage/store.js';
import { createCustomerSchema, customerPaymentSchema } from './customers.schema.js';

const router = Router();

router.use(authenticate);

// List customers & Khata balances
router.get('/', async (req, res, next) => {
  try {
    const customers = await store.listCustomers(req.shopId, req.query);
    const totalOutstanding = customers.reduce((acc, c) => acc + (c.outstanding_balance || 0), 0);

    res.status(200).json({
      success: true,
      data: customers,
      meta: {
        total: customers.length,
        total_outstanding_khata: totalOutstanding,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Get customer details
router.get('/:id', async (req, res, next) => {
  try {
    const customer = await store.getCustomer(req.params.id, req.shopId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CUSTOMER_NOT_FOUND',
          message: 'Customer record not found.',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (err) {
    next(err);
  }
});

// Get complete customer purchase dossier & buying history
router.get('/:id/purchases', async (req, res, next) => {
  try {
    const dossier = await store.getCustomerPurchases(req.params.id, req.shopId);
    res.status(200).json({
      success: true,
      data: dossier,
    });
  } catch (err) {
    next(err);
  }
});

// Create new customer account
router.post(
  '/',
  requireRole(['owner', 'manager', 'cashier']),
  validate({ body: createCustomerSchema }),
  async (req, res, next) => {
    try {
      const customer = await store.createCustomer({
        ...req.body,
        shop_id: req.shopId,
      });

      res.status(201).json({
        success: true,
        message: `Customer account "${customer.name}" created.`,
        data: customer,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Record customer payment (Khata credit settlement)
router.post(
  '/:id/payments',
  requireRole(['owner', 'manager', 'cashier']),
  validate({ body: customerPaymentSchema }),
  async (req, res, next) => {
    try {
      const { amount, payment_mode, reference_no, notes } = req.body;
      const payment = await store.recordCustomerPayment(
        req.shopId,
        req.params.id,
        amount,
        payment_mode,
        reference_no,
        notes,
        req.user?.id
      );

      res.status(201).json({
        success: true,
        message: `Payment of ${amount} recorded successfully. Customer Khata ledger updated.`,
        data: payment,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
