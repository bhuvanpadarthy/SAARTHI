import { Router } from 'express';
import healthRoutes from './modules/health/health.routes.js';
import productsRoutes from './modules/products/products.routes.js';
import inventoryRoutes from './modules/inventory/inventory.routes.js';
import salesRoutes from './modules/sales/sales.routes.js';
import customersRoutes from './modules/customers/customers.routes.js';
import reportsRoutes from './modules/reports/reports.routes.js';
import shopsRoutes from './modules/shops/shops.routes.js';

const router = Router();

router.use('/', healthRoutes);
router.use('/products', productsRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/sales', salesRoutes);
router.use('/customers', customersRoutes);
router.use('/reports', reportsRoutes);
router.use('/settings', shopsRoutes);

export default router;
