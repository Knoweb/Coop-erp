package com.coop.erp.inventory.service;

import com.coop.erp.core.entity.Shop;
import com.coop.erp.core.repository.ShopRepository;
import com.coop.erp.inventory.dto.SaleRequest;
import com.coop.erp.inventory.dto.SaleResponse;
import com.coop.erp.inventory.entity.ItemProduct;
import com.coop.erp.inventory.entity.Sale;
import com.coop.erp.inventory.entity.SaleItem;
import com.coop.erp.inventory.entity.SaleType;
import com.coop.erp.inventory.entity.StockLedger;
import com.coop.erp.inventory.repository.ItemProductRepository;
import com.coop.erp.inventory.repository.SaleRepository;
import com.coop.erp.inventory.repository.StockLedgerRepository;
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

    @Transactional
    public SaleResponse createAdminSale(SaleRequest request, String username) {
        Sale sale = new Sale();
        sale.setSaleNumber("SALE-" + System.currentTimeMillis());
        sale.setSaleType(request.getSaleType());
        sale.setSourceShop(null); // Admin inventory
        sale.setNotes(request.getNotes());
        sale.setSaleDate(LocalDateTime.now());
        sale.setCreatedBy(username);
        sale.setCreatedAt(LocalDateTime.now());

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

            // Reduce Admin Stock
            StockLedger adminStock = stockLedgerRepository.findByItemIdAndShopIsNull(product.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not in Admin stock: " + product.getName()));
            if (adminStock.getCurrentQty() < itemReq.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock in Admin inventory for: " + product.getName());
            }
            adminStock.setCurrentQty(adminStock.getCurrentQty() - itemReq.getQuantity());
            adminStock.setLastUpdated(LocalDateTime.now());
            stockLedgerRepository.save(adminStock);

            // Increase Shop Stock if SHOP sale
            if (request.getSaleType() == SaleType.SHOP) {
                StockLedger shopStock = stockLedgerRepository.findByItemIdAndShopId(product.getId(), targetShop.getId())
                        .orElseGet(() -> {
                            StockLedger newStock = new StockLedger();
                            newStock.setItem(product);
                            newStock.setShop(sale.getTargetShop());
                            newStock.setCurrentQty(0);
                            return newStock;
                        });
                shopStock.setCurrentQty(shopStock.getCurrentQty() + itemReq.getQuantity());
                shopStock.setLastUpdated(LocalDateTime.now());
                stockLedgerRepository.save(shopStock);
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
        sale.setSaleNumber("SALE-" + System.currentTimeMillis());
        sale.setSaleType(SaleType.CUSTOMER); // Shop can only do Customer Sales
        sale.setSourceShop(sourceShop);
        sale.setTargetShop(null);
        sale.setNotes(request.getNotes());
        sale.setSaleDate(LocalDateTime.now());
        sale.setCreatedBy(username);
        sale.setCreatedAt(LocalDateTime.now());

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalDiscount = BigDecimal.ZERO;
        List<SaleItem> items = new ArrayList<>();

        for (SaleRequest.SaleItemRequest itemReq : request.getItems()) {
            ItemProduct product = itemProductRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + itemReq.getProductId()));

            // Reduce Shop Stock
            StockLedger shopStock = stockLedgerRepository.findByItemIdAndShopId(product.getId(), shopId)
                    .orElseThrow(() -> new IllegalArgumentException("Product not in stock for this shop: " + product.getName()));
            if (shopStock.getCurrentQty() < itemReq.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock in Shop inventory for: " + product.getName());
            }
            shopStock.setCurrentQty(shopStock.getCurrentQty() - itemReq.getQuantity());
            shopStock.setLastUpdated(LocalDateTime.now());
            stockLedgerRepository.save(shopStock);

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
                .sourceName(sale.getSourceShop() == null ? "Main Shop" : sale.getSourceShop().getName())
                .status(sale.getTargetShop() != null ? "RECEIVED" : "COMPLETED")
                .itemsCount(sale.getItems().size())
                .totalQuantity(totalQuantity)
                .items(itemResponses)
                .build();
    }
}
