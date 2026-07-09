package com.coop.erp.inventory.controller;

import com.coop.erp.inventory.entity.StockLedger;
import com.coop.erp.inventory.service.StockLedgerService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/stock")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminStockController {

    private final StockLedgerService stockLedgerService;

    @GetMapping
    public List<StockLedger> getAllStock() {
        // null shopId implies main shop stock
        return stockLedgerService.getAllStock(null);
    }
}
