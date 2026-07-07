package com.coop.erp.dashboard.service;

import com.coop.erp.core.repository.ShopRepository;
import com.coop.erp.core.repository.UserRepository;
import com.coop.erp.dashboard.dto.DashboardSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final ShopRepository shopRepository;
    private final UserRepository userRepository;

    public DashboardSummaryResponse getSummary() {
        long totalShops = shopRepository.count();
        long activeShops = shopRepository.countByActiveTrue();
        long totalUsers = userRepository.count();

        // TODO: Implement actual queries for these once the tables/entities are created
        long totalProducts = 0;
        long totalStockQuantity = 0;
        long lowStockItems = 0;
        long todaySales = 0;
        BigDecimal todayRevenue = BigDecimal.ZERO;
        long pendingPurchases = 0;
        long totalSuppliers = 0;
        long totalCustomers = 0;

        return DashboardSummaryResponse.builder()
                .totalShops(totalShops)
                .activeShops(activeShops)
                .totalUsers(totalUsers)
                .totalProducts(totalProducts)
                .totalStockQuantity(totalStockQuantity)
                .lowStockItems(lowStockItems)
                .todaySales(todaySales)
                .todayRevenue(todayRevenue)
                .pendingPurchases(pendingPurchases)
                .totalSuppliers(totalSuppliers)
                .totalCustomers(totalCustomers)
                .build();
    }
}
