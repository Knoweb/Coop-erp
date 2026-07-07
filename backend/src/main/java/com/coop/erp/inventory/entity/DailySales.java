package com.coop.erp.inventory.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "daily_sales", schema = "schema_milk_shop")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailySales {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "sales_date", nullable = false, unique = true)
    private LocalDate salesDate;

    @Column(name = "total_sales_value", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalSalesValue;

    @Column(name = "cash_handed_over", nullable = false, precision = 12, scale = 2)
    private BigDecimal cashHandedOver;

    @Column(name = "discrepancy", precision = 10, scale = 2)
    private BigDecimal discrepancy;

    @Column(name = "operator_id", nullable = false)
    private UUID operatorId;

    @Column(name = "received_by", length = 100)
    private String receivedBy;

    @Column(length = 255)
    private String remarks;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}