package com.coop.erp.inventory.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockLedgerResponse {
    private UUID id;
    private UUID itemId;
    private UUID shopItemId;
    private String productCode;
    private String productName;
    private String category;
    private Integer currentQty;
    private Integer reorderLevel;
    private java.math.BigDecimal unitCost;
    private java.math.BigDecimal sellingPrice;
    private LocalDateTime lastPurchaseDate;
    private String status;
}
