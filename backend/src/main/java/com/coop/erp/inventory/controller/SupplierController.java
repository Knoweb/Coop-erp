package com.coop.erp.inventory.controller;

import com.coop.erp.inventory.dto.SupplierRequest;
import com.coop.erp.inventory.entity.Supplier;
import com.coop.erp.inventory.service.SupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/milk-shop/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

    @PostMapping
    public Supplier createSupplier(@Valid @RequestBody SupplierRequest request) {
        return supplierService.createSupplier(request);
    }

    @GetMapping
    public List<Supplier> getAllSuppliers() {
        return supplierService.getAllActiveSuppliers();
    }

    @PutMapping("/{id}")
    public Supplier updateSupplier(
            @PathVariable UUID id,
            @Valid @RequestBody SupplierRequest request
    ) {
        return supplierService.updateSupplier(id, request);
    }
}