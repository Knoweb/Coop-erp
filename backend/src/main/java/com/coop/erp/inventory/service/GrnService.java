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
import com.coop.erp.inventory.repository.PurchaseInvoiceItemRepository;
import com.coop.erp.inventory.repository.PurchaseInvoiceRepository;
import com.coop.erp.inventory.repository.StockLedgerRepository;
import com.coop.erp.inventory.repository.SupplierRepository;
import com.coop.erp.core.entity.Shop;
import com.coop.erp.core.entity.User;
import com.coop.erp.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GrnService {

    private final PurchaseInvoiceRepository purchaseInvoiceRepository;
    private final PurchaseInvoiceItemRepository purchaseInvoiceItemRepository;
    private final SupplierRepository supplierRepository;
    private final ItemProductRepository itemProductRepository;
    private final StockLedgerRepository stockLedgerRepository;
    private final UserRepository userRepository;

    private Shop getCurrentUserShop() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getShop() == null) {
            throw new RuntimeException("User is not assigned to any shop");
        }
        return user.getShop();
    }

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

        for (GrnItemRequest itemRequest : request.getItems()) {
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

            increaseStock(item, itemRequest.getQuantity(), currentShop);
        }

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

    private void increaseStock(ItemProduct item, Integer quantity) {
        StockLedger stockLedger = stockLedgerRepository.findByItemIdAndShopIsNull(item.getId())
                .orElseGet(() -> {
                    StockLedger newStock = new StockLedger();
                    newStock.setItem(item);
                    newStock.setShop(null); // Admin stock
                    newStock.setCurrentQty(0);
                    newStock.setLastUpdated(LocalDateTime.now());
                    return newStock;
                });

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