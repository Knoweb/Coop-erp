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

    long countByShopIdAndIsActiveTrue(UUID shopId);

    @org.springframework.data.jpa.repository.Query("""
        SELECT new com.coop.erp.inventory.dto.ShopProductCountDto(
            s.id,
            s.name,
            COUNT(si.id)
        )
        FROM Shop s
        LEFT JOIN ShopItem si ON si.shop = s AND si.isActive = true
        WHERE s.active = true
        GROUP BY s.id, s.name
        ORDER BY s.name
    """)
    List<com.coop.erp.inventory.dto.ShopProductCountDto> countAllShopSelectedProducts();
}
