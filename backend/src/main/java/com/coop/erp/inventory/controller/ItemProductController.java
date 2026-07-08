package com.coop.erp.inventory.controller;

import com.coop.erp.inventory.dto.ItemProductRequest;
import com.coop.erp.inventory.entity.ItemProduct;
import com.coop.erp.inventory.service.ItemProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/shop/items")
@RequiredArgsConstructor
public class ItemProductController {

    private final ItemProductService itemProductService;

    @GetMapping
    public List<ItemProduct> getAllItems() {
        return itemProductService.getAllItems();
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ItemProduct createItem(@Valid @RequestBody ItemProductRequest request) {
        return itemProductService.createItem(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public ItemProduct updateItem(
            @PathVariable UUID id,
            @Valid @RequestBody ItemProductRequest request
    ) {
        return itemProductService.updateItem(id, request);
    }

    @GetMapping("/low-stock")
    public List<ItemProduct> getLowStockItems() {
        return itemProductService.getLowStockItems();
    }
}