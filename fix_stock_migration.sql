-- Fix item_product default_reorder_level
ALTER TABLE schema_milk_shop.item_product
ADD COLUMN IF NOT EXISTS default_reorder_level INTEGER;

UPDATE schema_milk_shop.item_product
SET default_reorder_level = COALESCE(default_reorder_level, 10);

ALTER TABLE schema_milk_shop.item_product
ALTER COLUMN default_reorder_level SET NOT NULL;

-- Fix stock_ledger shop_id
ALTER TABLE schema_milk_shop.stock_ledger
ADD COLUMN IF NOT EXISTS shop_id UUID;

DO .\fix_stock_migration.sql
DECLARE
    main_shop_id UUID;
BEGIN
    SELECT id INTO main_shop_id
    FROM schema_admin.shops
    WHERE code IN ('MAIN', 'MAIN_SHOP', 'ADMIN')
    ORDER BY created_at ASC
    LIMIT 1;

    IF main_shop_id IS NULL THEN
        SELECT id INTO main_shop_id
        FROM schema_admin.shops
        ORDER BY created_at ASC
        LIMIT 1;
    END IF;

    IF main_shop_id IS NOT NULL THEN
        UPDATE schema_milk_shop.stock_ledger
        SET shop_id = main_shop_id
        WHERE shop_id IS NULL;
    END IF;
END .\fix_stock_migration.sql;

ALTER TABLE schema_milk_shop.stock_ledger
ALTER COLUMN shop_id SET NOT NULL;

-- Add FK safely
DO .\fix_stock_migration.sql
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_schema = 'schema_milk_shop'
        AND table_name = 'stock_ledger'
        AND constraint_name = 'fk_stock_ledger_shop'
    ) THEN
        ALTER TABLE schema_milk_shop.stock_ledger
        ADD CONSTRAINT fk_stock_ledger_shop
        FOREIGN KEY (shop_id)
        REFERENCES schema_admin.shops(id);
    END IF;
END .\fix_stock_migration.sql;

-- Add unique constraint safely
DO .\fix_stock_migration.sql
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_schema = 'schema_milk_shop'
        AND table_name = 'stock_ledger'
        AND constraint_name = 'uk_stock_ledger_shop_item'
    ) THEN
        ALTER TABLE schema_milk_shop.stock_ledger
        ADD CONSTRAINT uk_stock_ledger_shop_item
        UNIQUE (shop_id, item_id);
    END IF;
END .\fix_stock_migration.sql;
