package com.coop.erp.inventory.service;

import com.coop.erp.core.entity.Shop;
import com.coop.erp.core.entity.User;
import com.coop.erp.core.repository.UserRepository;
import com.coop.erp.inventory.dto.ShopItemReorderLevelRequest;
import com.coop.erp.inventory.dto.ShopItemRequest;
import com.coop.erp.inventory.dto.ShopItemResponse;
import com.coop.erp.inventory.entity.ItemProduct;
import com.coop.erp.inventory.entity.ShopItem;
import com.coop.erp.inventory.entity.StockLedger;
import com.coop.erp.inventory.repository.ItemProductRepository;
import com.coop.erp.inventory.repository.ShopItemRepository;
import com.coop.erp.inventory.repository.StockLedgerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShopItemService {

    private final ShopItemRepository shopItemRepository;
    private final ItemProductRepository itemProductRepository;
    private final UserRepository userRepository;
    private final StockLedgerRepository stockLedgerRepository;

    private Shop getCurrentUserShopOrNull() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getShop();
    }

    private Shop getCurrentUserShop() {
        Shop shop = getCurrentUserShopOrNull();
        if (shop == null) {
            throw new RuntimeException("User is not assigned to any shop");
        }
        return shop;
    }

    public List<ShopItemResponse> getShopItems() {
        Shop currentShop = getCurrentUserShopOrNull();
        List<ItemProduct> allItems = itemProductRepository.findByIsActiveTrue();
        
        if (currentShop == null) {
            // Admin viewing shop items shouldn't happen from ItemPage, but just in case, return all global items
            return allItems.stream().map(item -> ShopItemResponse.builder()
                    .itemId(item.getId())
                    .name(item.getName())
                    .category(item.getCategory())
                    .unitPrice(item.getUnitPrice())
                    .isGlobalActive(item.getIsActive())
                    .isSelected(true)
                    .shopReorderLevel(item.getDefaultReorderLevel())
                    .build()).toList();
        }
        
        List<ShopItem> shopItems = shopItemRepository.findByShopIdAndIsActiveTrue(currentShop.getId());
        Map<UUID, ShopItem> shopItemMap = shopItems.stream()
                .collect(Collectors.toMap(si -> si.getItem().getId(), si -> si));

        return allItems.stream().map(item -> {
            ShopItem si = shopItemMap.get(item.getId());
            return ShopItemResponse.builder()
                    .itemId(item.getId())
                    .name(item.getName())
                    .category(item.getCategory())
                    .unitPrice(item.getUnitPrice())
                    .isGlobalActive(item.getIsActive())
                    .isSelected(si != null)
                    .shopItemId(si != null ? si.getId() : null)
                    .shopReorderLevel(si != null ? si.getReorderLevel() : item.getDefaultReorderLevel())
                    .build();
        }).toList();
    }

    @Transactional
    public ShopItemResponse selectItemForShop(ShopItemRequest request) {
        Shop currentShop = getCurrentUserShop();
        ItemProduct item = itemProductRepository.findById(request.getItemId())
                .orElseThrow(() -> new RuntimeException("Item not found"));

        if (shopItemRepository.existsByShopIdAndItemId(currentShop.getId(), item.getId())) {
            // Might be deactivated, let's check
            ShopItem existing = shopItemRepository.findByShopIdAndItemId(currentShop.getId(), item.getId()).get();
            if (!existing.getIsActive()) {
                existing.setIsActive(true);
                existing.setReorderLevel(item.getDefaultReorderLevel());
                existing.setUpdatedAt(LocalDateTime.now());
                shopItemRepository.save(existing);
                return mapToResponse(existing);
            }
            throw new RuntimeException("Item already selected for this shop");
        }

        ShopItem shopItem = ShopItem.builder()
                .shop(currentShop)
                .item(item)
                .reorderLevel(item.getDefaultReorderLevel())
                .isActive(true)
                .build();
                
        ShopItem saved = shopItemRepository.save(shopItem);

        // Initialize stock ledger with 0 if not exists
        stockLedgerRepository.findByItemIdAndShopId(item.getId(), currentShop.getId())
                .orElseGet(() -> {
                    StockLedger newLedger = StockLedger.builder()
                            .item(item)
                            .shop(currentShop)
                            .currentQty(0)
                            .lastUpdated(LocalDateTime.now())
                            .build();
                    return stockLedgerRepository.save(newLedger);
                });

        return mapToResponse(saved);
    }

    @Transactional
    public ShopItemResponse updateReorderLevel(UUID shopItemId, ShopItemReorderLevelRequest request) {
        Shop currentShop = getCurrentUserShop();
        ShopItem shopItem = shopItemRepository.findById(shopItemId)
                .orElseThrow(() -> new RuntimeException("Shop item not found"));

        if (!shopItem.getShop().getId().equals(currentShop.getId())) {
            throw new RuntimeException("Unauthorized: Cannot update another shop's item");
        }

        shopItem.setReorderLevel(request.getReorderLevel());
        shopItem.setUpdatedAt(LocalDateTime.now());
        ShopItem saved = shopItemRepository.save(shopItem);

        return mapToResponse(saved);
    }

    @Transactional
    public void unselectItem(UUID shopItemId) {
        Shop currentShop = getCurrentUserShop();
        ShopItem shopItem = shopItemRepository.findById(shopItemId)
                .orElseThrow(() -> new RuntimeException("Shop item not found"));

        if (!shopItem.getShop().getId().equals(currentShop.getId())) {
            throw new RuntimeException("Unauthorized: Cannot modify another shop's item");
        }

        shopItem.setIsActive(false);
        shopItem.setUpdatedAt(LocalDateTime.now());
        shopItemRepository.save(shopItem);
    }

    private ShopItemResponse mapToResponse(ShopItem shopItem) {
        return ShopItemResponse.builder()
                .itemId(shopItem.getItem().getId())
                .name(shopItem.getItem().getName())
                .category(shopItem.getItem().getCategory())
                .unitPrice(shopItem.getItem().getUnitPrice())
                .isGlobalActive(shopItem.getItem().getIsActive())
                .isSelected(true)
                .shopItemId(shopItem.getId())
                .shopReorderLevel(shopItem.getReorderLevel())
                .build();
    }
}
