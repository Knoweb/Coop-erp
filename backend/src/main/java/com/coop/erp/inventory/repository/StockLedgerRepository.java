package com.coop.erp.inventory.repository;

import com.coop.erp.inventory.entity.StockLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StockLedgerRepository extends JpaRepository<StockLedger, UUID> {

    Optional<StockLedger> findByItemIdAndShopId(UUID itemId, UUID shopId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT s FROM StockLedger s
        WHERE s.tenant.id = :tenantId
        AND s.shop.id = :shopId
        AND s.item.id = :itemId
    """)
    Optional<StockLedger> findShopStockForUpdate(
            @org.springframework.data.repository.query.Param("tenantId") UUID tenantId,
            @org.springframework.data.repository.query.Param("shopId") UUID shopId,
            @org.springframework.data.repository.query.Param("itemId") UUID itemId
    );

    Optional<StockLedger> findByItemIdAndShopIsNull(UUID itemId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT s FROM StockLedger s
        WHERE s.tenant.id = :tenantId
        AND s.shop IS NULL
        AND s.item.id = :itemId
    """)
    Optional<StockLedger> findMainStockForUpdate(
            @org.springframework.data.repository.query.Param("tenantId") UUID tenantId,
            @org.springframework.data.repository.query.Param("itemId") UUID itemId
    );

    List<StockLedger> findByShopId(UUID shopId);

    List<StockLedger> findByShopIsNull();

    @Query("""
        SELECT s
        FROM StockLedger s
        JOIN ShopItem si ON si.item = s.item AND si.shop = s.shop
        WHERE si.isActive = true
        AND s.currentQty <= si.reorderLevel
        AND (:shopId IS NULL OR s.shop.id = :shopId)
    """)
    List<StockLedger> findLowStockItems(@org.springframework.data.repository.query.Param("shopId") UUID shopId);

    @Query("""
           SELECT s FROM StockLedger s
           WHERE s.currentQty = 0
           AND (s.shop.id = :shopId OR (:shopId IS NULL AND s.shop IS NULL))
           """)
    List<StockLedger> findOutOfStockItems(UUID shopId);

    @Query("SELECT COALESCE(SUM(s.currentQty * s.item.unitPrice), 0) FROM StockLedger s")
    java.math.BigDecimal calculateTotalInventoryValue();
}