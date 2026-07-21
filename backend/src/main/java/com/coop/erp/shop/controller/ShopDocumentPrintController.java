package com.coop.erp.shop.controller;

import com.coop.erp.inventory.dto.SaleResponse;
import com.coop.erp.inventory.entity.CashSession;
import com.coop.erp.inventory.service.SaleService;
import com.coop.erp.inventory.service.CashSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/shop/documents")
@RequiredArgsConstructor
public class ShopDocumentPrintController {

    private final SaleService saleService;
    private final CashSessionService cashSessionService;

    @GetMapping("/sales/{id}/invoice")
    public ResponseEntity<SaleResponse> printSaleInvoice(@PathVariable UUID id) {
        return ResponseEntity.ok(saleService.getSaleById(id));
    }

    @GetMapping("/cash-sessions/{id}/closing-sheet")
    public ResponseEntity<CashSession> printCashClosingSheet(@PathVariable UUID id) {
        return ResponseEntity.ok(cashSessionService.getSessionById(id));
    }

    @GetMapping("/cash-sessions/{id}/denomination-sheet")
    public ResponseEntity<CashSession> printCashDenominationSheet(@PathVariable UUID id) {
        return ResponseEntity.ok(cashSessionService.getSessionById(id));
    }
}
