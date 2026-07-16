package com.coop.erp.inventory.dto;

import com.coop.erp.inventory.entity.SaleType;
import com.coop.erp.inventory.entity.PaymentMethod;
import com.coop.erp.inventory.entity.PaymentStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class SaleRequest {
    private SaleType saleType; // CUSTOMER or SHOP
    private UUID targetShopId;
    private String notes;
    private UUID terminalId;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private BigDecimal paidAmount;
    private List<SaleItemRequest> items;

    @Data
    public static class SaleItemRequest {
        private UUID productId;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal discountPercentage;
    }
}
