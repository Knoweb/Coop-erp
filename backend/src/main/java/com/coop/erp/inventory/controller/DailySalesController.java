package com.coop.erp.inventory.controller;

import com.coop.erp.inventory.dto.DailySalesRequest;
import com.coop.erp.inventory.dto.DailySalesResponse;
import com.coop.erp.inventory.service.DailySalesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/milk-shop/sales")
@RequiredArgsConstructor
public class DailySalesController {

    private final DailySalesService dailySalesService;

    @PostMapping("/daily-summary")
    public DailySalesResponse createDailySales(
            @Valid @RequestBody DailySalesRequest request
    ) {
        return dailySalesService.createDailySales(request);
    }

    @GetMapping
    public List<DailySalesResponse> getAllDailySales() {
        return dailySalesService.getAllDailySales();
    }
}