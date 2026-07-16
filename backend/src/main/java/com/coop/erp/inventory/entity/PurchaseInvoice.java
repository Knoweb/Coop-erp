package com.coop.erp.inventory.entity;

import jakarta.persistence.*;
import com.coop.erp.admin.entity.Tenant;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import java.math.BigDecimal;
import com.coop.erp.admin.entity.Tenant;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;
import com.coop.erp.admin.entity.Tenant;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import com.coop.erp.admin.entity.Tenant;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.UUID;

@Entity
@org.hibernate.annotations.Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")
@Table(name = "purchase_invoices", schema = "grocery")
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

    @JsonIgnore
    @ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;
}


