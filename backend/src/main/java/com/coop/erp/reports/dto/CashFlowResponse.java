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
public class CashFlowResponse {
    private LocalDate fromDate;
    private LocalDate toDate;

    @Builder.Default
    private List<ReportLineDto> operatingActivities = new ArrayList<>();
    
    @Builder.Default
    private List<ReportLineDto> investingActivities = new ArrayList<>();
    
    @Builder.Default
    private List<ReportLineDto> financingActivities = new ArrayList<>();

    private BigDecimal netOperatingCashFlow;
    private BigDecimal netInvestingCashFlow;
    private BigDecimal netFinancingCashFlow;
    private BigDecimal netCashFlow;
}
