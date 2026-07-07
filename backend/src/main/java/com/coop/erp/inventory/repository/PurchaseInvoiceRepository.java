package com.coop.erp.inventory.repository;

import com.coop.erp.inventory.entity.PurchaseInvoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PurchaseInvoiceRepository extends JpaRepository<PurchaseInvoice, UUID> {

    List<PurchaseInvoice> findAllByOrderByInvoiceDateDesc();
}