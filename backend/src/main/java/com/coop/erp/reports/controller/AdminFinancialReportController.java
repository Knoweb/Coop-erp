package com.coop.erp.reports.controller;

import com.coop.erp.reports.dto.*;
import com.coop.erp.reports.service.FinancialReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/admin/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminFinancialReportController {

    private final FinancialReportService reportService;

    @GetMapping("/balance-sheet")
    public ResponseEntity<BalanceSheetResponse> getBalanceSheet(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate) {
        return ResponseEntity.ok(reportService.getBalanceSheet(asOfDate));
    }

    @GetMapping("/income-statement")
    public ResponseEntity<IncomeStatementResponse> getIncomeStatement(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return ResponseEntity.ok(reportService.getIncomeStatement(fromDate, toDate));
    }

    @GetMapping("/trial-balance")
    public ResponseEntity<TrialBalanceResponse> getTrialBalance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return ResponseEntity.ok(reportService.getTrialBalance(fromDate, toDate));
    }

    @GetMapping("/cash-flow")
    public ResponseEntity<CashFlowResponse> getCashFlow(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return ResponseEntity.ok(reportService.getCashFlow(fromDate, toDate));
    }

    @GetMapping("/general-ledger")
    public ResponseEntity<GeneralLedgerResponse> getGeneralLedger(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String accountCode) {
        return ResponseEntity.ok(reportService.getGeneralLedger(fromDate, toDate, accountCode));
    }
}
