-- ==============================================================================
-- SAARTHI Paint-Shop Management System — Database Schema Migration
-- Migration: 003_seed_demo_data.sql
-- Description: Realistic baseline Indian paint store seed data
-- ==============================================================================

-- 1. Create Default Shop
INSERT INTO public.shops (
    id,
    name,
    tagline,
    owner_name,
    phone,
    email,
    address,
    gstin,
    bill_prefix,
    next_bill_number,
    currency,
    low_stock_threshold
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'SAARTHI Paints & Hardware Depot',
    'Authorized Dealer — Asian Paints, Berger & Dr. Fixit',
    'V. K. Aggarwal & Sons',
    '+91 98765-01234',
    'saarthi.paints@example.com',
    'Shop 14-16, Paints & Hardware Market, GT Road',
    '07AAAAA1234B1Z5',
    'PB-2026-',
    1045,
    '₹',
    5
) ON CONFLICT (id) DO NOTHING;

-- 2. Seed Initial Products with Accurate Identifiers
INSERT INTO public.products (
    id,
    shop_id,
    name,
    brand,
    category,
    pack_size,
    unit_of_measure,
    shade_code,
    shade_hex,
    finish,
    rack_location,
    selling_price,
    cost_price,
    mrp,
    reorder_threshold,
    opening_stock,
    current_stock,
    distributor
) VALUES
(
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Royale Luxury Interior Emulsion',
    'Asian Paints',
    'Interior Emulsion',
    '20 L',
    'L',
    '0422 Pearl Glow',
    '#F5EBE1',
    'Soft Sheen',
    'Aisle 1 - Bay B',
    8450.00,
    7100.00,
    9600.00,
    4,
    8,
    3, -- Low stock alert
    'Asian Paints Regional Depot'
),
(
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Royale Luxury Interior Emulsion',
    'Asian Paints',
    'Interior Emulsion',
    '4 L',
    'L',
    '0112 Morning Sun',
    '#FFF3B0',
    'Soft Sheen',
    'Aisle 1 - Bay C',
    1950.00,
    1620.00,
    2200.00,
    6,
    12,
    17,
    'Asian Paints Regional Depot'
),
(
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Apex Ultima Exterior Emulsion',
    'Asian Paints',
    'Exterior Emulsion',
    '20 L',
    'L',
    'L102 Apcolite White',
    '#FAFAFA',
    'High Sheen Exterior',
    'Aisle 2 - Bay A',
    7800.00,
    6500.00,
    8900.00,
    5,
    10,
    3, -- Low stock alert
    'Asian Paints Regional Depot'
),
(
    '10000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'WeatherCoat Long Life 10 Exterior',
    'Berger Paints',
    'Exterior Emulsion',
    '20 L',
    'L',
    '7811 Mint Frost',
    '#D1FAE5',
    'Silicone & PU Sheen',
    'Aisle 2 - Bay C',
    7950.00,
    6600.00,
    9100.00,
    4,
    6,
    2, -- Critical Low Stock
    'Berger Distribution Hub'
),
(
    '10000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000001',
    'Dr. Fixit Dampshield 2K Waterproofing',
    'Dr. Fixit',
    'Waterproofing & Chemical',
    '15 Kg',
    'Kg',
    'WP-GREY Grey Slurry',
    '#94A3B8',
    'Flexible Waterproof Coating',
    'Aisle 5 - Chemicals',
    3200.00,
    2700.00,
    3750.00,
    5,
    12,
    10,
    'Pidilite Industrial Distributors'
) ON CONFLICT (shop_id, brand, name, pack_size, shade_code) DO NOTHING;

-- 3. Seed Customers & Khata Accounts
INSERT INTO public.customers (
    id,
    shop_id,
    name,
    customer_type,
    phone,
    address,
    credit_limit,
    outstanding_balance
) VALUES
(
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Ramesh Sharma (Contractor)',
    'Contractor',
    '+91 98765-11223',
    'Site 4, Green Park Enclave',
    50000.00,
    14500.00
),
(
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Vijay Painter (Master Karigar)',
    'Painter',
    '+91 98112-33445',
    'Near Old Bus Stand, Ward 8',
    20000.00,
    3800.00
),
(
    '20000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Amit Verma',
    'Homeowner',
    '+91 98334-55667',
    'House 142, Model Town',
    0.00,
    0.00
) ON CONFLICT (id) DO NOTHING;
