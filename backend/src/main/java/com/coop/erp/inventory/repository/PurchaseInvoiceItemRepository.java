package com.coop.erp.inventory.repository;

import com.coop.erp.inventory.entity.PurchaseInvoice;
import com.coop.erp.inventory.entity.PurchaseInvoiceItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PurchaseInvoiceItemRepository extends JpaRepository<PurchaseInvoiceItem, UUID> {

    List<PurchaseInvoiceItem> findByPurchaseInvoice(PurchaseInvoice purchaseInvoice);
}