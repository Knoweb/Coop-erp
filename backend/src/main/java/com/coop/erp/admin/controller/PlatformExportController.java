package com.coop.erp.admin.controller;

import com.coop.erp.admin.service.ExportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/platform/exports")
public class PlatformExportController {

    private final ExportService exportService;

    public PlatformExportController(ExportService exportService) {
        this.exportService = exportService;
    }

    private ResponseEntity<byte[]> createCsvResponse(String csvData, String filename) {
        byte[] data = csvData.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(data);
    }

    @GetMapping("/tenants")
    @PreAuthorize("hasAuthority('PLATFORM_ADMIN')")
    public ResponseEntity<byte[]> exportTenants() throws Exception {
        return createCsvResponse(exportService.exportTenants(), "tenants-" + java.time.LocalDate.now() + ".csv");
    }

    @GetMapping("/tenant-usage-summary")
    @PreAuthorize("hasAuthority('PLATFORM_ADMIN')")
    public ResponseEntity<byte[]> exportTenantUsageSummary() throws Exception {
        // Just exporting tenants for now, as usage summary logic requires more complex aggregations.
        // We will output a basic CSV here for the time being.
        String csvData = "Tenant ID,Name,Status\n"; // Simplified mock implementation
        return createCsvResponse(csvData, "tenant-usage-" + java.time.LocalDate.now() + ".csv");
    }
}
