package com.coop.erp.inventory.repository;

import com.coop.erp.inventory.entity.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, UUID> {
    List<StockMovement> findByShopIdAndItemIdOrderByMovementDateDesc(UUID shopId, UUID itemId);
    List<StockMovement> findByShopIsNullAndItemIdOrderByMovementDateDesc(UUID itemId);
}
