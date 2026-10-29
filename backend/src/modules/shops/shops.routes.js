import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { store } from '../../storage/store.js';
import { updateShopSettingsSchema } from './shops.schema.js';

const router = Router();

router.use(authenticate);

// Get current shop profile & preferences
router.get('/', async (req, res, next) => {
  try {
    const shop = await store.getShop(req.shopId);
    res.status(200).json({
      success: true,
      data: shop,
    });
  } catch (err) {
    next(err);
  }
});

// Update shop settings
router.put(
  '/',
  requireRole(['owner', 'manager']),
  validate({ body: updateShopSettingsSchema }),
  async (req, res, next) => {
    try {
      const updated = await store.updateShop(req.shopId, req.body);
      res.status(200).json({
        success: true,
        message: 'Shop settings and paper bill sequence updated.',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
