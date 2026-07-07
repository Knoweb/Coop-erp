package com.coop.erp.inventory.repository;

import com.coop.erp.inventory.entity.StockAdjustmentLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StockAdjustmentLogRepository
        extends JpaRepository<StockAdjustmentLog, UUID> {

    List<StockAdjustmentLog> findAllByOrderByAdjustmentDateDescCreatedAtDesc();
}