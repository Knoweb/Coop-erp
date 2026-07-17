CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE SCHEMA IF NOT EXISTS admin;
CREATE SCHEMA IF NOT EXISTS grocery;
CREATE SCHEMA IF NOT EXISTS accounting;

-- Unique constraints for transaction-safe stock concurrency
CREATE UNIQUE INDEX IF NOT EXISTS ux_stock_ledger_main_tenant_item ON grocery.stock_ledger(tenant_id, item_id) WHERE shop_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_stock_ledger_shop_tenant_shop_item ON grocery.stock_ledger(tenant_id, shop_id, item_id) WHERE shop_id IS NOT NULL;

-- ==========================================
-- INDEXES FOR SAAS PERFORMANCE
-- ==========================================

-- Admin Schema
CREATE UNIQUE INDEX IF NOT EXISTS ux_admin_tenants_code ON admin.tenants(tenant_code);
CREATE INDEX IF NOT EXISTS ix_admin_tenants_is_active ON admin.tenants(is_active);

CREATE INDEX IF NOT EXISTS ix_admin_users_tenant ON admin.users(tenant_id);
CREATE INDEX IF NOT EXISTS ix_admin_users_username ON admin.users(username);
CREATE INDEX IF NOT EXISTS ix_admin_users_email ON admin.users(email);
CREATE UNIQUE INDEX IF NOT EXISTS ux_admin_users_tenant_username ON admin.users(tenant_id, username);
CREATE INDEX IF NOT EXISTS ix_admin_users_tenant_role ON admin.users(tenant_id, role);
CREATE INDEX IF NOT EXISTS ix_admin_users_shop ON admin.users(shop_id);

CREATE INDEX IF NOT EXISTS ix_admin_shops_tenant ON admin.shops(tenant_id);
CREATE UNIQUE INDEX IF NOT EXISTS ux_admin_shops_tenant_code ON admin.shops(tenant_id, code);
CREATE INDEX IF NOT EXISTS ix_admin_shops_tenant_active ON admin.shops(tenant_id, is_active);

CREATE INDEX IF NOT EXISTS ix_admin_terminals_tenant ON admin.shop_terminals(tenant_id);
CREATE INDEX IF NOT EXISTS ix_admin_terminals_shop ON admin.shop_terminals(shop_id);
CREATE INDEX IF NOT EXISTS ix_admin_terminals_tenant_shop ON admin.shop_terminals(tenant_id, shop_id);
CREATE UNIQUE INDEX IF NOT EXISTS ux_admin_terminals_tenant_shop_code ON admin.shop_terminals(tenant_id, shop_id, terminal_code);

CREATE INDEX IF NOT EXISTS ix_admin_utility_bill_tenant ON admin.utility_bill(tenant_id);
CREATE INDEX IF NOT EXISTS ix_admin_utility_bill_created ON admin.utility_bill(created_at);
CREATE INDEX IF NOT EXISTS ix_admin_utility_bill_tenant_created ON admin.utility_bill(tenant_id, created_at);

-- Grocery Schema
CREATE INDEX IF NOT EXISTS ix_grocery_products_tenant ON grocery.products(tenant_id);
CREATE INDEX IF NOT EXISTS ix_grocery_products_name ON grocery.products(name);
CREATE INDEX IF NOT EXISTS ix_grocery_products_category ON grocery.products(category);
CREATE INDEX IF NOT EXISTS ix_grocery_products_active ON grocery.products(is_active);
CREATE INDEX IF NOT EXISTS ix_grocery_products_tenant_name ON grocery.products(tenant_id, name);
CREATE INDEX IF NOT EXISTS ix_grocery_products_tenant_category ON grocery.products(tenant_id, category);
CREATE INDEX IF NOT EXISTS ix_grocery_products_tenant_active ON grocery.products(tenant_id, is_active);

CREATE INDEX IF NOT EXISTS ix_grocery_suppliers_tenant ON grocery.suppliers(tenant_id);
CREATE INDEX IF NOT EXISTS ix_grocery_suppliers_name ON grocery.suppliers(name);
CREATE INDEX IF NOT EXISTS ix_grocery_suppliers_active ON grocery.suppliers(is_active);
CREATE INDEX IF NOT EXISTS ix_grocery_suppliers_tenant_name ON grocery.suppliers(tenant_id, name);
CREATE INDEX IF NOT EXISTS ix_grocery_suppliers_tenant_active ON grocery.suppliers(tenant_id, is_active);

