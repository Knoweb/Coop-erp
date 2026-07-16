package com.coop.erp.inventory.repository;

import com.coop.erp.inventory.entity.SaleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SaleItemRepository extends JpaRepository<SaleItem, UUID> {

    @org.springframework.data.jpa.repository.Query("SELECT si FROM SaleItem si LEFT JOIN FETCH si.item WHERE si.sale.id = :saleId")
    java.util.List<SaleItem> findBySaleId(@org.springframework.data.repository.query.Param("saleId") UUID saleId);
}




