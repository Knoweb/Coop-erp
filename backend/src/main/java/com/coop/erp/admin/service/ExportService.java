package com.coop.erp.admin.service;

import com.coop.erp.admin.entity.AuditLog;
import com.coop.erp.admin.entity.Tenant;
import com.coop.erp.admin.repository.AuditLogRepository;
import com.coop.erp.admin.repository.TenantRepository;
import com.coop.erp.core.entity.Shop;
import com.coop.erp.core.repository.ShopRepository;
import com.coop.erp.inventory.entity.*;
import com.coop.erp.inventory.repository.*;
import com.coop.erp.auth.util.TenantContext;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Service;

import java.io.StringWriter;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ExportService {

    private final ItemProductRepository itemProductRepository;
    private final SupplierRepository supplierRepository;
    private final ShopRepository shopRepository;
    private final StockLedgerRepository stockLedgerRepository;
    private final SaleRepository saleRepository;
    private final PurchaseInvoiceRepository purchaseInvoiceRepository;
    private final CashSessionRepository cashSessionRepository;
    private final AuditLogRepository auditLogRepository;
    private final TenantRepository tenantRepository;
    private final AuditLogService auditLogService;

    public ExportService(ItemProductRepository itemProductRepository,
                         SupplierRepository supplierRepository,
                         ShopRepository shopRepository,
                         StockLedgerRepository stockLedgerRepository,
                         SaleRepository saleRepository,
                         PurchaseInvoiceRepository purchaseInvoiceRepository,
                         CashSessionRepository cashSessionRepository,
                         AuditLogRepository auditLogRepository,
                         TenantRepository tenantRepository,
                         AuditLogService auditLogService) {
        this.itemProductRepository = itemProductRepository;
        this.supplierRepository = supplierRepository;
        this.shopRepository = shopRepository;
        this.stockLedgerRepository = stockLedgerRepository;
        this.saleRepository = saleRepository;
        this.purchaseInvoiceRepository = purchaseInvoiceRepository;
        this.cashSessionRepository = cashSessionRepository;
        this.auditLogRepository = auditLogRepository;
        this.tenantRepository = tenantRepository;
        this.auditLogService = auditLogService;
    }

    private String toCsvString(CSVPrinter printer, StringWriter sw, String action) {
        try {
            printer.flush();
            String result = sw.toString();
            auditLogService.logTenantAction(action, "EXPORT", null, "Exported " + action, null, null);
            return result;
        } catch (Exception e) {
            throw new RuntimeException("Error generating CSV", e);
        }
    }

    public String exportProducts() throws Exception {
        StringWriter sw = new StringWriter();
        try (CSVPrinter printer = new CSVPrinter(sw, CSVFormat.DEFAULT.withHeader("Product ID", "Product Name", "Category", "Unit Price", "Cost Price", "Reorder Level", "Active", "Created At"))) {
            List<ItemProduct> products = itemProductRepository.findAll();
            for (ItemProduct p : products) {
                printer.printRecord(p.getId(), p.getName(), p.getCategory(), p.getUnitPrice(), p.getCostPrice(), p.getDefaultReorderLevel(), p.getIsActive(), "");
            }
            return toCsvString(printer, sw, "DATA_EXPORT_PRODUCTS");
        }
    }

    public String exportSuppliers() throws Exception {
        StringWriter sw = new StringWriter();
        try (CSVPrinter printer = new CSVPrinter(sw, CSVFormat.DEFAULT.withHeader("Supplier ID", "Supplier Name", "Contact Person", "Phone", "Email", "Address", "Active", "Created At"))) {
            List<Supplier> suppliers = supplierRepository.findAll();
            for (Supplier s : suppliers) {
                printer.printRecord(s.getId(), s.getName(), "", s.getContactNumber(), "", s.getAddress(), s.getIsActive(), "");
            }
            return toCsvString(printer, sw, "DATA_EXPORT_SUPPLIERS");
        }
    }

    public String exportShops() throws Exception {
        StringWriter sw = new StringWriter();
        try (CSVPrinter printer = new CSVPrinter(sw, CSVFormat.DEFAULT.withHeader("Code", "Name", "Address", "Contact", "Status", "Created At"))) {
            List<Shop> shops = shopRepository.findAll();
            for (Shop s : shops) {
                printer.printRecord(
                    s.getCode(), s.getName(), s.getAddress(), s.getContactNumber(),
                    s.getActive() ? "Active" : "Inactive", s.getCreatedAt()
                );
            }
        }
        auditLogService.logTenantAction("DATA_EXPORT_SHOPS", "SHOP", null, "Exported shops data", null, null);
        return sw.toString();
    }

    public String exportStock() throws Exception {
        StringWriter sw = new StringWriter();
        try (CSVPrinter printer = new CSVPrinter(sw, CSVFormat.DEFAULT.withHeader("Shop Code", "Product Code", "Product Name", "Current Quantity", "Reorder Level", "Last Updated"))) {
            List<StockLedger> stock = stockLedgerRepository.findAll();
            for (StockLedger l : stock) {
                printer.printRecord(
                    l.getShop() != null ? l.getShop().getCode() : "Main",
                    l.getItem().getId(),
                    l.getItem().getName(),
                    l.getCurrentQty(),
                    l.getItem().getDefaultReorderLevel(),
                    l.getLastUpdated()
                );
            }
        }
        auditLogService.logTenantAction("DATA_EXPORT_STOCK", "STOCK_LEDGER", null, "Exported stock ledger data", null, null);
        return sw.toString();
    }

    public String exportSales(LocalDateTime fromDate, LocalDateTime toDate) throws Exception {
        StringWriter sw = new StringWriter();
        try (CSVPrinter printer = new CSVPrinter(sw, CSVFormat.DEFAULT.withHeader("Sale Date", "Sale Number", "Shop", "Terminal", "Total Amount", "Cashier", "Payment Method"))) {
            List<Sale> sales = saleRepository.findBySaleDateBetween(fromDate, toDate);
            for (Sale s : sales) {
                printer.printRecord(
                    s.getSaleDate(), s.getSaleNumber(), 
                    s.getSourceShop() != null ? s.getSourceShop().getName() : "Main",
                    s.getTerminalCode() != null ? s.getTerminalCode() : (s.getTerminalId() != null ? s.getTerminalId().toString() : ""),
                    s.getTotalAmount(),
                    s.getCreatedBy(),
                    s.getPaymentMethod()
                );
            }
        }
        auditLogService.logTenantAction("DATA_EXPORT_SALES", "SALE", null, "Exported sales data", null, null);
        return sw.toString();
    }

    public String exportPurchases(LocalDateTime fromDate, LocalDateTime toDate) throws Exception {
        StringWriter sw = new StringWriter();
        try (CSVPrinter printer = new CSVPrinter(sw, CSVFormat.DEFAULT.withHeader("Invoice Date", "Invoice Number", "Supplier Name", "Total Amount", "Remarks", "Created At"))) {
            List<PurchaseInvoice> purchases = purchaseInvoiceRepository.findByInvoiceDateBetween(fromDate.toLocalDate(), toDate.toLocalDate());
            for (PurchaseInvoice p : purchases) {
                printer.printRecord(
                    p.getInvoiceDate(), p.getInvoiceNumber(), p.getSupplier().getName(),
                    p.getTotalAmount(), p.getRemarks(), p.getCreatedAt()
                );
            }
        }
        auditLogService.logTenantAction("DATA_EXPORT_PURCHASES", "PURCHASE_INVOICE", null, "Exported purchases data", null, null);
        return sw.toString();
    }

    public String exportCashSessions(LocalDateTime fromDate, LocalDateTime toDate) throws Exception {
        StringWriter sw = new StringWriter();
        try (CSVPrinter printer = new CSVPrinter(sw, CSVFormat.DEFAULT.withHeader("Opened At", "Closed At", "Shop Code", "Shop Name", "Terminal Code", "Cashier", "Opening Cash", "Expected Cash", "Actual Cash", "Difference", "Cash Sales Total", "Card Sales Total", "Status"))) {
            List<CashSession> sessions = cashSessionRepository.findByOpenedAtBetween(fromDate, toDate);
            for (CashSession c : sessions) {
                printer.printRecord(
                    c.getOpenedAt(), c.getClosedAt(), c.getShop().getCode(), c.getShop().getName(),
                    c.getTerminal().getTerminalCode(), c.getUser().getUsername(), 
                    c.getOpeningCash(), c.getExpectedCash(), c.getActualCash(), c.getDifference(),
                    c.getCashSalesTotal(), c.getCardSalesTotal(), c.getStatus()
                );
            }
            return toCsvString(printer, sw, "DATA_EXPORT_CASH_SESSIONS");
        }
    }

    public String exportAuditLogs(LocalDateTime fromDate, LocalDateTime toDate) throws Exception {
        StringWriter sw = new StringWriter();
        UUID tenantId = TenantContext.getCurrentTenantId();
        try (CSVPrinter printer = new CSVPrinter(sw, CSVFormat.DEFAULT.withHeader("Date Time", "Username", "Role", "Action", "Entity Type", "Entity ID", "Description", "Shop ID", "Terminal ID", "IP Address"))) {
            List<AuditLog> logs = auditLogRepository.findByTenantIdAndCreatedAtBetweenOrderByCreatedAtDesc(tenantId, fromDate, toDate);
            for (AuditLog log : logs) {
                printer.printRecord(
                    log.getCreatedAt(), log.getUsername(), log.getRole(), log.getAction(),
                    log.getEntityType(), log.getEntityId(), log.getDescription(), 
                    log.getShopId(), log.getTerminalId(), log.getIpAddress()
                );
            }
            return toCsvString(printer, sw, "DATA_EXPORT_AUDIT_LOGS");
        }
    }

    // PLATFORM LEVEL EXPORTS
    public String exportTenants() throws Exception {
        StringWriter sw = new StringWriter();
        try (CSVPrinter printer = new CSVPrinter(sw, CSVFormat.DEFAULT.withHeader("Tenant ID", "Tenant Code", "Tenant Name", "Tenant Type", "Status", "Created At"))) {
            List<Tenant> tenants = tenantRepository.findAll();
            for (Tenant t : tenants) {
                printer.printRecord(
                    t.getId(), t.getTenantCode(), t.getTenantName(), t.getTenantType(),
                    t.isActive() ? "Active" : "Inactive", t.getCreatedAt()
                );
            }
        }
        // Platform level doesn't have a specific tenant context
        return sw.toString();
    }
}
