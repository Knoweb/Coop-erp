package com.coop.erp.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class StockAdjustRequest {

    @NotNull(message = "Item ID is required")
    private UUID itemId;

    @NotNull(message = "Actual quantity is required")
    @Min(value = 0, message = "Actual quantity cannot be negative")
    private Integer actualQuantity;

    @NotBlank(message = "Reason is required")
    private String reason;
}