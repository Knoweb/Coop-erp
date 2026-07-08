-- 1. UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Milk shop schema
CREATE SCHEMA IF NOT EXISTS schema_milk_shop;

-- 3. Milk shop tables

-- supplier
CREATE TABLE IF NOT EXISTS schema_milk_shop.supplier (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20),
    address VARCHAR(255),
    is_active BOOLEAN DEFAULT true
);

-- item_product
CREATE TABLE IF NOT EXISTS schema_milk_shop.item_product (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    reorder_level INTEGER NOT NULL DEFAULT 10,
    unit_price DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- stock_ledger
CREATE TABLE IF NOT EXISTS schema_milk_shop.stock_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL,
    current_qty INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMP,
    CONSTRAINT fk_stock_ledger_item FOREIGN KEY (item_id) REFERENCES schema_milk_shop.item_product(id)
);

-- purchase_invoice
CREATE TABLE IF NOT EXISTS schema_milk_shop.purchase_invoice (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID NOT NULL,
    invoice_number VARCHAR(50),
    total_amount DECIMAL(12, 2) NOT NULL,
    invoice_date DATE NOT NULL,
    remarks VARCHAR(255),
    created_at TIMESTAMP,
    CONSTRAINT fk_purchase_invoice_supplier FOREIGN KEY (supplier_id) REFERENCES schema_milk_shop.supplier(id)
);

-- purchase_invoice_item
CREATE TABLE IF NOT EXISTS schema_milk_shop.purchase_invoice_item (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_invoice_id UUID NOT NULL,
    item_id UUID NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    line_total DECIMAL(12, 2) NOT NULL,
    CONSTRAINT fk_pi_item_invoice FOREIGN KEY (purchase_invoice_id) REFERENCES schema_milk_shop.purchase_invoice(id) ON DELETE CASCADE,
    CONSTRAINT fk_pi_item_product FOREIGN KEY (item_id) REFERENCES schema_milk_shop.item_product(id)
);

-- daily_sales
CREATE TABLE IF NOT EXISTS schema_milk_shop.daily_sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sales_date DATE NOT NULL UNIQUE,
    total_sales_value DECIMAL(12, 2) NOT NULL,
    cash_handed_over DECIMAL(12, 2) NOT NULL,
    discrepancy DECIMAL(10, 2),
    operator_id UUID NOT NULL,
    received_by VARCHAR(100),
    remarks VARCHAR(255),
    created_at TIMESTAMP
);

-- stock_adjustment_log
CREATE TABLE IF NOT EXISTS schema_milk_shop.stock_adjustment_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL,
    adjustment_type VARCHAR(50) NOT NULL,
    previous_qty INTEGER NOT NULL,
    quantity_changed INTEGER NOT NULL,
    new_qty INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    reason VARCHAR(100),
    remarks VARCHAR(255),
    adjustment_date DATE NOT NULL,
    created_at TIMESTAMP,
    CONSTRAINT fk_sal_item FOREIGN KEY (item_id) REFERENCES schema_milk_shop.item_product(id)
);

-- 6. Add sample milk shop data only if tables are empty

DO $$
DECLARE
    item1_id UUID := uuid_generate_v4();
    item2_id UUID := uuid_generate_v4();
    item3_id UUID := uuid_generate_v4();
    item4_id UUID := uuid_generate_v4();
BEGIN
    -- Insert sample suppliers if table is empty
    IF NOT EXISTS (SELECT 1 FROM schema_milk_shop.supplier LIMIT 1) THEN
        INSERT INTO schema_milk_shop.supplier (name, is_active) VALUES
        ('Highland Dairy Products', true),
        ('Kotmale Foods', true),
        ('Milco Pvt Ltd', true);
    END IF;

    -- Insert sample items and their stock ledger entries if table is empty
    IF NOT EXISTS (SELECT 1 FROM schema_milk_shop.item_product LIMIT 1) THEN
        INSERT INTO schema_milk_shop.item_product (id, name, category, reorder_level, unit_price, is_active) VALUES
        (item1_id, 'Fresh Milk', 'Dairy', 10, 500.00, true),
        (item2_id, 'Yoghurt', 'Dairy', 20, 80.00, true),
        (item3_id, 'Cheese', 'Dairy', 5, 1200.00, true),
        (item4_id, 'Butter', 'Dairy', 10, 950.00, true);

        INSERT INTO schema_milk_shop.stock_ledger (item_id, current_qty, last_updated) VALUES
        (item1_id, 0, CURRENT_TIMESTAMP),
        (item2_id, 0, CURRENT_TIMESTAMP),
        (item3_id, 0, CURRENT_TIMESTAMP),
        (item4_id, 0, CURRENT_TIMESTAMP);
    END IF;
END $$;
