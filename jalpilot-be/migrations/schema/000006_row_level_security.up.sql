-- 000006_row_level_security.up.sql
CREATE OR REPLACE FUNCTION app_current_tenant_id() RETURNS UUID AS $$
    SELECT NULLIF(current_setting('app.current_tenant_id', true), '')::UUID;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION app_is_platform_admin() RETURNS BOOLEAN AS $$
    SELECT COALESCE(NULLIF(current_setting('app.is_platform_admin', true), ''), 'false')::BOOLEAN;
$$ LANGUAGE SQL STABLE;

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
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
        EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY;', tbl);
        EXECUTE format(
            'CREATE POLICY tenant_isolation_policy ON %I USING (app_is_platform_admin() OR tenant_id = app_current_tenant_id()) WITH CHECK (app_is_platform_admin() OR tenant_id = app_current_tenant_id());',
            tbl
        );
    END LOOP;
END $$;

