package com.coop.erp.inventory.repository;

import com.coop.erp.inventory.entity.PurchaseInvoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PurchaseInvoiceRepository extends JpaRepository<PurchaseInvoice, UUID> {

    List<PurchaseInvoice> findAllByOrderByInvoiceDateDesc();

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(p.totalAmount), 0) FROM PurchaseInvoice p WHERE p.invoiceDate >= :from AND p.invoiceDate <= :to")
    java.math.BigDecimal sumTotalAmountByInvoiceDateBetween(@org.springframework.data.repository.query.Param("from") java.time.LocalDate from, @org.springframework.data.repository.query.Param("to") java.time.LocalDate to);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(p.totalAmount), 0) FROM PurchaseInvoice p WHERE p.invoiceDate <= :asOf")
    java.math.BigDecimal sumTotalAmountByInvoiceDateBefore(@org.springframework.data.repository.query.Param("asOf") java.time.LocalDate asOf);

    List<PurchaseInvoice> findByInvoiceDateBetween(java.time.LocalDate from, java.time.LocalDate to);
}