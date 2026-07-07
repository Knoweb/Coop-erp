package com.coop.erp.inventory.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "stock_ledger", schema = "schema_milk_shop")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockLedger {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "item_id", nullable = false)
    private ItemProduct item;

    @Column(name = "current_qty", nullable = false)
    private Integer currentQty = 0;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;
}