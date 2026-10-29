-- ==============================================================================
-- SAARTHI Paint-Shop Management System — Database Schema Migration
-- Migration: 002_atomic_sales_function.sql
-- Description: Stored procedures for atomic sale confirmation, stock movements,
--              concurrency locks, and ledger integrity.
-- ==============================================================================

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
    v_result JSONB;
BEGIN
    -- 1. Idempotency Check:
    -- If a sale with this idempotency key is already confirmed, return it immediately without re-deducting stock
    IF p_idempotency_key IS NOT NULL AND p_idempotency_key != '' THEN
        SELECT * INTO v_existing_sale
        FROM public.sales
        WHERE shop_id = p_shop_id
          AND idempotency_key = p_idempotency_key
          AND status = 'confirmed';

        IF FOUND THEN
            RETURN jsonb_build_object(
                'success', true,
                'already_confirmed', true,
                'sale_id', v_existing_sale.id,
                'bill_number', v_existing_sale.bill_number
            );
        END IF;
    END IF;

    -- 2. Fetch the target sale record
    SELECT * INTO v_sale
    FROM public.sales
    WHERE id = p_sale_id AND shop_id = p_shop_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'SALE_NOT_FOUND: Sale with ID % does not exist in this shop.', p_sale_id;
    END IF;

    IF v_sale.status = 'confirmed' THEN
        RETURN jsonb_build_object(
            'success', true,
            'already_confirmed', true,
            'sale_id', v_sale.id,
            'bill_number', v_sale.bill_number
        );
    END IF;

    IF v_sale.status != 'draft' THEN
        RAISE EXCEPTION 'INVALID_SALE_STATUS: Sale is currently % and cannot be confirmed.', v_sale.status;
    END IF;

    -- 3. Verify and process all items atomically
    -- Sort by product_id to avoid deadlocks in concurrent transactions
    FOR v_item IN
        SELECT si.*
        FROM public.sale_items si
        WHERE si.sale_id = p_sale_id
        ORDER BY si.product_id ASC
    LOOP
        -- Row-level lock on product row
        SELECT * INTO v_product
        FROM public.products
        WHERE id = v_item.product_id AND shop_id = p_shop_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'PRODUCT_NOT_FOUND: Product ID % not found.', v_item.product_id;
        END IF;

        IF NOT v_product.is_active THEN
            RAISE EXCEPTION 'PRODUCT_INACTIVE: Product % (%) is discontinued/inactive.', v_product.name, v_product.shade_code;
        END IF;

        -- Validate stock sufficiency
        IF v_product.current_stock < v_item.quantity THEN
            RAISE EXCEPTION 'INSUFFICIENT_STOCK: Product % (Shade: %, Pack: %) has only % in stock, but % was requested.',
                v_product.name, v_product.shade_code, v_product.pack_size, v_product.current_stock, v_item.quantity;
        END IF;

        v_balance_before := v_product.current_stock;
        v_balance_after := v_balance_before - v_item.quantity;

        -- Deduct stock
        UPDATE public.products
        SET current_stock = v_balance_after,
            updated_at = now()
        WHERE id = v_item.product_id;

        -- Insert traceable stock movement
        INSERT INTO public.stock_movements (
            shop_id,
            product_id,
            movement_type,
            quantity,
            balance_before,
            balance_after,
            reference_type,
            reference_id,
            reason,
            created_by
        ) VALUES (
            p_shop_id,
            v_item.product_id,
            'sale_deduction',
            -v_item.quantity, -- signed negative
            v_balance_before,
            v_balance_after,
            'sale',
            p_sale_id,
            'Paper Bill confirmed: ' || v_sale.bill_number,
            p_user_id
        );
    END LOOP;

    -- 4. Update Customer Khata balance if payment mode is Credit
    IF v_sale.payment_mode = 'Khata / Credit' AND v_sale.customer_id IS NOT NULL THEN
        UPDATE public.customers
        SET outstanding_balance = outstanding_balance + v_sale.net_total,
            updated_at = now()
        WHERE id = v_sale.customer_id AND shop_id = p_shop_id;
    END IF;

    -- 5. Mark sale as confirmed
    UPDATE public.sales
    SET status = 'confirmed',
        idempotency_key = COALESCE(p_idempotency_key, idempotency_key),
        confirmed_at = now(),
        updated_at = now()
    WHERE id = p_sale_id;

    -- 6. Increment shop next_bill_number sequence
    UPDATE public.shops
    SET next_bill_number = next_bill_number + 1,
        updated_at = now()
    WHERE id = p_shop_id;

    -- 7. Audit Log Entry
    INSERT INTO public.audit_logs (
        shop_id,
        user_id,
        action,
        entity_type,
        entity_id,
        new_values
    ) VALUES (
        p_shop_id,
        p_user_id,
        'CONFIRM_SALE',
        'sale',
        p_sale_id::text,
        jsonb_build_object(
            'bill_number', v_sale.bill_number,
            'net_total', v_sale.net_total,
            'customer_name', v_sale.customer_name,
            'payment_mode', v_sale.payment_mode
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'sale_id', p_sale_id,
        'bill_number', v_sale.bill_number,
        'net_total', v_sale.net_total,
        'status', 'confirmed',
        'confirmed_at', now()
    );
END;
$$ LANGUAGE plpgsql;
