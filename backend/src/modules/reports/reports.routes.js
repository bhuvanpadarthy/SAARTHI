import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { store } from '../../storage/store.js';

const router = Router();

router.use(authenticate);

// 1. Sales Summary Report
router.get('/sales-summary', async (req, res, next) => {
  try {
    const period = req.query.period || 'today';
    const sales = await store.listSales(req.shopId, { status: 'confirmed' });

    let filtered = sales;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (period === 'today') {
      filtered = sales.filter((s) => s.created_at?.startsWith(todayStr));
    }

    const totalRevenue = filtered.reduce((acc, s) => acc + s.net_total, 0);
    const paymentBreakdown = filtered.reduce((acc, s) => {
      acc[s.payment_mode] = (acc[s.payment_mode] || 0) + s.net_total;
      return acc;
    }, {});

    // Top selling paint products
    const itemMap = {};
    filtered.forEach((sale) => {
      sale.items?.forEach((it) => {
        const key = `${it.product_name}_${it.pack_size}_${it.shade_code}`;
        if (!itemMap[key]) {
          itemMap[key] = {
            name: it.product_name,
            brand: it.brand,
            shade_code: it.shade_code,
            pack_size: it.pack_size,
            quantity: 0,
            revenue: 0,
          };
        }
        itemMap[key].quantity += it.quantity;
        itemMap[key].revenue += it.total;
      });
    });

    const topItems = Object.values(itemMap).sort((a, b) => b.quantity - a.quantity);

    res.status(200).json({
      success: true,
      data: {
        period,
        total_revenue: totalRevenue,
        bills_count: filtered.length,
        payment_breakdown: paymentBreakdown,
        top_products: topItems,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 2. Low-Stock Reorder Procurement Report
router.get('/low-stock', async (req, res, next) => {
  try {
    const products = await store.listProducts(req.shopId);
    const lowStock = products.filter((p) => p.current_stock <= p.reorder_threshold);

    let totalEstCost = 0;
    const items = lowStock.map((p) => {
      const suggestedUnits = Math.max(8, Math.round(p.reorder_threshold * 2 - p.current_stock));
      const estUnitCost = p.cost_price > 0 ? p.cost_price : p.selling_price * 0.82;
      const totalCost = Math.round(suggestedUnits * estUnitCost);
      totalEstCost += totalCost;

      return {
        product_id: p.id,
        name: p.name,
        brand: p.brand,
        pack_size: p.pack_size,
        shade_code: p.shade_code,
        shade_hex: p.shade_hex,
        current_stock: p.current_stock,
        reorder_threshold: p.reorder_threshold,
        suggested_reorder_packs: suggestedUnits,
        distributor: p.distributor || 'Authorized Factory Depot',
        rack_location: p.rack_location,
        estimated_unit_cost: estUnitCost,
        estimated_total_cost: totalCost,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        low_stock_count: items.length,
        estimated_total_procurement_cost: totalEstCost,
        items,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
