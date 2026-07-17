package com.coop.erp.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductImportRow {
    private int rowNumber;
    private String productName;
    private String category;
    private BigDecimal unitPrice;
    private BigDecimal costPrice;
    private Integer defaultReorderLevel;
    private Integer openingStockQty;
    private Boolean isActive;
    
    @Builder.Default
    private String status = "VALID"; // VALID, INVALID, SKIPPED, CREATED
    
    @Builder.Default
    private List<String> errors = new ArrayList<>();
    
    public void addError(String error) {
        this.errors.add(error);
        this.status = "INVALID";
    }
}
