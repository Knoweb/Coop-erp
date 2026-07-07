package com.coop.erp.admin.repository;

import com.coop.erp.admin.entity.UtilityBill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UtilityBillRepository extends JpaRepository<UtilityBill, UUID> {
    List<UtilityBill> findAllByOrderByCreatedAtDesc();
}