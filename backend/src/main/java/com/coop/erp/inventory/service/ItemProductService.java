package com.coop.erp.inventory.service;

import com.coop.erp.inventory.dto.ItemProductRequest;
import com.coop.erp.inventory.entity.ItemProduct;
import com.coop.erp.inventory.entity.StockLedger;
import com.coop.erp.inventory.repository.ItemProductRepository;
import com.coop.erp.inventory.repository.StockLedgerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ItemProductService {

    private final ItemProductRepository itemProductRepository;
    private final StockLedgerRepository stockLedgerRepository;

    public List<ItemProduct> getAllItems() {
        return itemProductRepository.findByIsActiveTrue();
    }

    public ItemProduct createItem(ItemProductRequest request) {
        ItemProduct item = ItemProduct.builder()
                .name(request.getName())
                .category(request.getCategory())
                .reorderLevel(request.getReorderLevel())
                .unitPrice(request.getUnitPrice())
                .isActive(true)
                .build();

        ItemProduct savedItem = itemProductRepository.save(item);

        StockLedger stockLedger = StockLedger.builder()
                .item(savedItem)
                .currentQty(0)
                .lastUpdated(LocalDateTime.now())
                .build();

        stockLedgerRepository.save(stockLedger);

        return savedItem;
    }

    public ItemProduct updateItem(UUID id, ItemProductRequest request) {
        ItemProduct item = itemProductRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        item.setName(request.getName());
        item.setCategory(request.getCategory());
        item.setReorderLevel(request.getReorderLevel());
        item.setUnitPrice(request.getUnitPrice());

        return itemProductRepository.save(item);
    }

    public List<ItemProduct> getLowStockItems() {
        return itemProductRepository.findLowStockItems();
    }
}