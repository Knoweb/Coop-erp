package com.coop.erp.reports.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeneralLedgerResponse {
    private LocalDate fromDate;
    private LocalDate toDate;
    private String accountCode;
    
    @Builder.Default
    private List<LedgerLineDto> rows = new ArrayList<>();
}
