-- ==============================================================================
-- SAARTHI Paint-Shop Management System — Master Supabase Database Setup
-- File: supabase_master_setup.sql
-- Description: Complete production schema for customer buying tracking, 
--              sales lifecycle, stock movement ledger, and live analytics.
-- How to apply:
--   1. Go to your Supabase Project Dashboard (https://supabase.com/dashboard)
--   2. Click "SQL Editor" in the left sidebar
--   3. Click "New Query", paste this entire script, and click "Run"
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Shops Table (Multi-tenant store identity)
CREATE TABLE IF NOT EXISTS public.shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    tagline VARCHAR(255),
    owner_name VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    gstin VARCHAR(50),
    bill_prefix VARCHAR(20) NOT NULL DEFAULT 'PB-2026-',
    next_bill_number INTEGER NOT NULL DEFAULT 1001,
    currency VARCHAR(10) NOT NULL DEFAULT '₹',
    low_stock_threshold NUMERIC(10, 2) NOT NULL DEFAULT 5,
    bill_footer_note TEXT DEFAULT 'Goods once tinted to custom shade cannot be returned or exchanged.',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Shop Members Table (RBAC: owner, manager, cashier, viewer)
CREATE TABLE IF NOT EXISTS public.shop_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'cashier' CHECK (role IN ('owner', 'manager', 'cashier', 'viewer')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_shop_user UNIQUE (shop_id, user_id)
);

-- 4. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    pack_size VARCHAR(50) NOT NULL,
    unit_of_measure VARCHAR(20) NOT NULL DEFAULT 'L' CHECK (unit_of_measure IN ('L', 'Kg', 'Piece', 'Tin', 'Bucket', 'Drum', 'Gram', 'ML')),
    shade_code VARCHAR(100) NOT NULL,
    shade_hex VARCHAR(10) NOT NULL DEFAULT '#FAFAFA',
    finish VARCHAR(100) DEFAULT 'Standard Finish',
    rack_location VARCHAR(100),
    selling_price NUMERIC(12, 2) NOT NULL CHECK (selling_price >= 0),
    cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (cost_price >= 0),
    mrp NUMERIC(12, 2) CHECK (mrp >= 0),
    reorder_threshold NUMERIC(10, 2) NOT NULL DEFAULT 5 CHECK (reorder_threshold >= 0),
    opening_stock NUMERIC(12, 3) NOT NULL DEFAULT 0 CHECK (opening_stock >= 0),
    current_stock NUMERIC(12, 3) NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    distributor VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_product_identity UNIQUE (shop_id, brand, name, pack_size, shade_code)
);

-- 5. Customers Table (Buyer Records, Khata Credit, and Lifetime Spending)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    customer_type VARCHAR(50) NOT NULL DEFAULT 'Homeowner' CHECK (customer_type IN ('Contractor', 'Painter', 'Commercial', 'Homeowner')),
    phone VARCHAR(50),
    address TEXT,
    credit_limit NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (credit_limit >= 0),
    outstanding_balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_purchases NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total_purchases >= 0),
    total_orders INTEGER NOT NULL DEFAULT 0 CHECK (total_orders >= 0),
    last_purchase_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Sales Table (Paper Bill Register with Draft and Confirmed lifecycle)
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL DEFAULT 'Walk-in Retail Buyer',
    customer_phone VARCHAR(50),
    bill_number VARCHAR(50) NOT NULL,
    idempotency_key VARCHAR(100),
    status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'cancelled', 'refunded')),
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    discount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
    net_total NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (net_total >= 0),
    payment_mode VARCHAR(50) NOT NULL DEFAULT 'Cash' CHECK (payment_mode IN ('Cash', 'UPI', 'Debit / Credit Card', 'Khata / Credit')),
    payment_status VARCHAR(30) NOT NULL DEFAULT 'Unpaid' CHECK (payment_status IN ('Paid', 'Added to Khata', 'Partially Paid', 'Cancelled')),
    notes TEXT,
    created_by UUID,
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_shop_bill_number UNIQUE (shop_id, bill_number),
    CONSTRAINT uq_shop_idempotency UNIQUE (shop_id, idempotency_key)
);

