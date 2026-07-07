package com.coop.erp.inventory.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class StockReduceResponse {

    private UUID itemId;
    private String itemName;
    private Integer reducedQuantity;
    private Integer previousQuantity;
    private Integer currentQuantity;
    private String reason;
    private LocalDateTime lastUpdated;
    private String message;
}