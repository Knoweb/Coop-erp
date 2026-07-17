package com.coop.erp.inventory.controller;

import com.coop.erp.inventory.dto.ProductImportCommitResult;
import com.coop.erp.inventory.dto.ProductImportValidationResult;
import com.coop.erp.inventory.service.ProductImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/admin/products/import")
@RequiredArgsConstructor
public class ProductImportController {

    private final ProductImportService productImportService;

    @GetMapping("/template")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'TENANT_ADMIN')")
    public ResponseEntity<Resource> downloadTemplate() {
        String csvContent = "productName,category,unitPrice,costPrice,defaultReorderLevel,openingStockQty,isActive\n" +
                "Fresh Milk,Milk,600,500,10,0,true\n";
        
        ByteArrayResource resource = new ByteArrayResource(csvContent.getBytes());
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=product-import-template.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(resource);
    }

    @PostMapping("/validate")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'TENANT_ADMIN')")
    public ResponseEntity<ProductImportValidationResult> validateImport(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        if (!file.getOriginalFilename().toLowerCase().endsWith(".csv")) {
            return ResponseEntity.badRequest().build();
        }
        
        return ResponseEntity.ok(productImportService.validateFile(file));
    }

    @PostMapping("/commit")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'TENANT_ADMIN')")
    public ResponseEntity<ProductImportCommitResult> commitImport(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        return ResponseEntity.ok(productImportService.commitImport(file));
    }
}
