import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { store } from '../../storage/store.js';
import {
  createProductSchema,
  updateProductSchema,
  queryProductsSchema,
} from './products.schema.js';

const router = Router();

router.use(authenticate);

// List and search products
router.get('/', validate({ query: queryProductsSchema }), async (req, res, next) => {
  try {
    const products = await store.listProducts(req.shopId, req.query);
    res.status(200).json({
      success: true,
      data: products,
      meta: {
        total: products.length,
        shop_id: req.shopId,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Get product details
router.get('/:id', async (req, res, next) => {
  try {
    const product = await store.getProduct(req.params.id, req.shopId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product formulation not found.',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
});

// Create product
router.post(
  '/',
  requireRole(['owner', 'manager']),
  validate({ body: createProductSchema }),
  async (req, res, next) => {
    try {
      const product = await store.createProduct({
        ...req.body,
        shop_id: req.shopId,
        created_by: req.user?.id,
      });

      res.status(201).json({
        success: true,
        message: 'Product formulation created successfully.',
        data: product,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Update product
router.put(
  '/:id',
  requireRole(['owner', 'manager']),
  validate({ body: updateProductSchema }),
  async (req, res, next) => {
    try {
      const updated = await store.updateProduct(req.params.id, req.shopId, req.body);
      res.status(200).json({
        success: true,
        message: 'Product details updated.',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
