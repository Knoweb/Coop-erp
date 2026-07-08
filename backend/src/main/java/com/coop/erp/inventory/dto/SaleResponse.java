package com.coop.erp.inventory.dto;

import com.coop.erp.inventory.entity.SaleType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class SaleResponse {
    private UUID id;
    private String saleNumber;
    private SaleType saleType;
    private String targetShopName;
    private BigDecimal subtotal;
    private BigDecimal totalDiscount;
    private BigDecimal totalAmount;
    private String notes;
    private LocalDateTime saleDate;
    private String createdBy;
    private String sourceName;
    private String status;
    private Integer itemsCount;
    private Integer totalQuantity;
    private List<SaleItemResponse> items;

    @Data
    @Builder
    public static class SaleItemResponse {
        private UUID productId;
        private String productCode;
        private String productName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal discountPercentage;
        private BigDecimal discountAmount;
        private BigDecimal lineTotal;
    }
}
