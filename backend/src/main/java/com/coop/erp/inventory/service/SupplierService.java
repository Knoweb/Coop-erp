package com.coop.erp.inventory.service;

import com.coop.erp.inventory.dto.SupplierRequest;
import com.coop.erp.inventory.entity.Supplier;
import com.coop.erp.inventory.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;

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

        return supplierRepository.save(supplier);
    }

    public Supplier updateSupplier(UUID id, SupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        supplier.setName(request.getName());
        supplier.setContactNumber(request.getContactNumber());
        supplier.setAddress(request.getAddress());

        return supplierRepository.save(supplier);
    }
}