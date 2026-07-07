-- ==============================================================================
-- INITIALIZATION
-- ==============================================================================
-- Enable UUID extension for secure, distributed primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create isolated schemas for each microservice domain
CREATE SCHEMA IF NOT EXISTS schema_admin;
CREATE SCHEMA IF NOT EXISTS schema_milk_shop;
CREATE SCHEMA IF NOT EXISTS schema_beer_garden;
CREATE SCHEMA IF NOT EXISTS schema_room_section;

-- ==============================================================================
-- 1. ADMIN & IAM SCHEMA (schema_admin)
-- ==============================================================================

CREATE TABLE schema_admin.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, 
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE schema_admin.utility_bill (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    utility_type VARCHAR(50) NOT NULL, 
    billing_month VARCHAR(7) NOT NULL, 
    total_amount DECIMAL(12, 2) NOT NULL,
    milk_shop_ratio DECIMAL(3, 2) NOT NULL,
    room_section_ratio DECIMAL(3, 2) NOT NULL, 
    recorded_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE schema_admin.audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    service_name VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 2. MILK SHOP SCHEMA (schema_milk_shop)
-- ==============================================================================

CREATE TABLE schema_milk_shop.supplier (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20),
    address VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE schema_milk_shop.item_product (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    reorder_level INT NOT NULL DEFAULT 10,
    unit_price DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE schema_milk_shop.stock_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES schema_milk_shop.item_product(id),
    current_qty INT NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE schema_milk_shop.purchase_invoice ( 
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES schema_milk_shop.supplier(id),
    invoice_number VARCHAR(50),
    total_amount DECIMAL(12, 2) NOT NULL,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    remarks VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- new table to link purchase invoices to their line items
CREATE TABLE IF NOT EXISTS schema_milk_shop.purchase_invoice_item (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_invoice_id UUID NOT NULL REFERENCES schema_milk_shop.purchase_invoice(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES schema_milk_shop.item_product(id),
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    line_total DECIMAL(12, 2) NOT NULL
);

CREATE TABLE schema_milk_shop.daily_sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sales_date DATE UNIQUE NOT NULL,
    total_sales_value DECIMAL(12, 2) NOT NULL,
    cash_handed_over DECIMAL(12, 2) NOT NULL,
    discrepancy DECIMAL(10, 2) DEFAULT 0.00,
    operator_id UUID NOT NULL,
    received_by VARCHAR(100),
    remarks VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS schema_milk_shop.stock_adjustment_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    item_id UUID NOT NULL REFERENCES schema_milk_shop.item_product(id),

    adjustment_type VARCHAR(50) NOT NULL,

    previous_qty INT NOT NULL,
    quantity_changed INT NOT NULL,
    new_qty INT NOT NULL,

    unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,

    reason VARCHAR(100),
    remarks VARCHAR(255),

    adjustment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 3. BEER GARDEN SCHEMA (schema_beer_garden) - FULLY NORMALIZED
-- ==============================================================================

-- 1. Master Item Catalog
CREATE TABLE schema_beer_garden.beer_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_code VARCHAR(50) UNIQUE NOT NULL,
    beer_name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    current_stock INT NOT NULL DEFAULT 0, 
    unit_price DECIMAL(12, 2) 
);

-- 2. Supplier Profiles
CREATE TABLE schema_beer_garden.suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100),
    territory VARCHAR(100),
    contact_details VARCHAR(255),
    credit_terms VARCHAR(100),
    outstanding_balance DECIMAL(15, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Price List
CREATE TABLE schema_beer_garden.beer_price_list (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    beer_item_id UUID NOT NULL REFERENCES schema_beer_garden.beer_items(id) ON DELETE CASCADE,
    unit_price DECIMAL(12, 2) NOT NULL,
    effective_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    authorized_by VARCHAR(255) NOT NULL
);

-- 4. GRN Parent Table
CREATE TABLE schema_beer_garden.beer_garden_grn (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grn_number VARCHAR(100),
    supplier_name VARCHAR(255),
    received_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(12, 2),
    amount_paid DECIMAL(12, 2) DEFAULT 0.00,
    status VARCHAR(50)
);

-- 5. GRN Items
CREATE TABLE schema_beer_garden.grn_item (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grn_invoice_id UUID NOT NULL REFERENCES schema_beer_garden.beer_garden_grn(id) ON DELETE CASCADE,
    beer_item_id UUID NOT NULL REFERENCES schema_beer_garden.beer_items(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_cost DECIMAL(12, 2) NOT NULL CHECK (unit_cost >= 0),
    line_total DECIMAL(12, 2) NOT NULL
);

-- 6. Supplier Payments Ledger (THE FIX IS HERE)
CREATE TABLE schema_beer_garden.supplier_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL REFERENCES schema_beer_garden.suppliers(id),
    -- Fixed: Now correctly points to beer_garden_grn instead of the deleted table
    grn_invoice_id UUID REFERENCES schema_beer_garden.beer_garden_grn(id), 
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    payment_reference VARCHAR(100)
);

-- 7. Issuance Invoice (Sales)
CREATE TABLE schema_beer_garden.issuance_invoice (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    operator_name VARCHAR(150) NOT NULL,
    issued_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_stock_value DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_commission DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    grand_total DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    issued_by_role VARCHAR(255) NOT NULL,
    status VARCHAR(50),                                  
    priority_level VARCHAR(50) DEFAULT 'MEDIUM'          
);

-- 8. Payment Record (For Issuance Invoices)
CREATE TABLE IF NOT EXISTS schema_beer_garden.payment_record (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES schema_beer_garden.issuance_invoice(id),
    amount_paid DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    reference_number VARCHAR(50), 
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Issuance Item 
CREATE TABLE schema_beer_garden.issuance_item (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES schema_beer_garden.issuance_invoice(id) ON DELETE CASCADE,
    beer_item_id UUID NOT NULL REFERENCES schema_beer_garden.beer_items(id),
    quantity INT NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    commission_per_bottle DECIMAL(12, 2) NOT NULL,
    line_total DECIMAL(12, 2) NOT NULL
);

-- 10. Performance Index
CREATE INDEX idx_beer_invoice_status ON schema_beer_garden.issuance_invoice(status);
-- ==============================================================================
-- 4. ROOM SECTION SCHEMA (schema_room_section)
-- ==============================================================================

CREATE TABLE schema_room_section.room (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_number VARCHAR(10) UNIQUE NOT NULL,
    room_type VARCHAR(20) NOT NULL, -- AC, NON_AC
    base_price DECIMAL(10, 2) NOT NULL,
    extra_hour_rate DECIMAL(10, 2) DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE' -- AVAILABLE, OCCUPIED, MAINTENANCE
);

CREATE TABLE schema_room_section.room_billing_setting (
    id INT PRIMARY KEY,
    vat_rate DECIMAL(5, 2) NOT NULL DEFAULT 18.00,
    sscl_rate DECIMAL(5, 2) NOT NULL DEFAULT 2.50
);

CREATE TABLE schema_room_section.guest_booking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES schema_room_section.room(id),
    
    guest_name VARCHAR(100) NOT NULL,
    nic_passport VARCHAR(50) NOT NULL,
    adults INT DEFAULT 1,                            
    children INT DEFAULT 0,                            
    
    check_in TIMESTAMP NOT NULL,
    check_out TIMESTAMP,

    no_of_days INT DEFAULT 1,
    extra_hours INT DEFAULT 0,
    extra_hour_charge DECIMAL(12, 2) DEFAULT 0.00,

    service_charge_amount DECIMAL(12, 2) DEFAULT 0.00, 

    advance_payment DECIMAL(10, 2) DEFAULT 0.00,

    final_payment_amount DECIMAL(12, 2) DEFAULT 0.00,
    final_payment_date TIMESTAMP,
    payment_status VARCHAR(20) DEFAULT 'PARTIAL',       -- PARTIAL, PAID

    sub_total DECIMAL(12, 2) NOT NULL,
    vat_rate DECIMAL(5, 2) DEFAULT 18.00,
    sscl_rate DECIMAL(5, 2) DEFAULT 2.50,
    tax_amount DECIMAL(10, 2) NOT NULL,                 -- VAT + SSCL
    total_due DECIMAL(12, 2) NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'        -- ACTIVE, CHECKED_OUT, CANCELLED
);

CREATE TABLE schema_room_section.daily_remittance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    remittance_date DATE UNIQUE NOT NULL,
    total_collected DECIMAL(12, 2) NOT NULL,
    receptionist_id UUID NOT NULL, -- Soft reference to admin.users
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- INDEXING FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX idx_milk_sales_date ON schema_milk_shop.daily_sales(sales_date);
DROP INDEX IF EXISTS schema_beer_garden.idx_beer_invoice_status;
CREATE INDEX idx_beer_invoice_status ON schema_beer_garden.issuance_invoice(status);
CREATE INDEX idx_room_booking_dates ON schema_room_section.guest_booking(check_in, check_out);