package com.coop.erp.inventory.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class StockAdjustResponse {

    private UUID itemId;
    private String itemName;
    private Integer previousQuantity;
    private Integer actualQuantity;
    private Integer difference;
    private String reason;
    private LocalDateTime lastUpdated;
    private String message;
}