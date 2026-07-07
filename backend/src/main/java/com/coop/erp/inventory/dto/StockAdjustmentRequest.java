package com.coop.erp.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class StockAdjustmentRequest {

    @NotNull(message = "Item ID is required")
    private UUID itemId;

    @NotBlank(message = "Adjustment type is required")
    private String adjustmentType;

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantity;

    private String reason;

    private String remarks;

    private LocalDate adjustmentDate;
}