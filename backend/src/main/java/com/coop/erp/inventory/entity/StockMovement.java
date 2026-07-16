package com.coop.erp.inventory.entity;

import com.coop.erp.core.entity.Shop;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "stock_movements", schema = "grocery")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockMovement {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "item_id", nullable = false)
    private ItemProduct item;

    @ManyToOne
    @JoinColumn(name = "shop_id")
    private Shop shop;

    @Column(name = "movement_type", nullable = false, length = 50)
    private String movementType;

    @Column(name = "reference_type", length = 50)
    private String referenceType;

    @Column(name = "reference_id")
    private UUID referenceId;

    @Column(name = "quantity_in", nullable = false)
    @Builder.Default
    private Integer quantityIn = 0;

    @Column(name = "quantity_out", nullable = false)
    @Builder.Default
    private Integer quantityOut = 0;

    @Column(name = "balance_after", nullable = false)
    private Integer balanceAfter;

    @Column(name = "unit_price", precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @CreationTimestamp
    @Column(name = "movement_date", nullable = false, updatable = false)
    private LocalDateTime movementDate;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "terminal_id")
    private UUID terminalId;
}
