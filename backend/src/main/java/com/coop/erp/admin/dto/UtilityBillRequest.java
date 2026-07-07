package com.coop.erp.admin.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.UUID;

public record UtilityBillRequest(
        @NotBlank(message = "Utility type is required")
        String utilityType,

        @Pattern(regexp = "^\\d{4}-\\d{2}$", message = "Billing month must be in YYYY-MM format")
        String billingMonth,

        @NotNull(message = "Total amount is required")
        @DecimalMin(value = "0.01", message = "Total amount must be greater than 0")
        BigDecimal totalAmount,

        @NotNull(message = "Milk shop ratio is required")
        @DecimalMin(value = "0.00") @DecimalMax(value = "1.00")
        BigDecimal milkShopRatio,

        @NotNull(message = "Room section ratio is required")
        @DecimalMin(value = "0.00") @DecimalMax(value = "1.00")
        BigDecimal roomSectionRatio,

        @NotNull(message = "Recorded by user ID is required")
        UUID recordedBy
) {}