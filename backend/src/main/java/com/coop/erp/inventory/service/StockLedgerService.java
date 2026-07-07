package com.coop.erp.inventory.service;

import com.coop.erp.inventory.dto.StockReduceRequest;
import com.coop.erp.inventory.dto.StockReduceResponse;
import com.coop.erp.inventory.entity.StockLedger;
import com.coop.erp.inventory.repository.StockLedgerRepository;
import com.coop.erp.inventory.dto.StockAdjustRequest;
import com.coop.erp.inventory.dto.StockAdjustResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StockLedgerService {

    private final StockLedgerRepository stockLedgerRepository;

    public List<StockLedger> getAllStock() {
        return stockLedgerRepository.findAll();
    }

    public List<StockLedger> getLowStockItems() {
        return stockLedgerRepository.findLowStockItems();
    }

    public List<StockLedger> getOutOfStockItems() {
        return stockLedgerRepository.findOutOfStockItems();
    }

    public StockReduceResponse reduceStock(StockReduceRequest request) {
        StockLedger stockLedger = stockLedgerRepository.findByItemId(request.getItemId())
                .orElseThrow(() -> new RuntimeException("Stock record not found for selected item"));

        Integer previousQuantity = stockLedger.getCurrentQty();

        if (request.getQuantity() > previousQuantity) {
            throw new RuntimeException("Cannot reduce more than available stock");
        }

        Integer newQuantity = previousQuantity - request.getQuantity();

        stockLedger.setCurrentQty(newQuantity);
        stockLedger.setLastUpdated(LocalDateTime.now());

        StockLedger saved = stockLedgerRepository.save(stockLedger);

        return StockReduceResponse.builder()
                .itemId(saved.getItem().getId())
                .itemName(saved.getItem().getName())
                .reducedQuantity(request.getQuantity())
                .previousQuantity(previousQuantity)
                .currentQuantity(saved.getCurrentQty())
                .reason(request.getReason())
                .lastUpdated(saved.getLastUpdated())
                .message("Stock reduced successfully")
                .build();
    }

    public StockAdjustResponse adjustStockToActualQuantity(StockAdjustRequest request) {
        StockLedger stockLedger = stockLedgerRepository.findByItemId(request.getItemId())
                .orElseThrow(() -> new RuntimeException("Stock record not found for selected item"));

        Integer previousQuantity = stockLedger.getCurrentQty();
        Integer actualQuantity = request.getActualQuantity();
        Integer difference = actualQuantity - previousQuantity;

        stockLedger.setCurrentQty(actualQuantity);
        stockLedger.setLastUpdated(LocalDateTime.now());

        StockLedger saved = stockLedgerRepository.save(stockLedger);

        return StockAdjustResponse.builder()
                .itemId(saved.getItem().getId())
                .itemName(saved.getItem().getName())
                .previousQuantity(previousQuantity)
                .actualQuantity(saved.getCurrentQty())
                .difference(difference)
                .reason(request.getReason())
                .lastUpdated(saved.getLastUpdated())
                .message("Stock adjusted successfully")
                .build();
    }
}