CREATE INDEX IF NOT EXISTS ix_grocery_shop_items_tenant ON grocery.shop_items(tenant_id);
CREATE INDEX IF NOT EXISTS ix_grocery_shop_items_shop ON grocery.shop_items(shop_id);
CREATE INDEX IF NOT EXISTS ix_grocery_shop_items_item ON grocery.shop_items(item_id);
CREATE UNIQUE INDEX IF NOT EXISTS ux_grocery_shop_items_tenant_shop_item ON grocery.shop_items(tenant_id, shop_id, item_id);

CREATE INDEX IF NOT EXISTS ix_grocery_stock_ledger_tenant ON grocery.stock_ledger(tenant_id);
CREATE INDEX IF NOT EXISTS ix_grocery_stock_ledger_shop ON grocery.stock_ledger(shop_id);
CREATE INDEX IF NOT EXISTS ix_grocery_stock_ledger_item ON grocery.stock_ledger(item_id);
CREATE INDEX IF NOT EXISTS ix_grocery_stock_ledger_tenant_shop_item ON grocery.stock_ledger(tenant_id, shop_id, item_id);
CREATE INDEX IF NOT EXISTS ix_grocery_stock_ledger_tenant_item ON grocery.stock_ledger(tenant_id, item_id);

CREATE UNIQUE INDEX IF NOT EXISTS ux_stock_ledger_main_tenant_item ON grocery.stock_ledger(tenant_id, item_id) WHERE shop_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_stock_ledger_shop_tenant_shop_item ON grocery.stock_ledger(tenant_id, shop_id, item_id) WHERE shop_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS ix_grocery_movements_tenant ON grocery.stock_movements(tenant_id);
CREATE INDEX IF NOT EXISTS ix_grocery_movements_shop ON grocery.stock_movements(shop_id);
CREATE INDEX IF NOT EXISTS ix_grocery_movements_item ON grocery.stock_movements(item_id);
CREATE INDEX IF NOT EXISTS ix_grocery_movements_date ON grocery.stock_movements(movement_date);
CREATE INDEX IF NOT EXISTS ix_grocery_movements_tenant_shop_date ON grocery.stock_movements(tenant_id, shop_id, movement_date);

CREATE INDEX IF NOT EXISTS ix_grocery_invoices_tenant ON grocery.purchase_invoices(tenant_id);
CREATE INDEX IF NOT EXISTS ix_grocery_invoices_supplier ON grocery.purchase_invoices(supplier_id);
CREATE INDEX IF NOT EXISTS ix_grocery_invoices_date ON grocery.purchase_invoices(invoice_date);
CREATE INDEX IF NOT EXISTS ix_grocery_invoices_number ON grocery.purchase_invoices(invoice_number);
CREATE INDEX IF NOT EXISTS ix_grocery_invoices_tenant_date ON grocery.purchase_invoices(tenant_id, invoice_date);
CREATE UNIQUE INDEX IF NOT EXISTS ux_grocery_invoices_tenant_number ON grocery.purchase_invoices(tenant_id, invoice_number);

CREATE INDEX IF NOT EXISTS ix_grocery_invoice_items_tenant ON grocery.purchase_invoice_items(tenant_id);
CREATE INDEX IF NOT EXISTS ix_grocery_invoice_items_invoice ON grocery.purchase_invoice_items(purchase_invoice_id);
CREATE INDEX IF NOT EXISTS ix_grocery_invoice_items_item ON grocery.purchase_invoice_items(item_id);

CREATE INDEX IF NOT EXISTS ix_grocery_sales_tenant ON grocery.sales(tenant_id);
CREATE INDEX IF NOT EXISTS ix_grocery_sales_source_shop ON grocery.sales(source_shop_id);
CREATE INDEX IF NOT EXISTS ix_grocery_sales_target_shop ON grocery.sales(target_shop_id);
CREATE INDEX IF NOT EXISTS ix_grocery_sales_terminal ON grocery.sales(terminal_id);
CREATE INDEX IF NOT EXISTS ix_grocery_sales_date ON grocery.sales(sale_date);
CREATE INDEX IF NOT EXISTS ix_grocery_sales_number ON grocery.sales(sale_number);
CREATE INDEX IF NOT EXISTS ix_grocery_sales_tenant_shop_date ON grocery.sales(tenant_id, source_shop_id, sale_date);
CREATE INDEX IF NOT EXISTS ix_grocery_sales_tenant_shop_term_date ON grocery.sales(tenant_id, source_shop_id, terminal_id, sale_date);
CREATE UNIQUE INDEX IF NOT EXISTS ux_grocery_sales_tenant_number ON grocery.sales(tenant_id, sale_number);

