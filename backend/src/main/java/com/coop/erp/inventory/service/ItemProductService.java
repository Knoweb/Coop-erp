package com.coop.erp.inventory.service;

import com.coop.erp.inventory.dto.ItemProductRequest;
import com.coop.erp.inventory.entity.ItemProduct;
import com.coop.erp.inventory.repository.ItemProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ItemProductService {

    private final ItemProductRepository itemProductRepository;

    public List<ItemProduct> getAllItems() {
        return itemProductRepository.findByIsActiveTrue();
    }

    public ItemProduct createItem(ItemProductRequest request) {
        ItemProduct item = ItemProduct.builder()
                .name(request.getName())
                .category(request.getCategory())
                .defaultReorderLevel(request.getDefaultReorderLevel())
                .unitPrice(request.getUnitPrice())
                .isActive(true)
                .build();

        return itemProductRepository.save(item);
    }

    public ItemProduct updateItem(UUID id, ItemProductRequest request) {
        ItemProduct item = itemProductRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        item.setName(request.getName());
        item.setCategory(request.getCategory());
        item.setDefaultReorderLevel(request.getDefaultReorderLevel());
        item.setUnitPrice(request.getUnitPrice());

        return itemProductRepository.save(item);
    }

    public List<ItemProduct> getLowStockItems() {
        return itemProductRepository.findAllLowStockItems();
    }
}