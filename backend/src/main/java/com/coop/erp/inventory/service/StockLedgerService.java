package com.coop.erp.inventory.service;

import com.coop.erp.inventory.dto.StockReduceRequest;
import com.coop.erp.inventory.dto.StockReduceResponse;
import com.coop.erp.inventory.entity.StockLedger;
import com.coop.erp.inventory.repository.StockLedgerRepository;
import com.coop.erp.inventory.dto.StockAdjustRequest;
import com.coop.erp.inventory.dto.StockAdjustResponse;
import com.coop.erp.core.entity.Shop;
import com.coop.erp.core.entity.User;
import com.coop.erp.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StockLedgerService {

    private final StockLedgerRepository stockLedgerRepository;
    private final UserRepository userRepository;
    private final com.coop.erp.inventory.repository.ShopItemRepository shopItemRepository;

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

    private com.coop.erp.inventory.dto.StockLedgerResponse mapToResponse(StockLedger ledger, java.util.UUID shopId) {
        Integer reorderLevel = null;
        java.util.UUID shopItemId = null;
        
        // determine if this is the main shop/admin ledger
        boolean isAdminLedger = (shopId == null) || (ledger.getShop() != null && 
            ("MAIN_SHOP".equals(ledger.getShop().getCode()) || "MAIN".equals(ledger.getShop().getCode())));
        
        java.util.UUID queryShopId = shopId != null ? shopId : (ledger.getShop() != null ? ledger.getShop().getId() : null);

        if (queryShopId != null) {
            java.util.Optional<com.coop.erp.inventory.entity.ShopItem> optShopItem = shopItemRepository.findByShopIdAndItemId(queryShopId, ledger.getItem().getId());
            if (optShopItem.isPresent()) {
                reorderLevel = optShopItem.get().getReorderLevel();
                shopItemId = optShopItem.get().getId();
            }
        }
        
        if (reorderLevel == null && isAdminLedger) {
            reorderLevel = ledger.getItem().getDefaultReorderLevel();
        }

        String status = "AVAILABLE";
        Integer effectiveReorderLevel = reorderLevel != null ? reorderLevel : ledger.getItem().getDefaultReorderLevel();
        
        if (ledger.getCurrentQty() == 0) {
            status = "OUT OF STOCK";
        } else if (effectiveReorderLevel != null && ledger.getCurrentQty() <= effectiveReorderLevel) {
            status = "LOW STOCK";
        }

        return com.coop.erp.inventory.dto.StockLedgerResponse.builder()
                .id(ledger.getId())
                .itemId(ledger.getItem().getId())
                .shopItemId(shopItemId)
                .productCode(ledger.getItem().getCategory())
                .productName(ledger.getItem().getName())
                .category(ledger.getItem().getCategory())
                .currentQty(ledger.getCurrentQty())
                .reorderLevel(reorderLevel)
                .unitCost(ledger.getItem().getUnitPrice())
                .sellingPrice(ledger.getItem().getUnitPrice())
                .lastPurchaseDate(ledger.getLastUpdated())
                .status(status)
                .build();
    }

    public List<com.coop.erp.inventory.dto.StockLedgerResponse> getAllStock(java.util.UUID shopId) {
        List<StockLedger> ledgers;
        if (shopId != null) {
            ledgers = stockLedgerRepository.findByShopId(shopId);
        } else {
            ledgers = stockLedgerRepository.findByShopIsNull();
        }
        return ledgers.stream().map(l -> mapToResponse(l, shopId)).toList();
    }

    public List<com.coop.erp.inventory.dto.StockLedgerResponse> getLowStockItems(java.util.UUID shopId) {
        return stockLedgerRepository.findLowStockItems(shopId).stream()
                .map(l -> mapToResponse(l, shopId))
                .toList();
    }

    public List<com.coop.erp.inventory.dto.StockLedgerResponse> getOutOfStockItems(java.util.UUID shopId) {
        return stockLedgerRepository.findOutOfStockItems(shopId).stream()
                .map(l -> mapToResponse(l, shopId))
                .toList();
    }

    public StockReduceResponse reduceStock(StockReduceRequest request, java.util.UUID shopId) {
        StockLedger stockLedger = stockLedgerRepository.findByItemIdAndShopId(request.getItemId(), shopId)
                .orElseGet(() -> {
                    if (shopId == null) {
                        return stockLedgerRepository.findByItemIdAndShopIsNull(request.getItemId())
                                .orElseThrow(() -> new RuntimeException("Stock record not found for selected item"));
                    }
                    throw new RuntimeException("Stock record not found for selected item");
                });

        Integer previousQuantity = stockLedger.getCurrentQty();

        if (request.getQuantity() > previousQuantity) {
            throw new RuntimeException("Cannot reduce more than available stock");
        }

        Integer newQuantity = previousQuantity - request.getQuantity();

        stockLedger.setCurrentQty(newQuantity);
        stockLedger.setLastUpdated(LocalDateTime.now());

        StockLedger saved = stockLedgerRepository.save(stockLedger);

        return StockReduceResponse.builder()
                .itemId(saved.getItem().getId())
                .itemName(saved.getItem().getName())
                .reducedQuantity(request.getQuantity())
                .previousQuantity(previousQuantity)
                .currentQuantity(saved.getCurrentQty())
                .reason(request.getReason())
                .lastUpdated(saved.getLastUpdated())
                .message("Stock reduced successfully")
                .build();
    }

    public StockAdjustResponse adjustStockToActualQuantity(StockAdjustRequest request, java.util.UUID shopId) {
        StockLedger stockLedger = stockLedgerRepository.findByItemIdAndShopId(request.getItemId(), shopId)
                .orElseGet(() -> {
                    if (shopId == null) {
                        return stockLedgerRepository.findByItemIdAndShopIsNull(request.getItemId())
                                .orElseThrow(() -> new RuntimeException("Stock record not found for selected item"));
                    }
                    throw new RuntimeException("Stock record not found for selected item");
                });

        Integer previousQuantity = stockLedger.getCurrentQty();
        Integer actualQuantity = request.getActualQuantity();
        Integer difference = actualQuantity - previousQuantity;

        stockLedger.setCurrentQty(actualQuantity);
        stockLedger.setLastUpdated(LocalDateTime.now());

        StockLedger saved = stockLedgerRepository.save(stockLedger);

        return StockAdjustResponse.builder()
                .itemId(saved.getItem().getId())
                .itemName(saved.getItem().getName())
                .previousQuantity(previousQuantity)
                .actualQuantity(saved.getCurrentQty())
                .difference(difference)
                .reason(request.getReason())
                .lastUpdated(saved.getLastUpdated())
                .message("Stock adjusted successfully")
                .build();
    }

    public void updateReorderLevel(java.util.UUID itemId, Integer reorderLevel, java.util.UUID shopId) {
        if (shopId == null) {
            throw new RuntimeException("Shop ID is required to update reorder level");
        }
        
        java.util.Optional<com.coop.erp.inventory.entity.ShopItem> optShopItem = shopItemRepository.findByShopIdAndItemId(shopId, itemId);
        com.coop.erp.inventory.entity.ShopItem shopItem;
        
        if (optShopItem.isPresent()) {
            shopItem = optShopItem.get();
        } else {
            com.coop.erp.core.entity.Shop shop = new com.coop.erp.core.entity.Shop();
            shop.setId(shopId);
            com.coop.erp.inventory.entity.ItemProduct item = new com.coop.erp.inventory.entity.ItemProduct();
            item.setId(itemId);
            
            shopItem = com.coop.erp.inventory.entity.ShopItem.builder()
                    .shop(shop)
                    .item(item)
                    .build();
        }
        
        shopItem.setReorderLevel(reorderLevel);
        shopItemRepository.save(shopItem);
    }
}