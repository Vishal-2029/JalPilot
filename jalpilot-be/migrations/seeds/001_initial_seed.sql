-- 001_initial_seed.sql
-- Permissions
INSERT INTO permissions (permission_key, description) VALUES
('company.manage', 'Manage company profile, branding, and settings'),
('customers.view', 'View all company customers'),
('customers.view_assigned', 'View assigned customers only'),
('customers.manage', 'Create, edit, deactivate, and invite customers'),
('staff.manage', 'Manage staff profiles, roles, and permissions'),
('products.manage', 'Manage water products, bottle sizes, and pricing'),
('inventory.manage', 'Manage full, empty, and damaged bottle inventory'),
('orders.manage', 'Create and manage customer orders and recurring schedules'),
('deliveries.view_assigned', 'View assigned deliveries'),
('deliveries.manage', 'Manage all company deliveries and assignments'),
('deliveries.update_status', 'Update delivery status and delivered quantities'),
('bottles.record_return', 'Record empty bottle returns'),
('payments.manage', 'View and record all customer payments and invoices'),
('payments.collect_cod_upi', 'Record authorized cash or UPI collections on delivery'),
('expenses.manage', 'Manage company operational expenses'),
('leave.manage', 'Approve or reject customer leave requests'),
('reports.view', 'View company financial and operational reports'),
('reports.view_daily_delivery', 'Submit and view daily delivery reports'),
('themes.manage', 'Browse, purchase, and activate customer portal themes')
ON CONFLICT (permission_key) DO NOTHING;

-- Subscription Plans
INSERT INTO subscription_plans (plan_name, plan_code, monthly_price, annual_price, currency, customer_limit, staff_limit, order_limit, features_json) VALUES
('Starter', 'starter', 999.00, 9990.00, 'INR', 150, 3, 2000, '{"custom_domain": false, "sms_notifications": false}'::jsonb),
('Growth', 'growth', 2499.00, 24990.00, 'INR', 1000, 15, 15000, '{"custom_domain": true, "sms_notifications": true}'::jsonb),
('Enterprise', 'enterprise', 5999.00, 59990.00, 'INR', 10000, 100, 200000, '{"custom_domain": true, "sms_notifications": true, "priority_support": true}'::jsonb)
ON CONFLICT (plan_code) DO NOTHING;

-- Initial 5 Customer Portal Themes
INSERT INTO themes (id, theme_name, theme_slug, description, price, currency, theme_status) VALUES
('11111111-1111-1111-1111-111111111101', 'Aqua Professional', 'aqua-professional', 'Clean, trustworthy corporate blue theme ideal for residential and office water suppliers.', 0.00, 'INR', 'PUBLISHED'),
('11111111-1111-1111-1111-111111111102', 'Ocean Premium', 'ocean-premium', 'Deep ocean navy and cyan gradient theme with elevated card layouts.', 1499.00, 'INR', 'PUBLISHED'),
('11111111-1111-1111-1111-111111111103', 'Fresh Aqua', 'fresh-aqua', 'Bright, refreshing teal-and-white mineral water aesthetic.', 999.00, 'INR', 'PUBLISHED'),
('11111111-1111-1111-1111-111111111104', 'Aqua Express', 'aqua-express', 'High-contrast, action-first layout optimized for rapid mobile reorders.', 1299.00, 'INR', 'PUBLISHED'),
('11111111-1111-1111-1111-111111111105', 'Pure Luxury', 'pure-luxury', 'Minimalist slate, gold-accented glassmorphism for premium alkaline water brands.', 2499.00, 'INR', 'PUBLISHED')
ON CONFLICT (theme_slug) DO NOTHING;

INSERT INTO theme_versions (theme_id, version, configuration_json, published_at) VALUES
('11111111-1111-1111-1111-111111111101', '1.0.0', '{"primary":"#0284c7","secondary":"#e0f2fe","accent":"#0369a1","surface":"#ffffff","layout":"sidebar","radius":"0.5rem","font":"Inter"}'::jsonb, NOW()),
('11111111-1111-1111-1111-111111111102', '1.0.0', '{"primary":"#0f172a","secondary":"#06b6d4","accent":"#22d3ee","surface":"#f8fafc","layout":"topnav","radius":"0.75rem","font":"Plus Jakarta Sans"}'::jsonb, NOW()),
('11111111-1111-1111-1111-111111111103', '1.0.0', '{"primary":"#0d9488","secondary":"#ccfbf1","accent":"#14b8a6","surface":"#ffffff","layout":"sidebar","radius":"1rem","font":"DM Sans"}'::jsonb, NOW()),
('11111111-1111-1111-1111-111111111104', '1.0.0', '{"primary":"#2563eb","secondary":"#dbeafe","accent":"#f59e0b","surface":"#ffffff","layout":"compact","radius":"0.375rem","font":"Inter"}'::jsonb, NOW()),
('11111111-1111-1111-1111-111111111105', '1.0.0', '{"primary":"#1e293b","secondary":"#f1f5f9","accent":"#d97706","surface":"#ffffff","layout":"topnav","radius":"0.75rem","font":"Outfit"}'::jsonb, NOW())
ON CONFLICT (theme_id, version) DO NOTHING;

-- Default Platform Super Admin User (admin@jalpilot.com / Admin@123)
INSERT INTO users (
    id, full_name, email, normalized_email, phone, normalized_phone, password_hash, account_status, email_verified_at, phone_verified_at
)
SELECT
    '00000000-0000-0000-0000-000000000001',
    'JalPilot Super Admin',
    'admin@jalpilot.com',
    'admin@jalpilot.com',
    '+919999999999',
    '+919999999999',
    '$argon2id$v=19$m=65536,t=2,p=4$DT9B+bfQxfaMcqfoGtimzA$KVbGOAX9DVNrxHP5gFif4i7HM8i4ndFF5tbajgQMrJc',
    'ACTIVE',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE normalized_email = 'admin@jalpilot.com'
);

INSERT INTO platform_user_roles (user_id, role_key)
SELECT '00000000-0000-0000-0000-000000000001', 'SUPER_ADMIN'
WHERE NOT EXISTS (
    SELECT 1 FROM platform_user_roles WHERE user_id = '00000000-0000-0000-0000-000000000001' AND role_key = 'SUPER_ADMIN'
);
