package com.coop.erp.admin.service;

import com.coop.erp.admin.dto.UtilityBillRequest;
import com.coop.erp.admin.dto.UtilityBillResponse;
import com.coop.erp.admin.entity.UtilityBill;
import com.coop.erp.admin.entity.UtilityType;
import com.coop.erp.admin.repository.UtilityBillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UtilityBillService {

    private final UtilityBillRepository repository;

    @Transactional
    public UtilityBillResponse recordBill(UtilityBillRequest request) {

        // 1. Strict Ratio Validation
        BigDecimal totalRatio = request.mainShopRatio().add(request.subShopRatio());
        if (totalRatio.compareTo(BigDecimal.ONE) != 0) {
            throw new IllegalArgumentException("CRITICAL ERROR: Main shop ratio and Sub shop ratio must exactly equal 1.00. Provided sum is: " + totalRatio);
        }

        // 2. Map and Save
        UtilityBill bill = UtilityBill.builder()
                .utilityType(UtilityType.valueOf(request.utilityType().toUpperCase()))
                .billingMonth(request.billingMonth())
                .totalAmount(request.totalAmount())
                .mainShopRatio(request.mainShopRatio())
                .subShopRatio(request.subShopRatio())
                .recordedBy(request.recordedBy())
                .build();

        UtilityBill savedBill = repository.save(bill);

        return mapToResponse(savedBill);
    }

    public List<UtilityBillResponse> getAllBills() {
        return repository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private UtilityBillResponse mapToResponse(UtilityBill bill) {
        // Calculate the specific financial allocations dynamically
        BigDecimal milkShopAllocation = bill.getTotalAmount().multiply(bill.getMainShopRatio()).setScale(2, RoundingMode.HALF_UP);
        BigDecimal roomSectionAllocation = bill.getTotalAmount().multiply(bill.getSubShopRatio()).setScale(2, RoundingMode.HALF_UP);

        return new UtilityBillResponse(
                bill.getId(),
                bill.getUtilityType().name(),
                bill.getBillingMonth(),
                bill.getTotalAmount(),
                bill.getMainShopRatio(),
                bill.getSubShopRatio(),
                milkShopAllocation,
                roomSectionAllocation,
                bill.getRecordedBy(),
                bill.getCreatedAt()
        );
    }
}
