package com.coop.erp.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductImportValidationResult {
    private int totalRows;
    private int validRows;
    private int invalidRows;
    
    @Builder.Default
    private List<String> warnings = new ArrayList<>();
    
    @Builder.Default
    private List<ProductImportRow> rows = new ArrayList<>();
}
