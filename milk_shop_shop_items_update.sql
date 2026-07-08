-- 1. Rename item_product reorder_level to default_reorder_level
ALTER TABLE schema_milk_shop.item_product RENAME COLUMN reorder_level TO default_reorder_level;

-- 2. Create shop_item table
CREATE TABLE IF NOT EXISTS schema_milk_shop.shop_item (
    id UUID PRIMARY KEY,
    shop_id UUID NOT NULL REFERENCES schema_admin.shops(id),
    item_id UUID NOT NULL REFERENCES schema_milk_shop.item_product(id),
    reorder_level INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(shop_id, item_id)
);

-- 3. Ensure stock_ledger has shop_id (already added in previous step, but safe to include)
ALTER TABLE schema_milk_shop.stock_ledger ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES schema_admin.shops(id);

-- Add unique constraint for stock ledger
ALTER TABLE schema_milk_shop.stock_ledger ADD CONSTRAINT unique_shop_item_ledger UNIQUE (shop_id, item_id);
