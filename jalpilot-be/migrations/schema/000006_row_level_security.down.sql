-- 000006_row_level_security.down.sql
DO $$
DECLARE
    tbl TEXT;
    tenant_tables TEXT[] := ARRAY[
        'tenant_domains','tenant_settings','tenant_memberships','tenant_roles','membership_roles',
        'customers','invitations','customer_addresses','customer_product_prices','customer_preferences',
        'staff_profiles','products','product_prices','inventory','inventory_transactions','bottle_transactions',
        'orders','order_items','recurring_schedules','deliveries','delivery_items','delivery_events',
        'charges','invoices','invoice_items','payments','payment_allocations','customer_ledger_entries',
        'expense_categories','company_expenses','leave_requests','delivery_pauses',
        'theme_purchases','tenant_theme_settings','subscriptions','platform_transactions','support_tickets'
    ];
BEGIN
    FOREACH tbl IN ARRAY tenant_tables LOOP
        EXECUTE format('DROP POLICY IF EXISTS tenant_isolation_policy ON %I;', tbl);
        EXECUTE format('ALTER TABLE %I NO FORCE ROW LEVEL SECURITY;', tbl);
        EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY;', tbl);
    END LOOP;
END $$;

DROP FUNCTION IF EXISTS app_is_platform_admin();
DROP FUNCTION IF EXISTS app_current_tenant_id();