CREATE INDEX IF NOT EXISTS ix_grocery_sale_items_tenant ON grocery.sale_items(tenant_id);
CREATE INDEX IF NOT EXISTS ix_grocery_sale_items_sale ON grocery.sale_items(sale_id);
CREATE INDEX IF NOT EXISTS ix_grocery_sale_items_item ON grocery.sale_items(item_id);

CREATE INDEX IF NOT EXISTS ix_grocery_cash_sessions_tenant ON grocery.cash_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS ix_grocery_cash_sessions_shop ON grocery.cash_sessions(shop_id);
CREATE INDEX IF NOT EXISTS ix_grocery_cash_sessions_terminal ON grocery.cash_sessions(terminal_id);
CREATE INDEX IF NOT EXISTS ix_grocery_cash_sessions_user ON grocery.cash_sessions(user_id);
CREATE INDEX IF NOT EXISTS ix_grocery_cash_sessions_opened ON grocery.cash_sessions(opened_at);
CREATE INDEX IF NOT EXISTS ix_grocery_cash_sessions_closed ON grocery.cash_sessions(closed_at);
CREATE INDEX IF NOT EXISTS ix_grocery_cash_sessions_status ON grocery.cash_sessions(status);
CREATE INDEX IF NOT EXISTS ix_grocery_cash_sessions_tenant_shop_term ON grocery.cash_sessions(tenant_id, shop_id, terminal_id);
CREATE INDEX IF NOT EXISTS ix_grocery_cash_sessions_tenant_shop_term_status ON grocery.cash_sessions(tenant_id, shop_id, terminal_id, status);

CREATE INDEX IF NOT EXISTS ix_grocery_seq_tenant ON grocery.sequence_counters(tenant_id);
CREATE INDEX IF NOT EXISTS ix_grocery_seq_scope ON grocery.sequence_counters(scope);
CREATE UNIQUE INDEX IF NOT EXISTS ux_grocery_seq_tenant_scope ON grocery.sequence_counters(tenant_id, scope);

CREATE INDEX IF NOT EXISTS ix_grocery_stock_adj_tenant ON grocery.stock_adjustment_log(tenant_id);
CREATE INDEX IF NOT EXISTS ix_grocery_stock_adj_item ON grocery.stock_adjustment_log(item_id);
CREATE INDEX IF NOT EXISTS ix_grocery_stock_adj_created ON grocery.stock_adjustment_log(created_at);

-- Accounting Schema
CREATE INDEX IF NOT EXISTS ix_accounting_coa_tenant ON accounting.chart_of_accounts(tenant_id);
CREATE INDEX IF NOT EXISTS ix_accounting_coa_code ON accounting.chart_of_accounts(account_code);
CREATE INDEX IF NOT EXISTS ix_accounting_coa_type ON accounting.chart_of_accounts(account_type);
CREATE UNIQUE INDEX IF NOT EXISTS ux_accounting_coa_tenant_code ON accounting.chart_of_accounts(tenant_id, account_code);
CREATE INDEX IF NOT EXISTS ix_accounting_coa_tenant_type ON accounting.chart_of_accounts(tenant_id, account_type);

CREATE INDEX IF NOT EXISTS ix_accounting_journals_tenant ON accounting.journal_entries(tenant_id);
CREATE INDEX IF NOT EXISTS ix_accounting_journals_date ON accounting.journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS ix_accounting_journals_ref_type ON accounting.journal_entries(reference_type);
CREATE INDEX IF NOT EXISTS ix_accounting_journals_ref_id ON accounting.journal_entries(reference_id);
CREATE INDEX IF NOT EXISTS ix_accounting_journals_tenant_date ON accounting.journal_entries(tenant_id, entry_date);
CREATE INDEX IF NOT EXISTS ix_accounting_journals_tenant_ref ON accounting.journal_entries(tenant_id, reference_type, reference_id);

CREATE INDEX IF NOT EXISTS ix_accounting_lines_tenant ON accounting.journal_entry_lines(tenant_id);
CREATE INDEX IF NOT EXISTS ix_accounting_lines_journal ON accounting.journal_entry_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS ix_accounting_lines_account ON accounting.journal_entry_lines(account_id);
CREATE INDEX IF NOT EXISTS ix_accounting_lines_tenant_account ON accounting.journal_entry_lines(tenant_id, account_id);
CREATE INDEX IF NOT EXISTS ix_accounting_lines_tenant_journal ON accounting.journal_entry_lines(tenant_id, journal_entry_id);

