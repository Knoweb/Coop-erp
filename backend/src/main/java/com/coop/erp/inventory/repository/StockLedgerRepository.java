package com.coop.erp.inventory.repository;

import com.coop.erp.inventory.entity.StockLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StockLedgerRepository extends JpaRepository<StockLedger, UUID> {

    Optional<StockLedger> findByItemId(UUID itemId);

    @Query("""
           SELECT s FROM StockLedger s
           WHERE s.currentQty <= s.item.reorderLevel
           """)
    List<StockLedger> findLowStockItems();

    @Query("""
           SELECT s FROM StockLedger s
           WHERE s.currentQty = 0
           """)
    List<StockLedger> findOutOfStockItems();
}