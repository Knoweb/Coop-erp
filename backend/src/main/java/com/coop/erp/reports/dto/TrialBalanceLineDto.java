package com.coop.erp.reports.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrialBalanceLineDto {
    private String accountCode;
    private String accountName;
    private BigDecimal debit;
    private BigDecimal credit;
}
