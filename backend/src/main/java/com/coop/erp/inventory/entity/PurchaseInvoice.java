package com.coop.erp.inventory.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "purchase_invoice", schema = "schema_milk_shop")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseInvoice {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Column(name = "invoice_number", length = 50)
    private String invoiceNumber;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "invoice_date", nullable = false)
    private LocalDate invoiceDate;

    @Column(length = 255)
    private String remarks;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}