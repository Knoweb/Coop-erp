package com.coop.erp.inventory.service;

import com.coop.erp.inventory.dto.GrnItemRequest;
import com.coop.erp.inventory.dto.GrnRequest;
import com.coop.erp.inventory.dto.GrnResponse;
import com.coop.erp.inventory.entity.ItemProduct;
import com.coop.erp.inventory.entity.PurchaseInvoice;
import com.coop.erp.inventory.entity.PurchaseInvoiceItem;
import com.coop.erp.inventory.entity.StockLedger;
import com.coop.erp.inventory.entity.Supplier;
import com.coop.erp.inventory.repository.ItemProductRepository;
import com.coop.erp.accounting.service.JournalEntryService;
import com.coop.erp.inventory.repository.PurchaseInvoiceItemRepository;
import com.coop.erp.inventory.repository.PurchaseInvoiceRepository;
import com.coop.erp.inventory.repository.StockLedgerRepository;
import com.coop.erp.inventory.repository.SupplierRepository;
import com.coop.erp.admin.service.AuditLogService;
import com.coop.erp.core.entity.Shop;
import com.coop.erp.core.entity.User;
import com.coop.erp.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.coop.erp.auth.util.TenantContext;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GrnService {

    private final PurchaseInvoiceRepository purchaseInvoiceRepository;
    private final PurchaseInvoiceItemRepository purchaseInvoiceItemRepository;
    private final SupplierRepository supplierRepository;
    private final ItemProductRepository itemProductRepository;
    private final StockLedgerRepository stockLedgerRepository;
    private final UserRepository userRepository;
    private final JournalEntryService journalEntryService;
    private final AuditLogService auditLogService;

    private Shop getCurrentUserShop() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        // If user is ADMIN or doesn't have a shop, return null for Main Shop stock
        return user.getShop();
    }

    @org.springframework.transaction.annotation.Transactional
    public GrnResponse createGrn(GrnRequest request) {
        Shop currentShop = getCurrentUserShop();

        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        BigDecimal totalAmount = calculateTotalAmount(request.getItems());

        PurchaseInvoice purchaseInvoice = PurchaseInvoice.builder()
                .supplier(supplier)
                .invoiceNumber(request.getInvoiceNumber())
                .invoiceDate(request.getInvoiceDate())
                .totalAmount(totalAmount)
                .remarks(request.getRemarks())
                .createdAt(LocalDateTime.now())
                .build();

        PurchaseInvoice savedInvoice = purchaseInvoiceRepository.save(purchaseInvoice);

        UUID tenantId = TenantContext.getCurrentTenantId();

        for (GrnItemRequest itemRequest : request.getItems()) {
            if (itemRequest.getQuantity() == null || itemRequest.getQuantity() <= 0) {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Item quantity must be greater than 0");
            }
            if (itemRequest.getUnitPrice() == null || itemRequest.getUnitPrice().compareTo(BigDecimal.ZERO) < 0) {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Item unit price cannot be negative");
            }
            
            ItemProduct item = itemProductRepository.findById(itemRequest.getItemId())
                    .orElseThrow(() -> new RuntimeException("Item not found"));

            BigDecimal lineTotal = itemRequest.getUnitPrice()
                    .multiply(BigDecimal.valueOf(itemRequest.getQuantity()));

            PurchaseInvoiceItem invoiceItem = PurchaseInvoiceItem.builder()
                    .purchaseInvoice(savedInvoice)
                    .item(item)
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(itemRequest.getUnitPrice())
                    .lineTotal(lineTotal)
                    .build();

            purchaseInvoiceItemRepository.save(invoiceItem);

            increaseStock(item, itemRequest.getQuantity(), currentShop, tenantId);
        }

        // Accounting Entry
        try {
            List<JournalEntryService.JournalLineRequest> lines = List.of(
                    new JournalEntryService.JournalLineRequest("1200", "Inventory Purchase", savedInvoice.getTotalAmount(), BigDecimal.ZERO),
                    new JournalEntryService.JournalLineRequest("1000", "Payment", BigDecimal.ZERO, savedInvoice.getTotalAmount())
            );

            String username = SecurityContextHolder.getContext().getAuthentication() != null ? 
                    SecurityContextHolder.getContext().getAuthentication().getName() : "System";

            journalEntryService.postEntry(
                    "PURCHASE",
                    savedInvoice.getId(),
                    savedInvoice.getInvoiceDate(),
                    "Purchase " + savedInvoice.getInvoiceNumber(),
                    username,
                    lines
            );
        } catch (Exception e) {
            System.err.println("Failed to create journal entry for purchase: " + e.getMessage());
        }

        auditLogService.logTenantAction(
                "GRN_CREATED",
                "PURCHASE_INVOICE",
                savedInvoice.getId().toString(),
                "Created GRN / Purchase Invoice: " + savedInvoice.getInvoiceNumber() + " from Supplier: " + supplier.getName(),
                null,
                String.format("{\"totalAmount\": %s}", savedInvoice.getTotalAmount())
        );

        return buildResponse(savedInvoice);
    }

    public List<GrnResponse> getAllGrns() {
        return purchaseInvoiceRepository.findAllByOrderByInvoiceDateDesc()
                .stream()
                .map(this::buildResponse)
                .toList();
    }

    private BigDecimal calculateTotalAmount(List<GrnItemRequest> items) {
        return items.stream()
                .map(item -> item.getUnitPrice()
                        .multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private void increaseStock(ItemProduct item, Integer quantity, Shop shop, UUID tenantId) {
        StockLedger stockLedger;
        
        if (shop != null) {
            stockLedger = stockLedgerRepository.findShopStockForUpdate(tenantId, shop.getId(), item.getId())
                    .orElseGet(() -> {
                        StockLedger newStock = new StockLedger();
                        newStock.setItem(item);
                        newStock.setShop(shop);
                        newStock.setTenant(shop.getTenant());
                        newStock.setCurrentQty(0);
                        newStock.setLastUpdated(LocalDateTime.now());
                        return newStock;
                    });
        } else {
            stockLedger = stockLedgerRepository.findMainStockForUpdate(tenantId, item.getId())
                    .orElseGet(() -> {
                        StockLedger newStock = new StockLedger();
                        newStock.setItem(item);
                        newStock.setShop(null);
                        
                        // We need the Tenant object to set the relationship if we are saving it
                        // In an actual scenario, we'd fetch tenant if null.
                        // But wait! There's a helper trick: user.getTenant() is already what tenantId represents.
                        // Let's create a proxy Tenant
                        com.coop.erp.admin.entity.Tenant proxyTenant = new com.coop.erp.admin.entity.Tenant();
                        proxyTenant.setId(tenantId);
                        newStock.setTenant(proxyTenant);
                        
                        newStock.setCurrentQty(0);
                        newStock.setLastUpdated(LocalDateTime.now());
                        return newStock;
                    });
        }

        stockLedger.setCurrentQty(stockLedger.getCurrentQty() + quantity);
        stockLedger.setLastUpdated(LocalDateTime.now());

        stockLedgerRepository.save(stockLedger);
    }

    private GrnResponse buildResponse(PurchaseInvoice purchaseInvoice) {
        List<PurchaseInvoiceItem> invoiceItems =
                purchaseInvoiceItemRepository.findByPurchaseInvoice(purchaseInvoice);

        List<GrnResponse.GrnResponseItem> responseItems = invoiceItems.stream()
                .map(item -> GrnResponse.GrnResponseItem.builder()
                        .itemName(item.getItem().getName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .lineTotal(item.getLineTotal())
                        .build())
                .toList();

        return GrnResponse.builder()
                .id(purchaseInvoice.getId())
                .supplierName(purchaseInvoice.getSupplier().getName())
                .invoiceNumber(purchaseInvoice.getInvoiceNumber())
                .invoiceDate(purchaseInvoice.getInvoiceDate())
                .totalAmount(purchaseInvoice.getTotalAmount())
                .remarks(purchaseInvoice.getRemarks())
                .items(responseItems)
                .build();
    }
}