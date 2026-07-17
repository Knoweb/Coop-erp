package com.coop.erp.inventory.service;

import com.coop.erp.inventory.dto.ItemProductRequest;
import com.coop.erp.inventory.entity.ItemProduct;
import com.coop.erp.inventory.repository.ItemProductRepository;
import com.coop.erp.admin.service.AuditLogService;

import com.coop.erp.core.entity.Shop;
import com.coop.erp.core.repository.ShopRepository;
import com.coop.erp.inventory.entity.ShopItem;
import com.coop.erp.inventory.entity.StockLedger;
import com.coop.erp.inventory.repository.ShopItemRepository;
import com.coop.erp.inventory.repository.StockLedgerRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ItemProductService {

    private final ItemProductRepository itemProductRepository;
    private final ShopRepository shopRepository;
    private final ShopItemRepository shopItemRepository;
    private final StockLedgerRepository stockLedgerRepository;
    private final AuditLogService auditLogService;

    @PostConstruct
    public void backfillOldProductsForMainShop() {
        Optional<Shop> mainShopOpt = shopRepository.findByCode("MAIN_SHOP");
        if (mainShopOpt.isEmpty()) {
            mainShopOpt = shopRepository.findByCode("MAIN");
        }
        if (mainShopOpt.isPresent()) {
            Shop mainShop = mainShopOpt.get();
            List<ItemProduct> allProducts = itemProductRepository.findAll();
            for (ItemProduct item : allProducts) {
                // Ensure ShopItem exists
                if (shopItemRepository.findByShopIdAndItemId(mainShop.getId(), item.getId()).isEmpty()) {
                    ShopItem shopItem = ShopItem.builder()
                            .shop(mainShop)
                            .item(item)
                            .reorderLevel(item.getDefaultReorderLevel())
                            .isActive(true)
                            .build();
                    shopItemRepository.save(shopItem);
                }
                // Ensure StockLedger exists
                if (stockLedgerRepository.findByItemIdAndShopId(item.getId(), mainShop.getId()).isEmpty()) {
                    StockLedger stockLedger = StockLedger.builder()
                            .shop(mainShop)
                            .item(item)
                            .currentQty(0)
                            .lastUpdated(LocalDateTime.now())
                            .build();
                    stockLedgerRepository.save(stockLedger);
                }
            }
        }
    }

    public List<ItemProduct> getAllItems() {
        return itemProductRepository.findByIsActiveTrue();
    }

    private void provisionMainShopStock(ItemProduct item) {
        Optional<Shop> mainShopOpt = shopRepository.findByCode("MAIN_SHOP");
        if (mainShopOpt.isEmpty()) {
            mainShopOpt = shopRepository.findByCode("MAIN");
        }
        if (mainShopOpt.isPresent()) {
            Shop mainShop = mainShopOpt.get();

            // Create ShopItem if not exists
            Optional<ShopItem> optShopItem = shopItemRepository.findByShopIdAndItemId(mainShop.getId(), item.getId());
            if (optShopItem.isEmpty()) {
                ShopItem shopItem = ShopItem.builder()
                        .shop(mainShop)
                        .item(item)
                        .reorderLevel(item.getDefaultReorderLevel())
                        .isActive(true)
                        .build();
                shopItemRepository.save(shopItem);
            }

            // Create StockLedger if not exists
            Optional<StockLedger> optLedger = stockLedgerRepository.findByItemIdAndShopId(item.getId(), mainShop.getId());
            if (optLedger.isEmpty()) {
                StockLedger stockLedger = StockLedger.builder()
                        .shop(mainShop)
                        .item(item)
                        .currentQty(0)
                        .lastUpdated(LocalDateTime.now())
                        .build();
                stockLedgerRepository.save(stockLedger);
            }
        }
    }

    public ItemProduct createItem(ItemProductRequest request) {
        ItemProduct item = ItemProduct.builder()
                .name(request.getName())
                .category(request.getCategory())
                .defaultReorderLevel(request.getDefaultReorderLevel())
                .unitPrice(request.getUnitPrice())
                .isActive(true)
                .build();

        ItemProduct savedItem = itemProductRepository.save(item);
        provisionMainShopStock(savedItem);
        auditLogService.logTenantAction(
                "PRODUCT_CREATED",
                "PRODUCT",
                savedItem.getId().toString(),
                "Created product: " + savedItem.getName(),
                null,
                null
        );
        return savedItem;
    }

    public ItemProduct updateItem(UUID id, ItemProductRequest request) {
        ItemProduct item = itemProductRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        item.setName(request.getName());
        item.setCategory(request.getCategory());
        item.setDefaultReorderLevel(request.getDefaultReorderLevel());
        item.setUnitPrice(request.getUnitPrice());

        ItemProduct savedItem = itemProductRepository.save(item);
        auditLogService.logTenantAction(
                "PRODUCT_UPDATED",
                "PRODUCT",
                savedItem.getId().toString(),
                "Updated product: " + savedItem.getName(),
                null,
                null
        );
        return savedItem;
    }

    public List<ItemProduct> getLowStockItems() {
        return itemProductRepository.findAllLowStockItems();
    }
}