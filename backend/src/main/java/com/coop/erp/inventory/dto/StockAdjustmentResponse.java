package com.coop.erp.inventory.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class StockAdjustmentResponse {

    private UUID id;

    private UUID itemId;
    private String itemName;
    private String category;

    private String adjustmentType;

    private Integer previousQty;
    private Integer quantityChanged;
    private Integer newQty;

    private BigDecimal unitPrice;
    private BigDecimal totalAmount;

    private String reason;
    private String remarks;

    private LocalDate adjustmentDate;
    private LocalDateTime createdAt;
}