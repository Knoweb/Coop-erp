package com.coop.erp.dashboard.controller;

import com.coop.erp.dashboard.dto.DashboardSummaryResponse;
import com.coop.erp.dashboard.service.ShopDashboardService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/shop/dashboard")
@RequiredArgsConstructor
public class ShopDashboardController {

    private final ShopDashboardService shopDashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> getSummary(HttpServletRequest request) {
        String shopIdStr = (String) request.getAttribute("shopId");
        if (shopIdStr == null) {
            throw new RuntimeException("Shop ID not found in security context");
        }
        return ResponseEntity.ok(shopDashboardService.getSummary(shopIdStr));
    }
}
