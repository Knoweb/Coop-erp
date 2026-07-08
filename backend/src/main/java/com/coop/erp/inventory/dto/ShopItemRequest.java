package com.coop.erp.inventory.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class ShopItemRequest {
    @NotNull(message = "Item ID is required")
    private UUID itemId;
}
