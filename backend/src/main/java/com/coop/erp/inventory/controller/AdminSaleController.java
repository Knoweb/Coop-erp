package com.coop.erp.inventory.controller;

import com.coop.erp.inventory.dto.SaleRequest;
import com.coop.erp.inventory.dto.SaleResponse;
import com.coop.erp.inventory.service.SaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/sales")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ADMIN', 'TENANT_ADMIN')")
public class AdminSaleController {

    private final SaleService saleService;

    @PostMapping
    public SaleResponse createSale(@RequestBody SaleRequest request, Principal principal) {
        return saleService.createAdminSale(request, principal.getName());
    }

    @GetMapping
    public List<SaleResponse> getAllSales() {
        return saleService.getAdminSales();
    }
}
