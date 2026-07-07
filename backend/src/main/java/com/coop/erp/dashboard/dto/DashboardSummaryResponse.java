package com.coop.erp.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {

    // Common fields
    private long totalProducts;
    private long totalStockQuantity;
    private long lowStockItems;
    private long todaySales;
    private BigDecimal todayRevenue;
    private long pendingPurchases;
    private long totalSuppliers;
    private long totalUsers;

    // Admin specific
    private Long totalShops;
    private Long activeShops;
    private Long totalCustomers;

    // Shop specific
    private UUID shopId;
    private String shopCode;
    private String shopName;
}
