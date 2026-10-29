-- ==============================================================================
-- SAARTHI Paint-Shop Management System — Database Schema Migration
-- Migration: 004_customer_purchases_analytics.sql
-- Description: Customer Purchasing History, Order Line Items Tracking,
--              Analytics Views, and Automated Buyer Statistics in Supabase.
-- ==============================================================================

-- 1. Ensure Customer Buying Statistics Columns Exist
ALTER TABLE public.customers
    ADD COLUMN IF NOT EXISTS total_purchases NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total_purchases >= 0),
    ADD COLUMN IF NOT EXISTS total_orders INTEGER NOT NULL DEFAULT 0 CHECK (total_orders >= 0),
    ADD COLUMN IF NOT EXISTS last_purchase_date TIMESTAMPTZ;

-- 2. Index for Rapid Customer Sales & Purchasing Lookups
CREATE INDEX IF NOT EXISTS idx_sales_customer_history ON public.sales(shop_id, customer_id, created_at DESC)
    WHERE status = 'confirmed';

CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON public.sale_items(sale_id);

-- 3. Customer Comprehensive Buying Summary View
CREATE OR REPLACE VIEW public.v_customer_buying_summary AS
SELECT
    c.id AS customer_id,
    c.shop_id,
    c.name AS customer_name,
    c.customer_type,
    c.phone,
    c.address,
    c.credit_limit,
    c.outstanding_balance AS current_khata_due,
    COALESCE(COUNT(s.id), 0) AS total_orders_count,
    COALESCE(SUM(s.net_total), 0) AS total_lifetime_spent,
    CASE 
        WHEN COUNT(s.id) > 0 THEN ROUND(SUM(s.net_total) / COUNT(s.id), 2)
        ELSE 0 
    END AS average_basket_value,
    MIN(s.confirmed_at) AS first_purchase_date,
    MAX(s.confirmed_at) AS last_purchase_date
FROM public.customers c
LEFT JOIN public.sales s ON s.customer_id = c.id AND s.status = 'confirmed'
GROUP BY c.id, c.shop_id, c.name, c.customer_type, c.phone, c.address, c.credit_limit, c.outstanding_balance;

-- 4. Customer Line-Item Purchasing Breakdown View
-- Shows exactly what paints, brands, pack sizes, and shades each customer bought
CREATE OR REPLACE VIEW public.v_customer_order_items AS
SELECT
    s.customer_id,
    c.name AS customer_name,
    c.phone AS customer_phone,
    s.id AS sale_id,
    s.shop_id,
    s.bill_number,
    s.status AS bill_status,
    s.confirmed_at AS purchase_date,
    s.payment_mode,
    s.payment_status,
    si.id AS item_id,
    si.product_id,
    si.product_name,
    si.brand,
    si.pack_size,
    si.shade_code,
    si.quantity,
    si.unit_of_measure,
    si.unit_price,
    si.total AS item_total
FROM public.sales s
JOIN public.sale_items si ON si.sale_id = s.id
LEFT JOIN public.customers c ON c.id = s.customer_id
WHERE s.status = 'confirmed';

-- 5. Trigger Function: Automatically Update Customer Lifetime Purchases & Orders
CREATE OR REPLACE FUNCTION public.sync_customer_buying_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.customer_id IS NOT NULL AND NEW.status = 'confirmed' AND (OLD IS NULL OR OLD.status != 'confirmed') THEN
        UPDATE public.customers
        SET 
            total_purchases = COALESCE((
                SELECT SUM(net_total) FROM public.sales 
                WHERE customer_id = NEW.customer_id AND status = 'confirmed'
            ), 0),
            total_orders = COALESCE((
                SELECT COUNT(*) FROM public.sales 
                WHERE customer_id = NEW.customer_id AND status = 'confirmed'
            ), 0),
            last_purchase_date = NEW.confirmed_at,
            updated_at = now()
        WHERE id = NEW.customer_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_customer_buying_stats ON public.sales;
