package com.coop.erp.inventory.repository;

import com.coop.erp.inventory.entity.ShopItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ShopItemRepository extends JpaRepository<ShopItem, UUID> {
    List<ShopItem> findByShopIdAndIsActiveTrue(UUID shopId);
    Optional<ShopItem> findByShopIdAndItemId(UUID shopId, UUID itemId);
    boolean existsByShopIdAndItemId(UUID shopId, UUID itemId);
}
