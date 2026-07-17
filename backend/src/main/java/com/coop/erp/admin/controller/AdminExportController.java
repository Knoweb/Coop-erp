package com.coop.erp.admin.controller;

import com.coop.erp.admin.service.ExportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/admin/exports")
public class AdminExportController {

    private final ExportService exportService;

    public AdminExportController(ExportService exportService) {
        this.exportService = exportService;
    }

    private ResponseEntity<byte[]> createCsvResponse(String csvData, String filename) {
        byte[] data = csvData.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(data);
    }

    @GetMapping("/products")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'TENANT_ADMIN')")
    public ResponseEntity<byte[]> exportProducts() throws Exception {
        return createCsvResponse(exportService.exportProducts(), "products-" + java.time.LocalDate.now() + ".csv");
    }

    @GetMapping("/suppliers")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'TENANT_ADMIN')")
    public ResponseEntity<byte[]> exportSuppliers() throws Exception {
        return createCsvResponse(exportService.exportSuppliers(), "suppliers-" + java.time.LocalDate.now() + ".csv");
    }

    @GetMapping("/shops")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'TENANT_ADMIN')")
    public ResponseEntity<byte[]> exportShops() throws Exception {
        return createCsvResponse(exportService.exportShops(), "shops-" + java.time.LocalDate.now() + ".csv");
    }

    @GetMapping("/stock")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'TENANT_ADMIN')")
    public ResponseEntity<byte[]> exportStock() throws Exception {
        return createCsvResponse(exportService.exportStock(), "stock-" + java.time.LocalDate.now() + ".csv");
    }

    @GetMapping("/sales")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'TENANT_ADMIN')")
    public ResponseEntity<byte[]> exportSales(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate) throws Exception {
        if (fromDate == null) fromDate = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        if (toDate == null) toDate = LocalDateTime.now();
        return createCsvResponse(exportService.exportSales(fromDate, toDate), "sales-" + java.time.LocalDate.now() + ".csv");
    }

    @GetMapping("/purchases")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'TENANT_ADMIN')")
    public ResponseEntity<byte[]> exportPurchases(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate) throws Exception {
        if (fromDate == null) fromDate = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        if (toDate == null) toDate = LocalDateTime.now();
        return createCsvResponse(exportService.exportPurchases(fromDate, toDate), "purchases-" + java.time.LocalDate.now() + ".csv");
    }

    @GetMapping("/cash-sessions")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'TENANT_ADMIN')")
    public ResponseEntity<byte[]> exportCashSessions(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate) throws Exception {
        if (fromDate == null) fromDate = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        if (toDate == null) toDate = LocalDateTime.now();
        return createCsvResponse(exportService.exportCashSessions(fromDate, toDate), "cash-sessions-" + java.time.LocalDate.now() + ".csv");
    }

    @GetMapping("/audit-logs")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'TENANT_ADMIN')")
    public ResponseEntity<byte[]> exportAuditLogs(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate) throws Exception {
        if (fromDate == null) fromDate = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        if (toDate == null) toDate = LocalDateTime.now();
        return createCsvResponse(exportService.exportAuditLogs(fromDate, toDate), "audit-logs-" + java.time.LocalDate.now() + ".csv");
    }
}
