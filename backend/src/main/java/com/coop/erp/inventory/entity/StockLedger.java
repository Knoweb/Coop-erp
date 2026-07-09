package com.coop.erp.inventory.entity;

import jakarta.persistence.*;
import lombok.*;
import com.coop.erp.core.entity.Shop;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "stock_ledger", schema = "grocery")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockLedger {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private ItemProduct item;

    @ManyToOne
    @JoinColumn(name = "shop_id")
    private com.coop.erp.core.entity.Shop shop;

    @Column(name = "current_qty", nullable = false)
    @Builder.Default
    private Integer currentQty = 0;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;
}
