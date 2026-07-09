package com.coop.erp.inventory.controller;

import com.coop.erp.inventory.dto.ShopItemReorderLevelRequest;
import com.coop.erp.inventory.dto.ShopItemRequest;
import com.coop.erp.inventory.dto.ShopItemResponse;
import com.coop.erp.inventory.service.ShopItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/shop/items")
@RequiredArgsConstructor
public class ShopItemController {

    private final ShopItemService shopItemService;

    @GetMapping
    public List<ShopItemResponse> getShopItems() {
        return shopItemService.getShopItems();
    }

    @PostMapping
    public ShopItemResponse selectItemForShop(@Valid @RequestBody ShopItemRequest request) {
        return shopItemService.selectItemForShop(request);
    }

    @PutMapping("/{id}/reorder-level")
    public ShopItemResponse updateReorderLevel(
            @PathVariable UUID id,
            @Valid @RequestBody ShopItemReorderLevelRequest request) {
        return shopItemService.updateReorderLevel(id, request);
    }

    @DeleteMapping("/{id}")
    public void unselectItem(@PathVariable UUID id) {
        shopItemService.unselectItem(id);
    }
}
