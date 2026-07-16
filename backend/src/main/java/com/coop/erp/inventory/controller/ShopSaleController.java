package com.coop.erp.inventory.controller;

import com.coop.erp.inventory.dto.SaleRequest;
import com.coop.erp.inventory.dto.SaleResponse;
import com.coop.erp.inventory.service.SaleService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import com.coop.erp.auth.service.AuthService;

@RestController
@RequestMapping("/api/v1/shop/sales")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('SHOP_ADMIN', 'SHOP_USER')")
public class ShopSaleController {

    private final SaleService saleService;
    private final AuthService authService;

    @GetMapping("/history")
    public ResponseEntity<List<SaleResponse>> getShopSalesHistory(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(required = false) UUID terminalId,
            @RequestParam(required = false) String cashierId,
            @RequestParam(required = false) com.coop.erp.inventory.entity.PaymentMethod paymentMethod,
            HttpServletRequest servletRequest) {
        
        String shopIdStr = (String) servletRequest.getAttribute("shopId");
        if (shopIdStr == null) {
            return ResponseEntity.badRequest().build();
        }
        if (terminalId == null) {
            return ResponseEntity.badRequest().header("X-Error-Message", "Terminal is required for sales history.").build();
        }

        UUID shopId = UUID.fromString(shopIdStr);

        // Default dates to today if null
        if (fromDate == null) {
            fromDate = java.time.LocalDate.now().atStartOfDay();
        }
        if (toDate == null) {
            toDate = java.time.LocalDate.now().atTime(23, 59, 59, 999999999);
        }

        List<SaleResponse> sales = saleService.getShopSalesHistoryFiltered(shopId, fromDate, toDate, terminalId, cashierId, paymentMethod);
        return ResponseEntity.ok(sales);
    }

    @PostMapping
    public SaleResponse createSale(@RequestBody SaleRequest request, Principal principal, HttpServletRequest servletRequest) {
        String shopIdStr = (String) servletRequest.getAttribute("shopId");
        if (shopIdStr == null || shopIdStr.isEmpty()) {
            throw new RuntimeException("Unauthorized: No shop associated with the current user");
        }
        if (request.getPaymentMethod() == com.coop.erp.inventory.entity.PaymentMethod.CREDIT) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Credit sales are not supported yet.");
        }
        UUID shopId = UUID.fromString(shopIdStr);
        return saleService.createShopSale(request, principal.getName(), shopId);
    }

    @GetMapping
    public List<SaleResponse> getAllSales(HttpServletRequest servletRequest) {
        String shopIdStr = (String) servletRequest.getAttribute("shopId");
        if (shopIdStr == null || shopIdStr.isEmpty()) {
            throw new RuntimeException("Unauthorized: No shop associated with the current user");
        }
        UUID shopId = UUID.fromString(shopIdStr);
        return saleService.getShopSales(shopId);
    }
}
