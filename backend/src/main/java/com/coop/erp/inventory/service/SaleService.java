package com.coop.erp.inventory.service;

import com.coop.erp.admin.entity.ShopTerminal;
import com.coop.erp.admin.repository.ShopTerminalRepository;
import com.coop.erp.core.entity.Shop;
import com.coop.erp.core.repository.ShopRepository;
import com.coop.erp.inventory.dto.SaleRequest;
import com.coop.erp.inventory.dto.SaleResponse;
import com.coop.erp.inventory.entity.ItemProduct;
import com.coop.erp.inventory.entity.Sale;
import com.coop.erp.inventory.entity.SaleItem;
import com.coop.erp.inventory.entity.SaleType;
import com.coop.erp.inventory.entity.StockLedger;
import com.coop.erp.inventory.entity.StockMovement;
import com.coop.erp.inventory.entity.CashSession;
import com.coop.erp.inventory.entity.PaymentMethod;
import com.coop.erp.inventory.entity.PaymentStatus;
import com.coop.erp.accounting.service.JournalEntryService;
import com.coop.erp.inventory.repository.ItemProductRepository;
import com.coop.erp.inventory.repository.SaleRepository;
import com.coop.erp.inventory.repository.StockLedgerRepository;
import com.coop.erp.inventory.repository.StockMovementRepository;
import com.coop.erp.auth.util.TenantContext;
import com.coop.erp.core.exception.InsufficientStockException;
import com.coop.erp.admin.repository.TenantRepository;
import com.coop.erp.admin.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;
    private final StockLedgerRepository stockLedgerRepository;
    private final ItemProductRepository itemProductRepository;
    private final ShopRepository shopRepository;
    private final JournalEntryService journalEntryService;
    private final SequenceGeneratorService sequenceGeneratorService;
    private final StockMovementRepository stockMovementRepository;
    private final ShopTerminalRepository shopTerminalRepository;
    private final CashSessionService cashSessionService;
    private final TenantRepository tenantRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public SaleResponse createAdminSale(SaleRequest request, String username) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        
        Sale sale = new Sale();
        sale.setSaleType(request.getSaleType());
        sale.setSourceShop(null); // Admin inventory
        sale.setNotes(request.getNotes());
        sale.setSaleDate(LocalDateTime.now());
        sale.setCreatedBy(username);
        sale.setCreatedAt(LocalDateTime.now());
        sale.setTenant(tenantRepository.findById(tenantId).orElseThrow(() -> new IllegalArgumentException("Tenant not found")));

        
        if (request.getTerminalId() != null) {
            ShopTerminal terminal = shopTerminalRepository.findById(request.getTerminalId())
                .orElseThrow(() -> new IllegalArgumentException("Terminal not found"));
            sale.setTerminalId(terminal.getId());
            sale.setTerminalCode(terminal.getTerminalCode());
        }

        sale.setSaleNumber(sequenceGeneratorService.generateSaleNumber("ADMIN", sale.getSaleDate().toLocalDate()));

        Shop targetShop = null;
        if (request.getSaleType() == SaleType.SHOP) {
            if (request.getTargetShopId() == null) {
                throw new IllegalArgumentException("Target shop ID is required for SHOP sale.");
            }
            targetShop = shopRepository.findById(request.getTargetShopId())
                    .orElseThrow(() -> new IllegalArgumentException("Target shop not found."));
            sale.setTargetShop(targetShop);
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalDiscount = BigDecimal.ZERO;
        List<SaleItem> items = new ArrayList<>();

        for (SaleRequest.SaleItemRequest itemReq : request.getItems()) {
            ItemProduct product = itemProductRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + itemReq.getProductId()));

            // Reduce Admin Stock with pessimistic locking
            StockLedger adminStock = stockLedgerRepository.findMainStockForUpdate(tenantId, product.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not in Admin stock: " + product.getName()));
            if (adminStock.getCurrentQty() < itemReq.getQuantity()) {
                throw new InsufficientStockException("Insufficient stock in Admin inventory for: " + product.getName() + ". Available: " + adminStock.getCurrentQty());
            }
            adminStock.setCurrentQty(adminStock.getCurrentQty() - itemReq.getQuantity());
            adminStock.setLastUpdated(LocalDateTime.now());
            stockLedgerRepository.save(adminStock);
            
            StockMovement adminMovement = StockMovement.builder()
                .item(product)
                .shop(null)
                .movementType("SALE_OUT")
                .quantityOut(itemReq.getQuantity())
                .balanceAfter(adminStock.getCurrentQty())
                .unitPrice(itemReq.getUnitPrice())
                .createdBy(username)
                .terminalId(sale.getTerminalId())
                .build();
            stockMovementRepository.save(adminMovement);

            // Increase Shop Stock if SHOP sale
            if (request.getSaleType() == SaleType.SHOP) {
                StockLedger shopStock = stockLedgerRepository.findShopStockForUpdate(tenantId, targetShop.getId(), product.getId())
                        .orElseGet(() -> {
                            StockLedger newStock = new StockLedger();
                            newStock.setItem(product);
                            newStock.setShop(sale.getTargetShop());
                            newStock.setTenant(sale.getTargetShop().getTenant());
                            newStock.setCurrentQty(0);
                            return newStock;
                        });
                shopStock.setCurrentQty(shopStock.getCurrentQty() + itemReq.getQuantity());
                shopStock.setLastUpdated(LocalDateTime.now());
                stockLedgerRepository.save(shopStock);
                
                StockMovement shopMovement = StockMovement.builder()
                    .item(product)
                    .shop(targetShop)
                    .movementType("TRANSFER_IN")
                    .quantityIn(itemReq.getQuantity())
                    .balanceAfter(shopStock.getCurrentQty())
                    .unitPrice(itemReq.getUnitPrice())
                    .createdBy(username)
                    .build();
                stockMovementRepository.save(shopMovement);
            }

            SaleItem saleItem = new SaleItem();
            saleItem.setSale(sale);
            saleItem.setItem(product);
            saleItem.setQuantity(itemReq.getQuantity());
            saleItem.setUnitPrice(itemReq.getUnitPrice());
            
            BigDecimal lineSubtotal = itemReq.getUnitPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            BigDecimal discountPercentage = itemReq.getDiscountPercentage() != null ? itemReq.getDiscountPercentage() : BigDecimal.ZERO;
            BigDecimal discountAmount = lineSubtotal.multiply(discountPercentage).divide(BigDecimal.valueOf(100));
            BigDecimal lineTotal = lineSubtotal.subtract(discountAmount);
            
            saleItem.setDiscountPercentage(discountPercentage);
            saleItem.setDiscountAmount(discountAmount);
            saleItem.setLineTotal(lineTotal);
            items.add(saleItem);

            subtotal = subtotal.add(lineSubtotal);
            totalDiscount = totalDiscount.add(discountAmount);
        }

        sale.setItems(items);
        sale.setSubtotal(subtotal);
        sale.setTotalDiscount(totalDiscount);
        sale.setTotalAmount(subtotal.subtract(totalDiscount));
        
        Sale savedSale = saleRepository.save(sale);

        // Accounting Entry
        if (request.getSaleType() != SaleType.SHOP) {
            BigDecimal totalCogs = BigDecimal.ZERO;
            for (SaleItem si : savedSale.getItems()) {
                if (si.getItem().getCostPrice() != null) {
                    totalCogs = totalCogs.add(si.getItem().getCostPrice().multiply(BigDecimal.valueOf(si.getQuantity())));
                }
            }

            String cashAccount = (savedSale.getPaymentMethod() == PaymentMethod.CARD) ? "1010" : "1000";

            List<JournalEntryService.JournalLineRequest> lines = new ArrayList<>(List.of(
                    new JournalEntryService.JournalLineRequest(cashAccount, "Sale Receipt", savedSale.getTotalAmount(), BigDecimal.ZERO),
                    new JournalEntryService.JournalLineRequest("4000", "Sale Revenue", BigDecimal.ZERO, savedSale.getTotalAmount())
            ));

            if (totalCogs.compareTo(BigDecimal.ZERO) > 0) {
                lines.add(new JournalEntryService.JournalLineRequest("5000", "COGS", totalCogs, BigDecimal.ZERO));
                lines.add(new JournalEntryService.JournalLineRequest("1200", "Inventory Reduction", BigDecimal.ZERO, totalCogs));
            }

            journalEntryService.postEntry(
                    "SALE",
                    savedSale.getId(),
                    savedSale.getSaleDate().toLocalDate(),
                    "Customer Sale " + savedSale.getSaleNumber(),
                    savedSale.getCreatedBy(),
                    lines
            );
        }

        auditLogService.logTenantAction(
                "SALE_CREATED",
                "SALE",
                savedSale.getId().toString(),
                "Created Admin Sale: " + savedSale.getSaleNumber(),
                null,
                String.format("{\"totalAmount\": %s}", savedSale.getTotalAmount())
        );

        return mapToResponse(savedSale);
    }

    @Transactional
    public SaleResponse createShopSale(SaleRequest request, String username, UUID shopId) {
        if (shopId == null) {
            throw new IllegalArgumentException("Shop ID is required for Shop sales.");
        }
        
        Shop sourceShop = shopRepository.findById(shopId)
                .orElseThrow(() -> new IllegalArgumentException("Shop not found."));
                
        Sale sale = new Sale();
        sale.setSaleType(SaleType.CUSTOMER); // Shop can only do Customer Sales
        sale.setSourceShop(sourceShop);
        sale.setTargetShop(null);
        sale.setNotes(request.getNotes());
        sale.setSaleDate(LocalDateTime.now());
        sale.setCreatedBy(username);
        sale.setCreatedAt(LocalDateTime.now());
        sale.setTenant(sourceShop.getTenant());

        if (request.getTerminalId() != null) {
            ShopTerminal terminal = shopTerminalRepository.findById(request.getTerminalId())
                .orElseThrow(() -> new IllegalArgumentException("Terminal not found"));
            
            if (!terminal.getShop().getId().equals(shopId)) {
                throw new IllegalArgumentException("Terminal does not belong to the current shop.");
            }
            if (!Boolean.TRUE.equals(terminal.getIsActive())) {
                throw new IllegalArgumentException("Terminal is inactive.");
            }
            sale.setTerminalId(terminal.getId());
            sale.setTerminalCode(terminal.getTerminalCode());
        } else {
            throw new IllegalArgumentException("Terminal ID is required for shop sales to process payments correctly.");
        }

        CashSession activeSession = cashSessionService.getCurrentOpenSession(sale.getTerminalId(), username)
                .orElseThrow(() -> new IllegalStateException("No open cash session found. Please open a shift before creating a sale."));

        sale.setCashSession(activeSession);
        
        PaymentMethod paymentMethod = request.getPaymentMethod() != null ? request.getPaymentMethod() : PaymentMethod.CASH;
        sale.setPaymentMethod(paymentMethod);
        sale.setPaymentStatus(request.getPaymentStatus() != null ? request.getPaymentStatus() : PaymentStatus.PAID);
        sale.setPaidAmount(request.getPaidAmount() != null ? request.getPaidAmount() : BigDecimal.ZERO);
        
        sale.setSaleNumber(sequenceGeneratorService.generateSaleNumber(sourceShop.getCode(), sale.getSaleDate().toLocalDate()));

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalDiscount = BigDecimal.ZERO;
        List<SaleItem> items = new ArrayList<>();

        UUID tenantId = TenantContext.getCurrentTenantId();

        for (SaleRequest.SaleItemRequest itemReq : request.getItems()) {
            ItemProduct product = itemProductRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + itemReq.getProductId()));

            // Reduce Shop Stock with pessimistic locking
            StockLedger shopStock = stockLedgerRepository.findShopStockForUpdate(tenantId, shopId, product.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not in stock for this shop: " + product.getName()));
            if (shopStock.getCurrentQty() < itemReq.getQuantity()) {
                throw new InsufficientStockException("Insufficient stock in Shop inventory for: " + product.getName() + ". Available: " + shopStock.getCurrentQty());
            }
            shopStock.setCurrentQty(shopStock.getCurrentQty() - itemReq.getQuantity());
            shopStock.setLastUpdated(LocalDateTime.now());
            stockLedgerRepository.save(shopStock);
            
            StockMovement shopMovement = StockMovement.builder()
                .item(product)
                .shop(sourceShop)
                .movementType("SALE_OUT")
                .quantityOut(itemReq.getQuantity())
                .balanceAfter(shopStock.getCurrentQty())
                .unitPrice(itemReq.getUnitPrice())
                .createdBy(username)
                .terminalId(sale.getTerminalId())
                .build();
            stockMovementRepository.save(shopMovement);

            SaleItem saleItem = new SaleItem();
            saleItem.setSale(sale);
            saleItem.setItem(product);
            saleItem.setQuantity(itemReq.getQuantity());
            saleItem.setUnitPrice(itemReq.getUnitPrice());
            
            BigDecimal lineSubtotal = itemReq.getUnitPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            BigDecimal discountPercentage = itemReq.getDiscountPercentage() != null ? itemReq.getDiscountPercentage() : BigDecimal.ZERO;
            BigDecimal discountAmount = lineSubtotal.multiply(discountPercentage).divide(BigDecimal.valueOf(100));
            BigDecimal lineTotal = lineSubtotal.subtract(discountAmount);
            
            saleItem.setDiscountPercentage(discountPercentage);
            saleItem.setDiscountAmount(discountAmount);
            saleItem.setLineTotal(lineTotal);
            items.add(saleItem);

            subtotal = subtotal.add(lineSubtotal);
            totalDiscount = totalDiscount.add(discountAmount);
        }

        sale.setItems(items);
        sale.setSubtotal(subtotal);
        sale.setTotalDiscount(totalDiscount);
        sale.setTotalAmount(subtotal.subtract(totalDiscount));
        
        if (sale.getPaidAmount().compareTo(BigDecimal.ZERO) == 0 && sale.getPaymentStatus() == PaymentStatus.PAID) {
            sale.setPaidAmount(sale.getTotalAmount());
        }
        sale.setBalanceAmount(sale.getTotalAmount().subtract(sale.getPaidAmount()));

        // Update Cash Session Totals
        BigDecimal totalAmount = sale.getTotalAmount();
        activeSession.setTotalSales(activeSession.getTotalSales().add(totalAmount));
        
        if (paymentMethod == PaymentMethod.CASH) {
            activeSession.setCashSalesTotal(activeSession.getCashSalesTotal().add(totalAmount));
            activeSession.setExpectedCash(activeSession.getExpectedCash().add(totalAmount));
        } else if (paymentMethod == PaymentMethod.CARD) {
            activeSession.setCardSalesTotal(activeSession.getCardSalesTotal().add(totalAmount));
        } else if (paymentMethod == PaymentMethod.CREDIT) {
            activeSession.setCreditSalesTotal(activeSession.getCreditSalesTotal().add(totalAmount));
        }
        
        Sale savedSale = saleRepository.save(sale);

        // Accounting Entry
        BigDecimal totalCogs = BigDecimal.ZERO;
        for (SaleItem si : savedSale.getItems()) {
            if (si.getItem().getCostPrice() != null) {
                totalCogs = totalCogs.add(si.getItem().getCostPrice().multiply(BigDecimal.valueOf(si.getQuantity())));
            }
        }

        String cashAccount = (savedSale.getPaymentMethod() == PaymentMethod.CARD) ? "1010" : "1000";

        List<JournalEntryService.JournalLineRequest> lines = new ArrayList<>(List.of(
                new JournalEntryService.JournalLineRequest(cashAccount, "Sale Receipt", savedSale.getTotalAmount(), BigDecimal.ZERO),
                new JournalEntryService.JournalLineRequest("4000", "Sale Revenue", BigDecimal.ZERO, savedSale.getTotalAmount())
        ));

        if (totalCogs.compareTo(BigDecimal.ZERO) > 0) {
            lines.add(new JournalEntryService.JournalLineRequest("5000", "COGS", totalCogs, BigDecimal.ZERO));
            lines.add(new JournalEntryService.JournalLineRequest("1200", "Inventory Reduction", BigDecimal.ZERO, totalCogs));
        }

        journalEntryService.postEntry(
                "SALE",
                savedSale.getId(),
                savedSale.getSaleDate().toLocalDate(),
                "Shop Sale " + savedSale.getSaleNumber(),
                savedSale.getCreatedBy(),
                lines
        );

        auditLogService.logShopAction(
                sourceShop.getId(),
                sale.getTerminalId(),
                "SALE_CREATED",
                "SALE",
                savedSale.getId().toString(),
                "Created Shop Sale: " + savedSale.getSaleNumber(),
                null,
                String.format("{\"totalAmount\": %s}", savedSale.getTotalAmount())
        );

        return mapToResponse(savedSale);
    }

    public List<SaleResponse> getAdminSales() {
        return saleRepository.findBySourceShopIsNull().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<SaleResponse> getShopSales(UUID shopId) {
        return saleRepository.findBySourceShopId(shopId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<SaleResponse> getShopSalesHistoryFiltered(UUID shopId, LocalDateTime fromDate, LocalDateTime toDate, UUID terminalId, String cashierId, PaymentMethod paymentMethod) {
        return saleRepository.findShopSalesHistory(shopId, fromDate, toDate, terminalId, cashierId, paymentMethod).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<SaleResponse> getShopPurchaseHistory(UUID shopId, LocalDateTime fromDate, LocalDateTime toDate, String search) {
        String safeSearch = (search == null) ? "" : search;
        return saleRepository.findPurchaseHistoryWithFilters(shopId, fromDate, toDate, safeSearch).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public SaleResponse getShopPurchaseHistoryById(UUID id, UUID shopId) {
        return saleRepository.findByIdAndTargetShopId(id, shopId)
                .map(this::mapToResponse)
                .orElseThrow(() -> new IllegalArgumentException("Purchase history not found."));
    }

    private SaleResponse mapToResponse(Sale sale) {
        List<SaleResponse.SaleItemResponse> itemResponses = sale.getItems().stream().map(i -> 
                SaleResponse.SaleItemResponse.builder()
                        .productId(i.getItem().getId())
                        .productCode(i.getItem().getId().toString().substring(0, 8).toUpperCase())
                        .productName(i.getItem().getName())
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .discountPercentage(i.getDiscountPercentage())
                        .discountAmount(i.getDiscountAmount())
                        .lineTotal(i.getLineTotal())
                        .build()
        ).collect(Collectors.toList());

        Integer totalQuantity = sale.getItems().stream().mapToInt(SaleItem::getQuantity).sum();

        return SaleResponse.builder()
                .id(sale.getId())
                .saleNumber(sale.getSaleNumber())
                .saleType(sale.getSaleType())
                .targetShopName(sale.getTargetShop() != null ? sale.getTargetShop().getName() : null)
                .subtotal(sale.getSubtotal())
                .totalDiscount(sale.getTotalDiscount())
                .totalAmount(sale.getTotalAmount())
                .notes(sale.getNotes())
                .saleDate(sale.getSaleDate())
                .createdBy(sale.getCreatedBy())
                .cashierUsername(sale.getCreatedBy())
                .terminalCode(sale.getTerminalCode())
                .shopCode(sale.getSourceShop() != null ? sale.getSourceShop().getCode() : "ADMIN")
                .sourceName(sale.getSourceShop() == null ? "Main Shop" : sale.getSourceShop().getName())
                .status(sale.getTargetShop() != null ? "RECEIVED" : "COMPLETED")
                .paymentMethod(sale.getPaymentMethod() != null ? sale.getPaymentMethod().name() : null)
                .paymentStatus(sale.getPaymentStatus() != null ? sale.getPaymentStatus().name() : null)
                .paidAmount(sale.getPaidAmount())
                .balanceAmount(sale.getBalanceAmount())
                .itemsCount(sale.getItems().size())
                .totalQuantity(totalQuantity)
                .items(itemResponses)
                .build();
    }
}
