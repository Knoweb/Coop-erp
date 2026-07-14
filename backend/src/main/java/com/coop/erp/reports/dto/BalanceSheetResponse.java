package com.coop.erp.reports.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BalanceSheetResponse {
    private LocalDate asOfDate;

    @Builder.Default
    private List<ReportLineDto> assets = new ArrayList<>();
    
    @Builder.Default
    private List<ReportLineDto> liabilities = new ArrayList<>();
    
    @Builder.Default
    private List<ReportLineDto> equity = new ArrayList<>();

    private BigDecimal totalAssets;
    private BigDecimal totalLiabilities;
    private BigDecimal totalEquity;
    private BigDecimal liabilitiesAndEquity;
    private boolean balanced;
}
