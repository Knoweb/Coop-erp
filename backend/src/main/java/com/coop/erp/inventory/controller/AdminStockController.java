package com.coop.erp.inventory.controller;

import com.coop.erp.core.entity.Shop;
import com.coop.erp.core.repository.ShopRepository;
import com.coop.erp.inventory.entity.StockLedger;
import com.coop.erp.inventory.service.StockLedgerService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/admin/stock")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ADMIN', 'TENANT_ADMIN')")
public class AdminStockController {

    private final StockLedgerService stockLedgerService;
    private final ShopRepository shopRepository;

    private java.util.UUID getMainShopId() {
        Optional<Shop> mainShopOpt = shopRepository.findByCode("MAIN_SHOP");
        if (mainShopOpt.isEmpty()) {
            mainShopOpt = shopRepository.findByCode("MAIN");
        }
        return mainShopOpt.map(Shop::getId).orElse(null);
    }

    @GetMapping
    public List<com.coop.erp.inventory.dto.StockLedgerResponse> getAllStock() {
        return stockLedgerService.getAllStock(getMainShopId());
    }
}
