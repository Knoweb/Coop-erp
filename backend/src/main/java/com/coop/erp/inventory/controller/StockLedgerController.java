package com.coop.erp.inventory.controller;

import com.coop.erp.inventory.dto.StockReduceRequest;
import com.coop.erp.inventory.dto.StockReduceResponse;
import com.coop.erp.inventory.entity.StockLedger;
import com.coop.erp.inventory.service.StockLedgerService;
import com.coop.erp.inventory.dto.StockAdjustRequest;
import com.coop.erp.inventory.dto.StockAdjustResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/v1/shop/stock")
@RequiredArgsConstructor
public class StockLedgerController {

    private final StockLedgerService stockLedgerService;

    private java.util.UUID getShopIdFromRequest(HttpServletRequest request) {
        String shopIdStr = (String) request.getAttribute("shopId");
        if (shopIdStr != null && !shopIdStr.isEmpty()) {
            return java.util.UUID.fromString(shopIdStr);
        }
        return null;
    }

    @GetMapping
    public List<StockLedger> getAllStock(HttpServletRequest request) {
        return stockLedgerService.getAllStock(getShopIdFromRequest(request));
    }

    @GetMapping("/alerts")
    public List<StockLedger> getLowStockAlerts(HttpServletRequest request) {
        return stockLedgerService.getLowStockItems(getShopIdFromRequest(request));
    }

    @GetMapping("/out-of-stock")
    public List<StockLedger> getOutOfStockItems(HttpServletRequest request) {
        return stockLedgerService.getOutOfStockItems(getShopIdFromRequest(request));
    }

    @PatchMapping("/reduce")
    @PreAuthorize("hasAnyAuthority('SHOP_ADMIN', 'SHOP_USER')")
    public StockReduceResponse reduceStock(
            @Valid @RequestBody StockReduceRequest req, HttpServletRequest request
    ) {
        return stockLedgerService.reduceStock(req, getShopIdFromRequest(request));
    }

    @PatchMapping("/adjust")
    @PreAuthorize("hasAnyAuthority('SHOP_ADMIN', 'SHOP_USER')")
    public StockAdjustResponse adjustStock(
            @Valid @RequestBody StockAdjustRequest req, HttpServletRequest request
    ) {
        return stockLedgerService.adjustStockToActualQuantity(req, getShopIdFromRequest(request));
    }
}