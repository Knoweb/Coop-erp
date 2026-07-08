package com.coop.erp.inventory.repository;

import com.coop.erp.inventory.entity.StockLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StockLedgerRepository extends JpaRepository<StockLedger, UUID> {

    Optional<StockLedger> findByItemIdAndShopId(UUID itemId, UUID shopId);

    Optional<StockLedger> findByItemIdAndShopIsNull(UUID itemId);

    List<StockLedger> findByShopId(UUID shopId);

    List<StockLedger> findByShopIsNull();

    @Query("""
           SELECT s FROM StockLedger s
           WHERE s.currentQty <= s.item.reorderLevel
           AND (s.shop.id = :shopId OR (:shopId IS NULL AND s.shop IS NULL))
           """)
    List<StockLedger> findLowStockItems(UUID shopId);

    @Query("""
           SELECT s FROM StockLedger s
           WHERE s.currentQty = 0
           AND (s.shop.id = :shopId OR (:shopId IS NULL AND s.shop IS NULL))
           """)
    List<StockLedger> findOutOfStockItems(UUID shopId);
}