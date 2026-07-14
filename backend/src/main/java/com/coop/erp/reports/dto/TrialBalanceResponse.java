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
public class TrialBalanceResponse {
    private LocalDate fromDate;
    private LocalDate toDate;

    @Builder.Default
    private List<TrialBalanceLineDto> rows = new ArrayList<>();

    private BigDecimal totalDebit;
    private BigDecimal totalCredit;
    private boolean balanced;
}
