package com.coop.erp.inventory.repository;

import com.coop.erp.inventory.entity.ItemProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ItemProductRepository extends JpaRepository<ItemProduct, UUID> {

    List<ItemProduct> findByIsActiveTrue();

    @Query("""
           SELECT i
           FROM ItemProduct i
           JOIN StockLedger s ON s.item = i
           JOIN ShopItem si ON si.item = i AND si.shop = s.shop
           WHERE i.isActive = true
           AND si.isActive = true
           AND s.currentQty <= si.reorderLevel
           """)
    List<ItemProduct> findAllLowStockItems();

    List<ItemProduct> findAllByOrderByNameAsc();

    long countByIsActiveTrue();

    @Query("""
           SELECT i
           FROM ItemProduct i
           JOIN StockLedger s ON s.item = i
           JOIN ShopItem si ON si.item = i AND si.shop = s.shop
           WHERE i.isActive = true
           AND si.isActive = true
           AND s.shop.id = :shopId
           AND si.shop.id = :shopId
           AND s.currentQty <= si.reorderLevel
           """)
    List<ItemProduct> findLowStockItemsByShopId(@Param("shopId") UUID shopId);
}