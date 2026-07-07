package com.coop.erp.inventory.service;

import com.coop.erp.inventory.dto.DailySalesRequest;
import com.coop.erp.inventory.dto.DailySalesResponse;
import com.coop.erp.inventory.entity.DailySales;
import com.coop.erp.inventory.repository.DailySalesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DailySalesService {

    private final DailySalesRepository dailySalesRepository;

    public DailySalesResponse createDailySales(DailySalesRequest request) {

        dailySalesRepository.findBySalesDate(request.getSalesDate())
                .ifPresent(existing -> {
                    throw new RuntimeException("Daily sales already recorded for this date");
                });

        BigDecimal discrepancy = request.getCashHandedOver()
                .subtract(request.getTotalSalesValue());

        DailySales dailySales = DailySales.builder()
                .salesDate(request.getSalesDate())
                .totalSalesValue(request.getTotalSalesValue())
                .cashHandedOver(request.getCashHandedOver())
                .discrepancy(discrepancy)
                .operatorId(request.getOperatorId())
                .receivedBy(request.getReceivedBy())
                .remarks(request.getRemarks())
                .createdAt(LocalDateTime.now())
                .build();

        DailySales saved = dailySalesRepository.save(dailySales);

        return buildResponse(saved);
    }

    public List<DailySalesResponse> getAllDailySales() {
        return dailySalesRepository.findAllByOrderBySalesDateDesc()
                .stream()
                .map(this::buildResponse)
                .toList();
    }

    private DailySalesResponse buildResponse(DailySales dailySales) {
        BigDecimal discrepancy = dailySales.getDiscrepancy();

        String status;
        String message;

        if (discrepancy.compareTo(BigDecimal.ZERO) == 0) {
            status = "BALANCED";
            message = "Cash handover is balanced.";
        } else if (discrepancy.compareTo(BigDecimal.ZERO) < 0) {
            status = "SHORT";
            message = "Cash handover is short.";
        } else {
            status = "EXTRA";
            message = "Extra cash handed over.";
        }

        return DailySalesResponse.builder()
                .id(dailySales.getId())
                .salesDate(dailySales.getSalesDate())
                .totalSalesValue(dailySales.getTotalSalesValue())
                .cashHandedOver(dailySales.getCashHandedOver())
                .discrepancy(dailySales.getDiscrepancy())
                .operatorId(dailySales.getOperatorId())
                .receivedBy(dailySales.getReceivedBy())
                .remarks(dailySales.getRemarks())
                .status(status)
                .message(message)
                .build();
    }
}