package com.coop.erp.inventory.service;

import com.coop.erp.inventory.dto.StockReduceRequest;
import com.coop.erp.inventory.dto.StockReduceResponse;
import com.coop.erp.inventory.entity.StockLedger;
import com.coop.erp.inventory.repository.StockLedgerRepository;
import com.coop.erp.inventory.dto.StockAdjustRequest;
import com.coop.erp.inventory.dto.StockAdjustResponse;
import com.coop.erp.core.entity.Shop;
import com.coop.erp.core.entity.User;
import com.coop.erp.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StockLedgerService {

    private final StockLedgerRepository stockLedgerRepository;
    private final UserRepository userRepository;

    private Shop getCurrentUserShopOrNull() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getShop();
    }

    private Shop getCurrentUserShop() {
        Shop shop = getCurrentUserShopOrNull();
        if (shop == null) {
            throw new RuntimeException("User is not assigned to any shop");
        }
        return shop;
    }

    public List<StockLedger> getAllStock(java.util.UUID shopId) {
        if (shopId != null) {
            return stockLedgerRepository.findByShopId(shopId);
        }
        return stockLedgerRepository.findByShopIsNull();
    }

    public List<StockLedger> getLowStockItems(java.util.UUID shopId) {
        return stockLedgerRepository.findLowStockItems(shopId);
    }

    public List<StockLedger> getOutOfStockItems(java.util.UUID shopId) {
        return stockLedgerRepository.findOutOfStockItems(shopId);
    }

    public StockReduceResponse reduceStock(StockReduceRequest request, java.util.UUID shopId) {
        StockLedger stockLedger = stockLedgerRepository.findByItemIdAndShopId(request.getItemId(), shopId)
                .orElseGet(() -> {
                    if (shopId == null) {
                        return stockLedgerRepository.findByItemIdAndShopIsNull(request.getItemId())
                                .orElseThrow(() -> new RuntimeException("Stock record not found for selected item"));
                    }
                    throw new RuntimeException("Stock record not found for selected item");
                });

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

    public StockAdjustResponse adjustStockToActualQuantity(StockAdjustRequest request, java.util.UUID shopId) {
        StockLedger stockLedger = stockLedgerRepository.findByItemIdAndShopId(request.getItemId(), shopId)
                .orElseGet(() -> {
                    if (shopId == null) {
                        return stockLedgerRepository.findByItemIdAndShopIsNull(request.getItemId())
                                .orElseThrow(() -> new RuntimeException("Stock record not found for selected item"));
                    }
                    throw new RuntimeException("Stock record not found for selected item");
                });

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