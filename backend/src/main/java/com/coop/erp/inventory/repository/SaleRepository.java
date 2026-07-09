package com.coop.erp.inventory.repository;

import com.coop.erp.inventory.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SaleRepository extends JpaRepository<Sale, UUID> {
    List<Sale> findBySourceShopId(UUID shopId);
    List<Sale> findBySourceShopIsNull();
    List<Sale> findByTargetShopId(UUID targetShopId);
    java.util.Optional<Sale> findByIdAndTargetShopId(UUID id, UUID targetShopId);

    long countBySourceShopIdAndSaleDateBetween(UUID sourceShopId, java.time.LocalDateTime startOfDay, java.time.LocalDateTime endOfDay);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sale s WHERE s.sourceShop.id = :shopId AND s.saleDate >= :startOfDay AND s.saleDate < :endOfDay")
    java.math.BigDecimal sumTotalAmountBySourceShopIdAndSaleDateBetween(
            @org.springframework.data.repository.query.Param("shopId") UUID shopId,
            @org.springframework.data.repository.query.Param("startOfDay") java.time.LocalDateTime startOfDay,
            @org.springframework.data.repository.query.Param("endOfDay") java.time.LocalDateTime endOfDay);


    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT s FROM Sale s LEFT JOIN s.items si LEFT JOIN si.item i WHERE s.targetShop.id = :shopId AND " +
            "(cast(:fromDate as java.time.LocalDateTime) IS NULL OR s.saleDate >= :fromDate) AND " +
            "(cast(:toDate as java.time.LocalDateTime) IS NULL OR s.saleDate <= :toDate) AND " +
            "(LOWER(s.saleNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(i.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Sale> findPurchaseHistoryWithFilters(
            @org.springframework.data.repository.query.Param("shopId") UUID shopId,
            @org.springframework.data.repository.query.Param("fromDate") java.time.LocalDateTime fromDate,
            @org.springframework.data.repository.query.Param("toDate") java.time.LocalDateTime toDate,
            @org.springframework.data.repository.query.Param("search") String search);
}