CREATE TRIGGER trg_sync_customer_buying_stats
AFTER INSERT OR UPDATE ON public.sales
FOR EACH ROW
EXECUTE FUNCTION public.sync_customer_buying_stats();

-- 6. RPC Function: Complete Customer Purchase Dossier
-- Returns full buying history, items purchased, and Khata ledger in one optimized call
CREATE OR REPLACE FUNCTION public.get_customer_purchase_dossier(
    p_shop_id UUID,
    p_customer_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_customer RECORD;
    v_summary RECORD;
    v_sales JSONB;
    v_top_products JSONB;
    v_payments JSONB;
BEGIN
    -- 1. Customer profile
    SELECT * INTO v_customer
    FROM public.customers
    WHERE id = p_customer_id AND shop_id = p_shop_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'CUSTOMER_NOT_FOUND');
    END IF;

    -- 2. Buying summary
    SELECT * INTO v_summary
    FROM public.v_customer_buying_summary
    WHERE customer_id = p_customer_id AND shop_id = p_shop_id;

    -- 3. All finalized sales with items for this customer
    SELECT COALESCE(jsonb_agg(sale_obj ORDER BY (sale_obj->>'confirmed_at') DESC), '[]'::jsonb)
    INTO v_sales
    FROM (
        SELECT 
            s.id,
            s.bill_number,
            s.confirmed_at,
            s.payment_mode,
            s.payment_status,
            s.subtotal,
            s.discount,
            s.net_total,
            s.notes,
            COALESCE(jsonb_agg(
                jsonb_build_object(
                    'product_id', si.product_id,
                    'product_name', si.product_name,
                    'brand', si.brand,
                    'pack_size', si.pack_size,
                    'shade_code', si.shade_code,
                    'quantity', si.quantity,
                    'unit_price', si.unit_price,
                    'total', si.total
                )
            ), '[]'::jsonb) AS items
        FROM public.sales s
        LEFT JOIN public.sale_items si ON si.sale_id = s.id
        WHERE s.customer_id = p_customer_id 
          AND s.shop_id = p_shop_id 
          AND s.status = 'confirmed'
        GROUP BY s.id, s.bill_number, s.confirmed_at, s.payment_mode, s.payment_status, s.subtotal, s.discount, s.net_total, s.notes
    ) sale_obj;

    -- 4. Top purchased products by this customer
    SELECT COALESCE(jsonb_agg(top_prod), '[]'::jsonb)
    INTO v_top_products
    FROM (
        SELECT 
            si.product_name,
            si.brand,
            si.pack_size,
            SUM(si.quantity) AS total_quantity,
            SUM(si.total) AS total_spent
        FROM public.sales s
        JOIN public.sale_items si ON si.sale_id = s.id
        WHERE s.customer_id = p_customer_id 
          AND s.shop_id = p_shop_id 
          AND s.status = 'confirmed'
        GROUP BY si.product_name, si.brand, si.pack_size
        ORDER BY total_spent DESC
        LIMIT 5
    ) top_prod;

    -- 5. Customer payments (Khata settlements)
    SELECT COALESCE(jsonb_agg(p ORDER BY p.created_at DESC), '[]'::jsonb)
    INTO v_payments
    FROM public.customer_payments p
    WHERE p.customer_id = p_customer_id AND p.shop_id = p_shop_id;

    RETURN jsonb_build_object(
        'success', true,
        'customer', row_to_json(v_customer),
        'summary', jsonb_build_object(
            'total_lifetime_spent', COALESCE(v_summary.total_lifetime_spent, 0),
            'total_orders_count', COALESCE(v_summary.total_orders_count, 0),
            'average_basket_value', COALESCE(v_summary.average_basket_value, 0),
            'first_purchase_date', v_summary.first_purchase_date,
            'last_purchase_date', v_summary.last_purchase_date,
            'current_khata_due', v_customer.outstanding_balance
        ),
        'purchases', v_sales,
        'top_products', v_top_products,
        'khata_payments', v_payments
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
