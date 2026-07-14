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
public class IncomeStatementResponse {
    private LocalDate fromDate;
    private LocalDate toDate;

    @Builder.Default
    private List<ReportLineDto> revenue = new ArrayList<>();
    
    @Builder.Default
    private List<ReportLineDto> costOfGoods = new ArrayList<>();
    
    @Builder.Default
    private List<ReportLineDto> expenses = new ArrayList<>();

    private BigDecimal totalRevenue;
    private BigDecimal totalCostOfGoods;
    private BigDecimal grossProfit;
    private BigDecimal totalExpenses;
    private BigDecimal netIncome;
}
