package com.coop.erp.inventory.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class GrnResponse {

    private UUID id;
    private String supplierName;
    private String invoiceNumber;
    private LocalDate invoiceDate;
    private BigDecimal totalAmount;
    private String remarks;
    private List<GrnResponseItem> items;

    @Getter
    @Builder
    public static class GrnResponseItem {
        private String itemName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal lineTotal;
    }
}