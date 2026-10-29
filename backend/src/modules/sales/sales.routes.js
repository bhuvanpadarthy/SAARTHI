import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { store } from '../../storage/store.js';
import { createDraftSaleSchema, confirmSaleSchema } from './sales.schema.js';

const router = Router();

router.use(authenticate);

// 1. Create a draft paper bill (Never changes stock!)
router.post(
  '/draft',
  requireRole(['owner', 'manager', 'cashier']),
  validate({ body: createDraftSaleSchema }),
  async (req, res, next) => {
    try {
      const draft = await store.createDraftSale({
        ...req.body,
        shop_id: req.shopId,
        created_by: req.user?.id,
      });

      res.status(201).json({
        success: true,
        message: 'Draft paper bill created. Stock has not been deducted.',
        data: draft,
      });
    } catch (err) {
      next(err);
    }
  }
);

// 2. Retrieve a draft or posted paper bill for review / print
router.get('/:id', async (req, res, next) => {
  try {
    const sale = await store.getSale(req.params.id, req.shopId);
    if (!sale) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SALE_NOT_FOUND',
          message: 'Sale record not found.',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: sale,
    });
  } catch (err) {
    next(err);
  }
});

// 3. Confirm paper bill atomically (Serialized row locks, stock deduction, idempotency)
router.post(
  '/:id/confirm',
  requireRole(['owner', 'manager', 'cashier']),
  validate({ body: confirmSaleSchema }),
  async (req, res, next) => {
    try {
      const idempotencyKey =
        req.body?.idempotency_key || req.headers['x-idempotency-key'] || null;

      const confirmedSale = await store.confirmSaleAtomic(
        req.shopId,
        req.params.id,
        idempotencyKey,
        req.user?.id
      );

      res.status(200).json({
        success: true,
        message: `Paper Bill #${confirmedSale.bill_number} confirmed. Stock and sales ledger updated atomically.`,
        data: confirmedSale,
      });
    } catch (err) {
      next(err);
    }
  }
);

// 4. Retrieve posted paper bills
router.get('/', async (req, res, next) => {
  try {
    const sales = await store.listSales(req.shopId, { status: req.query.status || 'confirmed' });
    res.status(200).json({
      success: true,
      data: sales,
      meta: {
        total: sales.length,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 5. Daily Sales Summary
router.get('/analytics/daily-summary', async (req, res, next) => {
  try {
    const sales = await store.listSales(req.shopId, { status: 'confirmed' });
    const todayStr = new Date().toISOString().split('T')[0];

    const todaySales = sales.filter((s) => s.created_at?.startsWith(todayStr));
    const totalRevenue = todaySales.reduce((acc, s) => acc + s.net_total, 0);
    const paymentBreakdown = todaySales.reduce((acc, s) => {
      acc[s.payment_mode] = (acc[s.payment_mode] || 0) + s.net_total;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        date: todayStr,
        total_revenue: totalRevenue,
        bills_count: todaySales.length,
        payment_breakdown: paymentBreakdown,
        recent_sales: todaySales.slice(0, 10),
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
