package com.coop.erp.inventory.controller;

import com.coop.erp.inventory.dto.ShopProductCountDto;
import com.coop.erp.inventory.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/shop/dashboard/selected-product-count")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'SHOP_ADMIN', 'ROLE_SHOP_ADMIN', 'SHOP_USER', 'ROLE_SHOP_USER')")
    public Map<String, Long> getSelectedProductCount() {
        long count = dashboardService.getCurrentShopSelectedProductCount();
        return Map.of("selectedProductCount", count);
    }

    @GetMapping("/admin/dashboard/shop-product-counts")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'TENANT_ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public List<ShopProductCountDto> getAllShopProductCounts() {
        return dashboardService.getAllShopSelectedProductCounts();
    }

    @GetMapping("/admin/dashboard/total-products")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'TENANT_ADMIN', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    public Map<String, Long> getTotalProducts() {
        long count = dashboardService.getTotalProductCount();
        return Map.of("totalProducts", count);
    }
}
