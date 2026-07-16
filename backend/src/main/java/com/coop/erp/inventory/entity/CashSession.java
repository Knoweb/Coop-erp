package com.coop.erp.inventory.entity;

import com.coop.erp.admin.entity.ShopTerminal;
import com.coop.erp.core.entity.User;
import com.coop.erp.core.entity.Shop;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "cash_sessions", schema = "grocery")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CashSession {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "shop_id", nullable = false)
    private Shop shop;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "terminal_id", nullable = false)
    private ShopTerminal terminal;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "session_date", nullable = false)
    private LocalDate sessionDate;

    @Column(name = "opened_at", nullable = false)
    private LocalDateTime openedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Column(name = "opening_cash", nullable = false, precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal openingCash = BigDecimal.ZERO;

    @Column(name = "expected_cash", nullable = false, precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal expectedCash = BigDecimal.ZERO;

    @Column(name = "actual_cash", precision = 14, scale = 2)
    private BigDecimal actualCash;

    @Column(name = "cash_sales_total", nullable = false, precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal cashSalesTotal = BigDecimal.ZERO;

    @Column(name = "card_sales_total", nullable = false, precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal cardSalesTotal = BigDecimal.ZERO;

    @Column(name = "credit_sales_total", nullable = false, precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal creditSalesTotal = BigDecimal.ZERO;

    @Column(name = "total_sales", nullable = false, precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal totalSales = BigDecimal.ZERO;

    @Column(name = "difference", nullable = false, precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal difference = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private CashSessionStatus status = CashSessionStatus.OPEN;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.openedAt == null) {
            this.openedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