-- 7. Sale Items Table (Detailed products purchased in each bill)
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    pack_size VARCHAR(50) NOT NULL,
    shade_code VARCHAR(100) NOT NULL,
    unit_of_measure VARCHAR(20) NOT NULL DEFAULT 'L',
    quantity NUMERIC(10, 3) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    total NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Traceable Stock Ledger
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    movement_type VARCHAR(50) NOT NULL CHECK (
        movement_type IN (
            'opening_balance',
            'purchase_received',
            'sale_deduction',
            'damage_leakage',
            'customer_return',
            'authorized_adjustment',
            'reversal'
        )
    ),
    quantity NUMERIC(12, 3) NOT NULL,
    balance_before NUMERIC(12, 3) NOT NULL,
    balance_after NUMERIC(12, 3) NOT NULL CHECK (balance_after >= 0),
    reference_type VARCHAR(50),
    reference_id UUID,
    reason TEXT NOT NULL,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Customer Payments Table (Khata credit repayments)
CREATE TABLE IF NOT EXISTS public.customer_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_mode VARCHAR(50) NOT NULL DEFAULT 'Cash' CHECK (payment_mode IN ('Cash', 'UPI', 'Bank Transfer', 'Cheque')),
    reference_no VARCHAR(100),
    balance_before NUMERIC(12, 2) NOT NULL,
    balance_after NUMERIC(12, 2) NOT NULL,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- Indexes for High Speed Queries & Lookups
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_shop_search ON public.products(shop_id, brand, category, is_active);
CREATE INDEX IF NOT EXISTS idx_products_stock ON public.products(shop_id, current_stock);
CREATE INDEX IF NOT EXISTS idx_stock_movements_history ON public.stock_movements(shop_id, product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_shop_date ON public.sales(shop_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON public.sales(shop_id, customer_id, created_at DESC) WHERE status = 'confirmed';
CREATE INDEX IF NOT EXISTS idx_customers_balance ON public.customers(shop_id, outstanding_balance DESC);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON public.customer_payments(shop_id, customer_id, created_at DESC);

-- ==============================================================================
-- Analytics Views: Customer Buying Behavior & Purchase History
-- ==============================================================================

-- Summary View: Customer total spend, order count, and average order value
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

-- Detail View: Every specific product line item each customer ever bought
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

-- ==============================================================================
-- Stored Procedures: Atomic Sale Confirmation & Customer Dossier
-- ==============================================================================

-- Stored Procedure: Atomic Sale Confirmation
CREATE OR REPLACE FUNCTION public.confirm_sale_atomic(
    p_shop_id UUID,
    p_sale_id UUID,
    p_idempotency_key VARCHAR(100),
    p_user_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_sale RECORD;
    v_item RECORD;
    v_product RECORD;
    v_existing_sale RECORD;
    v_balance_before NUMERIC(12, 3);
    v_balance_after NUMERIC(12, 3);
BEGIN
    -- Idempotency Check
    IF p_idempotency_key IS NOT NULL AND p_idempotency_key != '' THEN
        SELECT * INTO v_existing_sale
        FROM public.sales
        WHERE shop_id = p_shop_id AND idempotency_key = p_idempotency_key AND status = 'confirmed';

        IF FOUND THEN
            RETURN jsonb_build_object('success', true, 'already_confirmed', true, 'sale_id', v_existing_sale.id, 'bill_number', v_existing_sale.bill_number);
        END IF;
    END IF;

    -- Fetch Sale
    SELECT * INTO v_sale FROM public.sales WHERE id = p_sale_id AND shop_id = p_shop_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'SALE_NOT_FOUND: Sale with ID % does not exist.', p_sale_id;
    END IF;

    IF v_sale.status = 'confirmed' THEN
        RETURN jsonb_build_object('success', true, 'already_confirmed', true, 'sale_id', v_sale.id, 'bill_number', v_sale.bill_number);
    END IF;

    -- Deduct stock for all items
    FOR v_item IN SELECT * FROM public.sale_items WHERE sale_id = p_sale_id LOOP
        SELECT * INTO v_product FROM public.products WHERE id = v_item.product_id FOR UPDATE;

        IF v_product.current_stock < v_item.quantity THEN
            RAISE EXCEPTION 'INSUFFICIENT_STOCK: Item % has only % units available.', v_product.name, v_product.current_stock;
        END IF;

        v_balance_before := v_product.current_stock;
        v_balance_after := v_product.current_stock - v_item.quantity;

        UPDATE public.products SET current_stock = v_balance_after, updated_at = now() WHERE id = v_item.product_id;

        INSERT INTO public.stock_movements (
            shop_id, product_id, movement_type, quantity, balance_before, balance_after, reference_type, reference_id, reason, created_by
        ) VALUES (
            p_shop_id, v_item.product_id, 'sale_deduction', -v_item.quantity, v_balance_before, v_balance_after, 'sale', p_sale_id, 'Paper Bill: ' || v_sale.bill_number, p_user_id
        );
    END LOOP;

    -- Update Khata if payment mode is Credit
    IF v_sale.payment_mode = 'Khata / Credit' AND v_sale.customer_id IS NOT NULL THEN
        UPDATE public.customers
        SET outstanding_balance = outstanding_balance + v_sale.net_total, updated_at = now()
        WHERE id = v_sale.customer_id AND shop_id = p_shop_id;
    END IF;

    -- Mark sale confirmed
    UPDATE public.sales
    SET status = 'confirmed', idempotency_key = COALESCE(p_idempotency_key, idempotency_key), confirmed_at = now(), updated_at = now()
    WHERE id = p_sale_id;

    -- Increment shop next bill number
    UPDATE public.shops SET next_bill_number = next_bill_number + 1, updated_at = now() WHERE id = p_shop_id;

    RETURN jsonb_build_object('success', true, 'sale_id', p_sale_id, 'bill_number', v_sale.bill_number, 'net_total', v_sale.net_total, 'status', 'confirmed');
END;
$$ LANGUAGE plpgsql;

-- Trigger: Automatically sync customer buying statistics upon confirmation
CREATE OR REPLACE FUNCTION public.sync_customer_buying_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.customer_id IS NOT NULL AND NEW.status = 'confirmed' AND (OLD IS NULL OR OLD.status != 'confirmed') THEN
        UPDATE public.customers
        SET 
            total_purchases = COALESCE((SELECT SUM(net_total) FROM public.sales WHERE customer_id = NEW.customer_id AND status = 'confirmed'), 0),
            total_orders = COALESCE((SELECT COUNT(*) FROM public.sales WHERE customer_id = NEW.customer_id AND status = 'confirmed'), 0),
            last_purchase_date = NEW.confirmed_at,
            updated_at = now()
        WHERE id = NEW.customer_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_customer_buying_stats ON public.sales;
CREATE TRIGGER trg_sync_customer_buying_stats
AFTER INSERT OR UPDATE ON public.sales
FOR EACH ROW
EXECUTE FUNCTION public.sync_customer_buying_stats();

-- Stored Procedure: Complete Customer Purchase Dossier
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
    SELECT * INTO v_customer FROM public.customers WHERE id = p_customer_id AND shop_id = p_shop_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'CUSTOMER_NOT_FOUND');
    END IF;

    SELECT * INTO v_summary FROM public.v_customer_buying_summary WHERE customer_id = p_customer_id AND shop_id = p_shop_id;

    SELECT COALESCE(jsonb_agg(sale_obj ORDER BY (sale_obj->>'confirmed_at') DESC), '[]'::jsonb)
    INTO v_sales
    FROM (
        SELECT 
            s.id, s.bill_number, s.confirmed_at, s.payment_mode, s.payment_status, s.subtotal, s.discount, s.net_total, s.notes,
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
        WHERE s.customer_id = p_customer_id AND s.shop_id = p_shop_id AND s.status = 'confirmed'
        GROUP BY s.id, s.bill_number, s.confirmed_at, s.payment_mode, s.payment_status, s.subtotal, s.discount, s.net_total, s.notes
    ) sale_obj;

    SELECT COALESCE(jsonb_agg(top_prod), '[]'::jsonb)
    INTO v_top_products
    FROM (
        SELECT si.product_name, si.brand, si.pack_size, SUM(si.quantity) AS total_quantity, SUM(si.total) AS total_spent
        FROM public.sales s
        JOIN public.sale_items si ON si.sale_id = s.id
        WHERE s.customer_id = p_customer_id AND s.shop_id = p_shop_id AND s.status = 'confirmed'
        GROUP BY si.product_name, si.brand, si.pack_size
        ORDER BY total_spent DESC LIMIT 5
    ) top_prod;

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
$$ LANGUAGE plpgsql;

-- 11. Initial Demo Seed
INSERT INTO public.shops (id, name, tagline, phone, bill_prefix, next_bill_number)
VALUES ('00000000-0000-0000-0000-000000000001', 'SAARTHI Paints & Hardware Depot', 'Authorized Dealer — Asian Paints, Berger & Dr. Fixit', '+91 98765-01234', 'PB-2026-', 1045)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.customers (id, shop_id, name, customer_type, phone, address, credit_limit, outstanding_balance)
VALUES
('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Ramesh Sharma (Contractor)', 'Contractor', '+91 98765-11223', 'Site 4, Green Park Enclave', 50000.00, 14500.00),
('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Vijay Painter (Master Karigar)', 'Painter', '+91 98112-33445', 'Near Old Bus Stand, Ward 8', 20000.00, 3800.00),
('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Amit Verma', 'Homeowner', '+91 98334-55667', 'House 142, Model Town', 0.00, 0.00)
ON CONFLICT (id) DO NOTHING;
