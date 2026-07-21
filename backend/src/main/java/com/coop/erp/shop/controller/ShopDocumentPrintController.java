package com.coop.erp.shop.controller;

import com.coop.erp.inventory.dto.SaleResponse;
import com.coop.erp.inventory.entity.CashSession;
import com.coop.erp.inventory.service.SaleService;
import com.coop.erp.inventory.service.CashSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.servlet.http.HttpServletRequest;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/shop/documents")
@RequiredArgsConstructor
public class ShopDocumentPrintController {

    private final SaleService saleService;
    private final CashSessionService cashSessionService;

    @GetMapping("/sales/{id}/invoice")
    @PreAuthorize("hasAnyAuthority('SHOP_ADMIN','SHOP_USER','CASHIER','ADMIN','TENANT_ADMIN')")
    public ResponseEntity<SaleResponse> printSaleInvoice(@PathVariable UUID id, HttpServletRequest request) {
        String shopIdStr = (String) request.getAttribute("shopId");
        UUID shopId = shopIdStr != null ? UUID.fromString(shopIdStr) : null;
        boolean isAdmin = request.isUserInRole("ADMIN") || request.isUserInRole("TENANT_ADMIN");
        return ResponseEntity.ok(saleService.getSaleByIdForPrint(id, shopId, isAdmin));
    }

    @GetMapping("/cash-sessions/{id}/closing-sheet")
    @PreAuthorize("hasAnyAuthority('SHOP_ADMIN','SHOP_USER','CASHIER','ADMIN','TENANT_ADMIN')")
    public ResponseEntity<CashSession> printCashClosingSheet(@PathVariable UUID id) {
        return ResponseEntity.ok(cashSessionService.getSessionById(id));
    }

    @GetMapping("/cash-sessions/{id}/denomination-sheet")
    @PreAuthorize("hasAnyAuthority('SHOP_ADMIN','SHOP_USER','CASHIER','ADMIN','TENANT_ADMIN')")
    public ResponseEntity<CashSession> printCashDenominationSheet(@PathVariable UUID id) {
        return ResponseEntity.ok(cashSessionService.getSessionById(id));
    }
}
