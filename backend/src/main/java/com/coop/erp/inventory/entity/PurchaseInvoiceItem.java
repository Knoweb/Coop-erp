package com.coop.erp.inventory.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "purchase_invoice_item", schema = "schema_milk_shop")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseInvoiceItem {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "purchase_invoice_id", nullable = false)
    private PurchaseInvoice purchaseInvoice;

    @ManyToOne
    @JoinColumn(name = "item_id", nullable = false)
    private ItemProduct item;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "line_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal lineTotal;
}