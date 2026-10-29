-- ==============================================================================
-- SAARTHI Paint-Shop Management System — Database Schema Migration
-- Migration: 001_initial_schema.sql
-- Description: Core tables, constraints, indexes, RLS policies, and views.
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
    user_id UUID NOT NULL, -- references auth.users(id) in Supabase
    role VARCHAR(50) NOT NULL DEFAULT 'cashier' CHECK (role IN ('owner', 'manager', 'cashier', 'viewer')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_shop_user UNIQUE (shop_id, user_id)
);

-- 4. Products Table
-- Paint identity: Brand + Product Name + Category + Pack Size + Unit of Measure + Shade Code
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
    -- Essential: Never identify solely by product name!
    CONSTRAINT uq_product_identity UNIQUE (shop_id, brand, name, pack_size, shade_code)
);

-- 5. Customers Table (Contractors, Painters, Commercial, Homeowners & Khata Balances)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    customer_type VARCHAR(50) NOT NULL DEFAULT 'Homeowner' CHECK (customer_type IN ('Contractor', 'Painter', 'Commercial', 'Homeowner')),
    phone VARCHAR(50),
    address TEXT,
    credit_limit NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (credit_limit >= 0),
    outstanding_balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
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

-- 7. Sale Items Table
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

-- 8. Traceable Stock Ledger (Audit Trail of all Inventory Inflow / Outflow)
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
    quantity NUMERIC(12, 3) NOT NULL, -- Signed: positive for inward/returns, negative for sales/damages
    balance_before NUMERIC(12, 3) NOT NULL,
    balance_after NUMERIC(12, 3) NOT NULL CHECK (balance_after >= 0),
    reference_type VARCHAR(50), -- 'sale', 'purchase_invoice', 'damage_report', 'adjustment'
    reference_id UUID,
    reason TEXT NOT NULL,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Customer Payments Table (Khata Credit Settlements)
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
-- Indexes for High Performance & Search
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_shop_search ON public.products(shop_id, brand, category, is_active);
CREATE INDEX IF NOT EXISTS idx_products_stock ON public.products(shop_id, current_stock);
CREATE INDEX IF NOT EXISTS idx_stock_movements_history ON public.stock_movements(shop_id, product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_shop_date ON public.sales(shop_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_status ON public.sales(shop_id, status);
CREATE INDEX IF NOT EXISTS idx_customers_balance ON public.customers(shop_id, outstanding_balance DESC);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON public.customer_payments(shop_id, customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_shop ON public.audit_logs(shop_id, created_at DESC);

-- ==============================================================================
-- Inventory Verification View
-- Verifies that derived stock from ledger matches cached current_stock
-- ==============================================================================
CREATE OR REPLACE VIEW public.v_inventory_verification AS
SELECT
    p.id AS product_id,
    p.shop_id,
    p.name,
    p.brand,
    p.pack_size,
    p.shade_code,
    p.opening_stock,
    p.current_stock AS cached_current_stock,
    p.opening_stock + COALESCE(SUM(sm.quantity), 0) AS derived_current_stock,
    (p.current_stock = (p.opening_stock + COALESCE(SUM(sm.quantity), 0))) AS is_ledger_balanced
FROM public.products p
LEFT JOIN public.stock_movements sm ON sm.product_id = p.id
GROUP BY p.id, p.shop_id, p.name, p.brand, p.pack_size, p.shade_code, p.opening_stock, p.current_stock;

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- Enforces that users can only access records belonging to shops where they are active members.
-- ==============================================================================
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current auth user is member of a shop
CREATE OR REPLACE FUNCTION public.is_shop_member(p_shop_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.shop_members
        WHERE shop_id = p_shop_id
          AND user_id = auth.uid()
          AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for products
CREATE POLICY products_shop_member_select ON public.products
    FOR SELECT USING (public.is_shop_member(shop_id));

CREATE POLICY products_shop_member_all ON public.products
    FOR ALL USING (public.is_shop_member(shop_id));

-- Policies for sales
CREATE POLICY sales_shop_member_all ON public.sales
    FOR ALL USING (public.is_shop_member(shop_id));

-- Policies for customers
CREATE POLICY customers_shop_member_all ON public.customers
    FOR ALL USING (public.is_shop_member(shop_id));

-- Policies for stock movements
CREATE POLICY stock_movements_shop_member_all ON public.stock_movements
    FOR ALL USING (public.is_shop_member(shop_id));
