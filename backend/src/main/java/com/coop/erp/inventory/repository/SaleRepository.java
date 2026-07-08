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
}
