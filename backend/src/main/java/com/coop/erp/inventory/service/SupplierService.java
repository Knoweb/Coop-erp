package com.coop.erp.inventory.service;

import com.coop.erp.inventory.dto.SupplierRequest;
import com.coop.erp.inventory.entity.Supplier;
import com.coop.erp.inventory.repository.SupplierRepository;
import com.coop.erp.admin.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final AuditLogService auditLogService;

    public List<Supplier> getAllActiveSuppliers() {
        return supplierRepository.findByIsActiveTrue();
    }

    public Supplier createSupplier(SupplierRequest request) {
        Supplier supplier = Supplier.builder()
                .name(request.getName())
                .contactNumber(request.getContactNumber())
                .address(request.getAddress())
                .isActive(true)
                .build();

        Supplier savedSupplier = supplierRepository.save(supplier);
        auditLogService.logTenantAction(
                "SUPPLIER_CREATED",
                "SUPPLIER",
                savedSupplier.getId().toString(),
                "Created supplier: " + savedSupplier.getName(),
                null,
                null
        );
        return savedSupplier;
    }

    public Supplier updateSupplier(UUID id, SupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        supplier.setName(request.getName());
        supplier.setContactNumber(request.getContactNumber());
        supplier.setAddress(request.getAddress());

        Supplier savedSupplier = supplierRepository.save(supplier);
        auditLogService.logTenantAction(
                "SUPPLIER_UPDATED",
                "SUPPLIER",
                savedSupplier.getId().toString(),
                "Updated supplier: " + savedSupplier.getName(),
                null,
                null
        );
        return savedSupplier;
    }

    public Supplier toggleSupplierStatus(UUID id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));
        supplier.setIsActive(!supplier.getIsActive());
        Supplier savedSupplier = supplierRepository.save(supplier);
        auditLogService.logTenantAction(
                "SUPPLIER_DEACTIVATED",
                "SUPPLIER",
                savedSupplier.getId().toString(),
                "Changed status to " + savedSupplier.getIsActive() + " for supplier " + savedSupplier.getName(),
                String.valueOf(!savedSupplier.getIsActive()),
                String.valueOf(savedSupplier.getIsActive())
        );
        return savedSupplier;
    }
}