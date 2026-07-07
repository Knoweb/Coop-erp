package com.coop.erp.inventory.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "item_product", schema = "schema_milk_shop")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemProduct {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(name = "reorder_level", nullable = false)
    private Integer reorderLevel = 10;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "is_active")
    private Boolean isActive = true;
}