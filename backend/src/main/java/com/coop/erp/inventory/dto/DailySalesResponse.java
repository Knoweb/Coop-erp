package com.coop.erp.inventory.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Builder
public class DailySalesResponse {

    private UUID id;
    private LocalDate salesDate;
    private BigDecimal totalSalesValue;
    private BigDecimal cashHandedOver;
    private BigDecimal discrepancy;
    private UUID operatorId;
    private String receivedBy;
    private String remarks;
    private String status;
    private String message;
}