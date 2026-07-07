package com.coop.erp.inventory.service;

import com.coop.erp.inventory.dto.StockAdjustmentRequest;
import com.coop.erp.inventory.dto.StockAdjustmentResponse;
import com.coop.erp.inventory.entity.ItemProduct;
import com.coop.erp.inventory.entity.StockAdjustmentLog;
import com.coop.erp.inventory.entity.StockLedger;
import com.coop.erp.inventory.repository.ItemProductRepository;
import com.coop.erp.inventory.repository.StockAdjustmentLogRepository;
import com.coop.erp.inventory.repository.StockLedgerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StockAdjustmentService {

    private final StockAdjustmentLogRepository stockAdjustmentLogRepository;
    private final StockLedgerRepository stockLedgerRepository;
    private final ItemProductRepository itemProductRepository;

    public StockAdjustmentResponse createStockAdjustment(StockAdjustmentRequest request) {
        ItemProduct item = itemProductRepository.findById(request.getItemId())
                .orElseThrow(() -> new RuntimeException("Item not found"));

        StockLedger stockLedger = stockLedgerRepository.findByItemId(request.getItemId())
                .orElseThrow(() -> new RuntimeException("Stock record not found for selected item"));

        Integer previousQty = stockLedger.getCurrentQty();
        Integer quantity = request.getQuantity();

        String adjustmentType = request.getAdjustmentType();

        Integer quantityChanged;
        Integer newQty;

        if ("Opening Stock".equalsIgnoreCase(adjustmentType)) {
            quantityChanged = quantity - previousQty;
            newQty = quantity;
        } else if ("Daily Sales Reduction".equalsIgnoreCase(adjustmentType)
                || "Damaged Items".equalsIgnoreCase(adjustmentType)
                || "Expired Items".equalsIgnoreCase(adjustmentType)
                || "Return to Supplier".equalsIgnoreCase(adjustmentType)) {

            if (quantity > previousQty) {
                throw new RuntimeException("Cannot reduce more than available stock");
            }

            quantityChanged = -quantity;
            newQty = previousQty - quantity;
        } else if ("Stock Count Correction".equalsIgnoreCase(adjustmentType)) {
            quantityChanged = quantity - previousQty;
            newQty = quantity;
        } else {
            throw new RuntimeException("Invalid adjustment type");
        }

        BigDecimal unitPrice = item.getUnitPrice();
        BigDecimal totalAmount = unitPrice.multiply(BigDecimal.valueOf(Math.abs(quantityChanged)));

        stockLedger.setCurrentQty(newQty);
        stockLedger.setLastUpdated(LocalDateTime.now());
        stockLedgerRepository.save(stockLedger);

        StockAdjustmentLog adjustmentLog = StockAdjustmentLog.builder()
                .item(item)
                .adjustmentType(adjustmentType)
                .previousQty(previousQty)
                .quantityChanged(quantityChanged)
                .newQty(newQty)
                .unitPrice(unitPrice)
                .totalAmount(totalAmount)
                .reason(request.getReason())
                .remarks(request.getRemarks())
                .adjustmentDate(
                        request.getAdjustmentDate() != null
                                ? request.getAdjustmentDate()
                                : LocalDate.now()
                )
                .createdAt(LocalDateTime.now())
                .build();

        StockAdjustmentLog savedLog = stockAdjustmentLogRepository.save(adjustmentLog);

        return buildResponse(savedLog);
    }

    public List<StockAdjustmentResponse> getAllStockAdjustments() {
        return stockAdjustmentLogRepository.findAllByOrderByAdjustmentDateDescCreatedAtDesc()
                .stream()
                .map(this::buildResponse)
                .toList();
    }

    private StockAdjustmentResponse buildResponse(StockAdjustmentLog log) {
        return StockAdjustmentResponse.builder()
                .id(log.getId())
                .itemId(log.getItem().getId())
                .itemName(log.getItem().getName())
                .category(log.getItem().getCategory())
                .adjustmentType(log.getAdjustmentType())
                .previousQty(log.getPreviousQty())
                .quantityChanged(log.getQuantityChanged())
                .newQty(log.getNewQty())
                .unitPrice(log.getUnitPrice())
                .totalAmount(log.getTotalAmount())
                .reason(log.getReason())
                .remarks(log.getRemarks())
                .adjustmentDate(log.getAdjustmentDate())
                .createdAt(log.getCreatedAt())
                .build();
    }
}