package com.coop.erp.inventory.repository;

import com.coop.erp.inventory.entity.ItemProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface ItemProductRepository extends JpaRepository<ItemProduct, UUID> {

    List<ItemProduct> findByIsActiveTrue();

    @Query("""
           SELECT i
           FROM ItemProduct i
           JOIN StockLedger s ON s.item = i
           WHERE i.isActive = true
           AND s.currentQty <= i.reorderLevel
           """)
    List<ItemProduct> findLowStockItems();
}