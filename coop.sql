-- ==============================================================================
-- COOP GROCERY MANAGEMENT SYSTEM - INITIALIZATION
-- ==============================================================================

-- Enable UUID extension for secure, distributed primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS admin;
CREATE SCHEMA IF NOT EXISTS grocery;

-- ==============================================================================
-- 1. ADMIN SCHEMA
-- ==============================================================================

CREATE TABLE IF NOT EXISTS admin.shops (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    contact_number VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin.users (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, 
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    shop_id UUID REFERENCES admin.shops(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin.system_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT,
    updated_by VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin.audit_log (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id),
    user_id UUID NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin.utility_bill (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id),
    utility_type VARCHAR(50) NOT NULL, 
    billing_month VARCHAR(7) NOT NULL, 
    total_amount NUMERIC(12, 2) NOT NULL,
    main_shop_ratio NUMERIC(3, 2) NOT NULL,
    sub_shop_ratio NUMERIC(3, 2) NOT NULL, 
    recorded_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 2. GROCERY SCHEMA
-- ==============================================================================

CREATE TABLE IF NOT EXISTS grocery.suppliers (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20),
    address VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS grocery.products (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    default_reorder_level INTEGER NOT NULL DEFAULT 10,
    unit_price NUMERIC(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS grocery.shop_items (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES admin.shops(id),
    item_id UUID NOT NULL REFERENCES grocery.products(id),
    reorder_level INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(shop_id, item_id)
);

CREATE TABLE IF NOT EXISTS grocery.stock_ledger (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    shop_id UUID REFERENCES admin.shops(id),
    item_id UUID NOT NULL REFERENCES grocery.products(id),
    current_qty INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_stock_ledger_main_item ON grocery.stock_ledger(item_id) WHERE shop_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_stock_ledger_shop_item ON grocery.stock_ledger(shop_id, item_id) WHERE shop_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS grocery.stock_adjustment_log (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES grocery.products(id),
    adjustment_type VARCHAR(50) NOT NULL,
    previous_qty INTEGER NOT NULL,
    quantity_changed INTEGER NOT NULL,
    new_qty INTEGER NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    reason VARCHAR(100),
    remarks VARCHAR(255),
    adjustment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grocery.purchase_invoices ( 
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES grocery.suppliers(id),
    invoice_number VARCHAR(50),
    total_amount NUMERIC(12, 2) NOT NULL,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    remarks VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grocery.purchase_invoice_items (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    purchase_invoice_id UUID NOT NULL REFERENCES grocery.purchase_invoices(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES grocery.products(id),
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    line_total NUMERIC(12, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS grocery.sales (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    sale_number VARCHAR(255) UNIQUE NOT NULL,
    sale_type VARCHAR(255) NOT NULL CHECK (sale_type IN ('CUSTOMER','SHOP')),
    target_shop_id UUID REFERENCES admin.shops(id),
    source_shop_id UUID REFERENCES admin.shops(id),
    sale_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_amount NUMERIC(12, 2) NOT NULL,
    notes VARCHAR(255),
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_discount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grocery.sale_items (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES grocery.sales(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES grocery.products(id),
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    discount_percentage NUMERIC(5, 2) DEFAULT 0.00,
    discount_amount NUMERIC(12, 2) DEFAULT 0.00,
    line_total NUMERIC(12, 2) NOT NULL
);

-- ==============================================================================
-- 3. CONSTRAINTS & INDEXES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_users_username ON admin.users(username);
CREATE INDEX IF NOT EXISTS idx_users_shop_id ON admin.users(shop_id);
CREATE INDEX IF NOT EXISTS idx_shops_code ON admin.shops(code);
CREATE INDEX IF NOT EXISTS idx_products_category ON grocery.products(category);
CREATE INDEX IF NOT EXISTS idx_purchase_invoices_supplier ON grocery.purchase_invoices(supplier_id);
CREATE INDEX IF NOT EXISTS idx_sales_sale_number ON grocery.sales(sale_number);
CREATE INDEX IF NOT EXISTS idx_sales_source_shop ON grocery.sales(source_shop_id);
CREATE INDEX IF NOT EXISTS idx_sales_target_shop ON grocery.sales(target_shop_id);

-- Performance Indexes for SaaS Multi-Tenant Scale
CREATE INDEX IF NOT EXISTS idx_users_tenant_username ON admin.users(tenant_id, username);
CREATE INDEX IF NOT EXISTS idx_shops_tenant_code ON admin.shops(tenant_id, code);
CREATE INDEX IF NOT EXISTS idx_shop_terminals_tenant_shop ON admin.shop_terminals(tenant_id, shop_id);
CREATE INDEX IF NOT EXISTS idx_products_tenant_category ON grocery.products(tenant_id, category);
CREATE INDEX IF NOT EXISTS idx_suppliers_tenant ON grocery.suppliers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_stock_ledger_tenant_shop_item ON grocery.stock_ledger(tenant_id, shop_id, item_id);
CREATE INDEX IF NOT EXISTS idx_sales_tenant_source_date ON grocery.sales(tenant_id, source_shop_id, sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_tenant_source_term_date ON grocery.sales(tenant_id, source_shop_id, terminal_id, sale_date);
CREATE INDEX IF NOT EXISTS idx_sale_items_tenant_sale ON grocery.sale_items(tenant_id, sale_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_tenant_date ON accounting.journal_entries(tenant_id, entry_date);

-- ==============================================================================
-- 4. SEED DATA
-- ==============================================================================

DO $$
BEGIN
    -- Seed System Settings
    INSERT INTO admin.system_settings (setting_key, setting_value, updated_by, updated_at) VALUES 
    ('BUSINESS_PROFILE', '{"name":"Coop Grocery","currency":"LKR"}', 'system', CURRENT_TIMESTAMP),
    ('SECURITY_SETTINGS', '{"mfa_enabled":false}', 'system', CURRENT_TIMESTAMP),
    ('USER_PREFERENCES', '{}', 'system', CURRENT_TIMESTAMP),
    ('BACKUP_SETTINGS', '{"auto_backup":true}', 'system', CURRENT_TIMESTAMP)
    ON CONFLICT (setting_key) DO NOTHING;

    -- NOTE: Users and Shops are handled automatically by the Spring Boot DatabaseSeeder 
    -- during startup. Valid BCrypt hashes are correctly managed by the passwordEncoder 
    -- in DatabaseSeeder.java, ensuring compatibility and secure initialization.
END $$;