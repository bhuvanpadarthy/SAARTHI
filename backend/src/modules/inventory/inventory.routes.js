import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { store } from '../../storage/store.js';
import {
  receiveStockSchema,
  damageStockSchema,
  reversalSchema,
} from './inventory.schema.js';

const router = Router();

router.use(authenticate);

// Get current inventory balances derived with movement aggregates
router.get('/balances', async (req, res, next) => {
  try {
    const balances = await store.getInventoryBalances(req.shopId);
    res.status(200).json({
      success: true,
      data: balances,
    });
  } catch (err) {
    next(err);
  }
});

// Get stock movement history / audit ledger
router.get('/movements', async (req, res, next) => {
  try {
    const productId = req.query.product_id;
    const movements = await store.getStockMovements(req.shopId, productId);
    res.status(200).json({
      success: true,
      data: movements,
      meta: {
        total: movements.length,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Receive inward stock from depot
router.post(
  '/receive',
  requireRole(['owner', 'manager', 'cashier']),
  validate({ body: receiveStockSchema }),
  async (req, res, next) => {
    try {
      const { product_id, quantity, invoice_no, notes } = req.body;
      const result = await store.receiveStock(
        req.shopId,
        product_id,
        quantity,
        invoice_no,
        notes,
        req.user?.id
      );

      res.status(201).json({
        success: true,
        message: `Successfully received ${quantity} units into stock.`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Record damaged or leakage paint stock
router.post(
  '/damage',
  requireRole(['owner', 'manager']),
  validate({ body: damageStockSchema }),
  async (req, res, next) => {
    try {
      const { product_id, quantity, reason } = req.body;
      const result = await store.recordDamaged(
        req.shopId,
        product_id,
        quantity,
        reason,
        req.user?.id
      );

      res.status(201).json({
        success: true,
        message: `Recorded ${quantity} units as damaged. Stock balance adjusted.`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Audited reversal for erroneous entries
router.post(
  '/reversal',
  requireRole(['owner']),
  validate({ body: reversalSchema }),
  async (req, res, next) => {
    try {
      const { movement_id, reason } = req.body;
      const result = await store.recordReversal(
        req.shopId,
        movement_id,
        reason,
        req.user?.id
      );

      res.status(200).json({
        success: true,
        message: 'Audited stock reversal recorded successfully.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
