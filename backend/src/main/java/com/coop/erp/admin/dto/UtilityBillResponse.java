package com.coop.erp.admin.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record UtilityBillResponse(
        UUID id,
        String utilityType,
        String billingMonth,
        BigDecimal totalAmount,
        BigDecimal mainShopRatio,
        BigDecimal subShopRatio,
        BigDecimal milkShopAllocatedAmount, // Calculated dynamically
        BigDecimal roomSectionAllocatedAmount, // Calculated dynamically
        UUID recordedBy,
        LocalDateTime createdAt
) {}
