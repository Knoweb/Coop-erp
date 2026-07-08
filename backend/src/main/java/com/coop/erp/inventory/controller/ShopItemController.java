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
@RequestMapping("/api/v1/shop/shop-items")
@RequiredArgsConstructor
public class ShopItemController {

    private final ShopItemService shopItemService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'SHOP_ADMIN', 'ROLE_SHOP_ADMIN', 'SHOP_USER', 'ROLE_SHOP_USER')")
    public List<ShopItemResponse> getShopItems() {
        return shopItemService.getShopItems();
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'SHOP_ADMIN', 'ROLE_SHOP_ADMIN', 'SHOP_USER', 'ROLE_SHOP_USER')")
    public ShopItemResponse selectItemForShop(@Valid @RequestBody ShopItemRequest request) {
        return shopItemService.selectItemForShop(request);
    }

    @PutMapping("/{id}/reorder-level")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'SHOP_ADMIN', 'ROLE_SHOP_ADMIN', 'SHOP_USER', 'ROLE_SHOP_USER')")
    public ShopItemResponse updateReorderLevel(
            @PathVariable UUID id,
            @Valid @RequestBody ShopItemReorderLevelRequest request) {
        return shopItemService.updateReorderLevel(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'SHOP_ADMIN', 'ROLE_SHOP_ADMIN', 'SHOP_USER', 'ROLE_SHOP_USER')")
    public void unselectItem(@PathVariable UUID id) {
        shopItemService.unselectItem(id);
    }
}
