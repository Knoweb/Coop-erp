package com.coop.erp.dashboard.service;

import com.coop.erp.core.repository.ShopRepository;
import com.coop.erp.core.repository.UserRepository;
import com.coop.erp.dashboard.dto.DashboardSummaryResponse;
import com.coop.erp.inventory.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final ShopRepository shopRepository;
    private final UserRepository userRepository;
    private final SaleRepository saleRepository;

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

        // Calculate Admin Today's Sales
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        
        long todaySalesCount = saleRepository.countBySourceShopIsNullAndSaleDateBetween(startOfDay, endOfDay);
        BigDecimal todaySalesAmount = saleRepository.sumTotalAmountBySourceShopIsNullAndSaleDateBetween(startOfDay, endOfDay);
        
        if (todaySalesAmount == null) {
            todaySalesAmount = BigDecimal.ZERO;
        }

        return DashboardSummaryResponse.builder()
                .totalShops(totalShops)
                .activeShops(activeShops)
                .totalUsers(totalUsers)
                .totalProducts(totalProducts)
                .totalStockQuantity(totalStockQuantity)
                .lowStockItems(lowStockItems)
                .todaySales(todaySalesCount)
                .todayRevenue(todaySalesAmount)
                .todaySalesCount(todaySalesCount)
                .todaySalesAmount(todaySalesAmount)
                .pendingPurchases(pendingPurchases)
                .totalSuppliers(totalSuppliers)
                .totalCustomers(totalCustomers)
                .build();
    }
}
