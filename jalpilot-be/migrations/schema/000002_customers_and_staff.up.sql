-- 000002_customers_and_staff.up.sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_code VARCHAR(50) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    customer_type VARCHAR(30) NOT NULL DEFAULT 'RESIDENTIAL' CHECK (customer_type IN ('RESIDENTIAL','COMMERCIAL','CORPORATE')),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE','SUSPENDED')),
    account_activation_status VARCHAR(30) NOT NULL DEFAULT 'NOT_INVITED' CHECK (account_activation_status IN ('NOT_INVITED','INVITED','ACTIVATED')),
    pricing_type VARCHAR(20) NOT NULL DEFAULT 'PER_BOTTLE' CHECK (pricing_type IN ('PER_BOTTLE','MONTHLY')),
    default_price NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (default_price >= 0),
    notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, id),
    UNIQUE (tenant_id, customer_code)
);
CREATE UNIQUE INDEX uq_customers_tenant_user ON customers(tenant_id, user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_customers_tenant_created ON customers(tenant_id, created_at DESC);

CREATE TABLE invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    invitation_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (invitation_status IN ('PENDING','ACCEPTED','EXPIRED','REVOKED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (tenant_id, customer_id) REFERENCES customers(tenant_id, id) ON DELETE CASCADE
);
CREATE INDEX idx_invitations_tenant_customer ON invitations(tenant_id, customer_id);

CREATE TABLE customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL,
    building_name VARCHAR(150),
    flat_or_office_number VARCHAR(50),
    address_line TEXT NOT NULL,
    area VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    landmark VARCHAR(150),
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    is_primary BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (tenant_id, customer_id) REFERENCES customers(tenant_id, id) ON DELETE CASCADE
);
CREATE INDEX idx_customer_addresses_customer ON customer_addresses(tenant_id, customer_id);

CREATE TABLE customer_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL,
    preferred_delivery_days JSONB NOT NULL DEFAULT '[]'::jsonb,
    preferred_delivery_time VARCHAR(50),
    notification_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, customer_id),
    FOREIGN KEY (tenant_id, customer_id) REFERENCES customers(tenant_id, id) ON DELETE CASCADE
);

CREATE TABLE staff_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_code VARCHAR(50) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    joining_date DATE,
    employment_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK (employment_status IN ('ACTIVE','ON_LEAVE','TERMINATED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, id),
    UNIQUE (tenant_id, employee_code),
    UNIQUE (tenant_id, user_id)
);

