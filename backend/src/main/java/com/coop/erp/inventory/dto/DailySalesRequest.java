package com.coop.erp.inventory.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class DailySalesRequest {

    @NotNull(message = "Sales date is required")
    private LocalDate salesDate;

    @NotNull(message = "Total sales value is required")
    @DecimalMin(value = "0.0", message = "Total sales value cannot be negative")
    private BigDecimal totalSalesValue;

    @NotNull(message = "Cash handed over is required")
    @DecimalMin(value = "0.0", message = "Cash handed over cannot be negative")
    private BigDecimal cashHandedOver;

    @NotNull(message = "Operator ID is required")
    private UUID operatorId;

    private String receivedBy;

    private String remarks;
}