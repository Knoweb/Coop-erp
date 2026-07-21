package com.coop.erp.admin.controller;

import com.coop.erp.inventory.dto.GrnResponse;
import com.coop.erp.inventory.dto.StockAdjustmentResponse;
import com.coop.erp.inventory.service.GrnService;
import com.coop.erp.inventory.service.StockAdjustmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/documents")
@RequiredArgsConstructor
public class AdminDocumentPrintController {

    private final GrnService grnService;
    private final StockAdjustmentService stockAdjustmentService;

    @GetMapping("/purchase-orders/{id}/print")
    public ResponseEntity<GrnResponse> printPurchaseOrder(@PathVariable UUID id) {
        return ResponseEntity.ok(grnService.getGrnById(id));
    }

    @GetMapping("/grn/{id}/print")
    public ResponseEntity<GrnResponse> printGrn(@PathVariable UUID id) {
        return ResponseEntity.ok(grnService.getGrnById(id));
    }

    @GetMapping("/stock-counts/{id}/print")
    public ResponseEntity<StockAdjustmentResponse> printStockCount(@PathVariable UUID id) {
        return ResponseEntity.ok(stockAdjustmentService.getById(id));
    }
}
