package com.coop.erp.inventory.controller;

import com.coop.erp.inventory.dto.SaleRequest;
import com.coop.erp.inventory.dto.SaleResponse;
import com.coop.erp.inventory.service.SaleService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/shop/sales")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('SHOP_ADMIN', 'SHOP_USER')")
public class ShopSaleController {

    private final SaleService saleService;

    @PostMapping
    public SaleResponse createSale(@RequestBody SaleRequest request, Principal principal, HttpServletRequest servletRequest) {
        String shopIdStr = (String) servletRequest.getAttribute("shopId");
        if (shopIdStr == null || shopIdStr.isEmpty()) {
            throw new RuntimeException("Unauthorized: No shop associated with the current user");
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
