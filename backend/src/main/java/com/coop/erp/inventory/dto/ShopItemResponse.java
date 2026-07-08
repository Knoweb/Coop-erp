package com.coop.erp.inventory.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@Builder
public class ShopItemResponse {
    private UUID itemId;
    private String name;
    private String category;
    private BigDecimal unitPrice;
    
    // Global active status
    private Boolean isGlobalActive;
    
    // Shop specific fields
    private Boolean isSelected;
    private UUID shopItemId;
    private Integer shopReorderLevel;
}
