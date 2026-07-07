package com.coop.erp.inventory.repository;

import com.coop.erp.inventory.entity.DailySales;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DailySalesRepository extends JpaRepository<DailySales, UUID> {

    Optional<DailySales> findBySalesDate(LocalDate salesDate);

    List<DailySales> findAllByOrderBySalesDateDesc();
}