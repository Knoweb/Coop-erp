package com.coop.erp.dashboard.service;

import com.coop.erp.core.entity.Shop;
import com.coop.erp.core.repository.ShopRepository;
import com.coop.erp.core.repository.UserRepository;
import com.coop.erp.dashboard.dto.DashboardSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShopDashboardService {

    private final UserRepository userRepository;
    private final ShopRepository shopRepository;

    public DashboardSummaryResponse getSummary(String shopIdStr) {
        UUID shopId = UUID.fromString(shopIdStr);
        Shop shop = shopRepository.findById(shopId).orElseThrow(() -> new RuntimeException("Shop not found"));

        long totalUsers = userRepository.countByShopId(shopId);

        // TODO: Implement actual queries for these scoped to the shopId once the tables/entities are created
        long totalProducts = 0;
        long totalStockQuantity = 0;
        long lowStockItems = 0;
        long todaySales = 0;
        BigDecimal todayRevenue = BigDecimal.ZERO;
        long pendingPurchases = 0;
        long totalSuppliers = 0;

        return DashboardSummaryResponse.builder()
                .shopId(shop.getId())
                .shopCode(shop.getCode())
                .shopName(shop.getName())
                .totalUsers(totalUsers)
                .totalProducts(totalProducts)
                .totalStockQuantity(totalStockQuantity)
                .lowStockItems(lowStockItems)
                .todaySales(todaySales)
                .todayRevenue(todayRevenue)
                .pendingPurchases(pendingPurchases)
                .totalSuppliers(totalSuppliers)
                .build();
    }
}
