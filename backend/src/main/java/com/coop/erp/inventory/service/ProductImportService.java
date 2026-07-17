package com.coop.erp.inventory.service;

import com.coop.erp.admin.entity.Tenant;
import com.coop.erp.admin.repository.TenantRepository;
import com.coop.erp.auth.util.TenantContext;
import com.coop.erp.inventory.dto.ProductImportCommitResult;
import com.coop.erp.inventory.dto.ProductImportRow;
import com.coop.erp.inventory.dto.ProductImportValidationResult;
import com.coop.erp.inventory.entity.ItemProduct;
import com.coop.erp.inventory.entity.StockLedger;
import com.coop.erp.inventory.entity.StockMovement;
import com.coop.erp.inventory.repository.ItemProductRepository;
import com.coop.erp.inventory.repository.StockLedgerRepository;
import com.coop.erp.inventory.repository.StockMovementRepository;
import com.coop.erp.admin.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductImportService {

    private final ItemProductRepository itemProductRepository;
    private final TenantRepository tenantRepository;
    private final StockLedgerRepository stockLedgerRepository;
    private final StockMovementRepository stockMovementRepository;
    private final AuditLogService auditLogService;

    private static final String[] HEADERS = {
            "productName", "category", "unitPrice", "costPrice", "defaultReorderLevel", "openingStockQty", "isActive"
    };

    public ProductImportValidationResult validateFile(MultipartFile file) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        List<ProductImportRow> rows = new ArrayList<>();
        int validCount = 0;
        int invalidCount = 0;
        
        // Load existing products for tenant to check for duplicates
        Set<String> existingNames = new HashSet<>();
        itemProductRepository.findAll().forEach(p -> existingNames.add(p.getName().toLowerCase()));
        
        Set<String> fileNames = new HashSet<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).setTrim(true).build())) {

            int rowNumber = 1;
            for (CSVRecord record : csvParser) {
                rowNumber++;
                ProductImportRow row = new ProductImportRow();
                row.setRowNumber(rowNumber);

                // productName
                String productName = record.isSet("productName") ? record.get("productName") : null;
                if (productName == null || productName.trim().isEmpty()) {
                    row.addError("productName is required");
                } else {
                    row.setProductName(productName);
                    if (fileNames.contains(productName.toLowerCase())) {
                        row.addError("Duplicate product name within file");
                    } else if (existingNames.contains(productName.toLowerCase())) {
                        row.addError("Product name already exists in database");
                    }
                    fileNames.add(productName.toLowerCase());
                }

                // category
                row.setCategory(record.isSet("category") ? record.get("category") : "General");

                // unitPrice
                try {
                    String unitPriceStr = record.isSet("unitPrice") ? record.get("unitPrice") : null;
                    if (unitPriceStr == null || unitPriceStr.trim().isEmpty()) {
                        row.addError("unitPrice is required");
                    } else {
                        BigDecimal up = new BigDecimal(unitPriceStr);
                        if (up.compareTo(BigDecimal.ZERO) < 0) {
                            row.addError("unitPrice must be >= 0");
                        }
                        row.setUnitPrice(up);
                    }
                } catch (Exception e) {
                    row.addError("Invalid unitPrice format");
                }

                // costPrice
                try {
                    String costPriceStr = record.isSet("costPrice") ? record.get("costPrice") : null;
                    if (costPriceStr != null && !costPriceStr.trim().isEmpty()) {
                        BigDecimal cp = new BigDecimal(costPriceStr);
                        if (cp.compareTo(BigDecimal.ZERO) < 0) {
                            row.addError("costPrice must be >= 0");
                        }
                        row.setCostPrice(cp);
                    } else {
                        row.setCostPrice(BigDecimal.ZERO);
                    }
                } catch (Exception e) {
                    row.addError("Invalid costPrice format");
                }

                // defaultReorderLevel
                try {
                    String reorderStr = record.isSet("defaultReorderLevel") ? record.get("defaultReorderLevel") : null;
                    if (reorderStr != null && !reorderStr.trim().isEmpty()) {
                        int reorder = Integer.parseInt(reorderStr);
                        if (reorder < 0) row.addError("defaultReorderLevel must be >= 0");
                        row.setDefaultReorderLevel(reorder);
                    } else {
                        row.setDefaultReorderLevel(10);
                    }
                } catch (Exception e) {
                    row.addError("Invalid defaultReorderLevel format");
                }

                // openingStockQty
                try {
                    String openingStr = record.isSet("openingStockQty") ? record.get("openingStockQty") : null;
                    if (openingStr != null && !openingStr.trim().isEmpty()) {
                        int opening = Integer.parseInt(openingStr);
                        if (opening < 0) row.addError("openingStockQty must be >= 0");
                        row.setOpeningStockQty(opening);
                    } else {
                        row.setOpeningStockQty(0);
                    }
                } catch (Exception e) {
                    row.addError("Invalid openingStockQty format");
                }

                // isActive
                String activeStr = record.isSet("isActive") ? record.get("isActive") : "true";
                row.setIsActive(Boolean.parseBoolean(activeStr));

                if ("VALID".equals(row.getStatus())) {
                    validCount++;
                } else {
                    invalidCount++;
                }
                rows.add(row);
            }

        } catch (Exception e) {
            log.error("CSV parsing error", e);
            throw new RuntimeException("Failed to parse CSV file: " + e.getMessage());
        }

        return ProductImportValidationResult.builder()
                .totalRows(rows.size())
                .validRows(validCount)
                .invalidRows(invalidCount)
                .rows(rows)
                .build();
    }

    @Transactional
    public ProductImportCommitResult commitImport(MultipartFile file) {
        ProductImportValidationResult validation = validateFile(file);
        
        UUID tenantId = TenantContext.getCurrentTenantId();
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        int created = 0;
        int skipped = validation.getInvalidRows();
        List<UUID> createdIds = new ArrayList<>();

        for (ProductImportRow row : validation.getRows()) {
            if (!"VALID".equals(row.getStatus())) {
                continue;
            }

            ItemProduct product = ItemProduct.builder()
                    .name(row.getProductName())
                    .category(row.getCategory())
                    .unitPrice(row.getUnitPrice())
                    .costPrice(row.getCostPrice())
                    .defaultReorderLevel(row.getDefaultReorderLevel())
                    .isActive(row.getIsActive())
                    .tenant(tenant)
                    .build();

            product = itemProductRepository.save(product);
            final ItemProduct savedProduct = product;
            createdIds.add(savedProduct.getId());
            created++;

            if (row.getOpeningStockQty() != null && row.getOpeningStockQty() > 0) {
                // Initialize stock ledger in main shop
                StockLedger stockLedger = stockLedgerRepository.findMainStockForUpdate(tenantId, savedProduct.getId())
                        .orElseGet(() -> StockLedger.builder()
                                .tenant(tenant)
                                .item(savedProduct)
                                .shop(null) // Main shop
                                .currentQty(0)
                                .lastUpdated(LocalDateTime.now())
                                .build());

                int prevQty = stockLedger.getCurrentQty();
                stockLedger.setCurrentQty(prevQty + row.getOpeningStockQty());
                stockLedger.setLastUpdated(LocalDateTime.now());
                stockLedgerRepository.save(stockLedger);

                // Record stock movement
                StockMovement movement = StockMovement.builder()
                        .tenant(tenant)
                        .item(product)
                        .shop(null)
                        .movementType("OPENING_STOCK")
                        .quantityIn(row.getOpeningStockQty())
                        .quantityOut(0)
                        .balanceAfter(stockLedger.getCurrentQty())
                        .unitPrice(product.getCostPrice())
                        .createdBy(username)
                        .build();
                
                stockMovementRepository.save(movement);
            }
        }

        ProductImportCommitResult result = ProductImportCommitResult.builder()
                .totalRows(validation.getTotalRows())
                .created(created)
                .skipped(skipped)
                .createdProductIds(createdIds)
                .build();
                
        String summary = String.format("{\"totalRows\": %d, \"created\": %d, \"skipped\": %d}", validation.getTotalRows(), created, skipped);
        
        auditLogService.logTenantAction(
                "BULK_PRODUCT_IMPORT",
                "IMPORT",
                null,
                String.format("Imported %d products, skipped %d rows", created, skipped),
                null,
                summary
        );
        
        return result;
    }
}
