package com.coop.erp.inventory.controller;

import com.coop.erp.inventory.dto.SaleResponse;
import com.coop.erp.inventory.service.SaleService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/shop/purchase-history")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('SHOP_ADMIN', 'SHOP_USER')")
public class ShopPurchaseHistoryController {

    private final SaleService saleService;

    @GetMapping
    public ResponseEntity<List<SaleResponse>> getPurchaseHistory(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String search) {
        String shopIdStr = (String) request.getAttribute("shopId");
        UUID shopId = shopIdStr != null ? UUID.fromString(shopIdStr) : null;
        
        LocalDateTime from = fromDate != null ? fromDate.atStartOfDay() : null;
        LocalDateTime to = toDate != null ? toDate.atTime(23, 59, 59) : null;
        
        return ResponseEntity.ok(saleService.getShopPurchaseHistory(shopId, from, to, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SaleResponse> getPurchaseHistoryDetails(
            @PathVariable UUID id,
            HttpServletRequest request) {
        String shopIdStr = (String) request.getAttribute("shopId");
        UUID shopId = shopIdStr != null ? UUID.fromString(shopIdStr) : null;
        return ResponseEntity.ok(saleService.getShopPurchaseHistoryById(id, shopId));
    }
}
