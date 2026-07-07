package com.coop.erp.inventory.repository;

import com.coop.erp.inventory.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SupplierRepository extends JpaRepository<Supplier, UUID> {

    List<Supplier> findByIsActiveTrue();
}