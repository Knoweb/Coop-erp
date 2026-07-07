package com.coop.erp.inventory.controller;

import com.coop.erp.inventory.dto.StockReduceRequest;
import com.coop.erp.inventory.dto.StockReduceResponse;
import com.coop.erp.inventory.entity.StockLedger;
import com.coop.erp.inventory.service.StockLedgerService;
import com.coop.erp.inventory.dto.StockAdjustRequest;
import com.coop.erp.inventory.dto.StockAdjustResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/shop/stock")
@RequiredArgsConstructor
public class StockLedgerController {

    private final StockLedgerService stockLedgerService;

    @GetMapping
    public List<StockLedger> getAllStock() {
        return stockLedgerService.getAllStock();
    }

    @GetMapping("/alerts")
    public List<StockLedger> getLowStockAlerts() {
        return stockLedgerService.getLowStockItems();
    }

    @GetMapping("/out-of-stock")
    public List<StockLedger> getOutOfStockItems() {
        return stockLedgerService.getOutOfStockItems();
    }

    @PatchMapping("/reduce")
    public StockReduceResponse reduceStock(
            @Valid @RequestBody StockReduceRequest request
    ) {
        return stockLedgerService.reduceStock(request);
    }

    @PatchMapping("/adjust")
    public StockAdjustResponse adjustStock(
            @Valid @RequestBody StockAdjustRequest request
    ) {
        return stockLedgerService.adjustStockToActualQuantity(request);
    }
}