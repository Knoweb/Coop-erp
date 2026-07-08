package com.coop.erp.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShopProductCountDto {
    private UUID shopId;
    private String shopName;
    private Long selectedProductCount;
}
