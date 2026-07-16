package com.coop.erp.admin.entity;

import com.coop.erp.core.entity.Shop;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "shop_terminals", schema = "admin", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"shop_id", "terminal_code"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopTerminal {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "shop_id", nullable = false)
    private Shop shop;

    @Column(name = "terminal_code", nullable = false, length = 50)
    private String terminalCode;

    @Column(name = "terminal_name", length = 100)
    private String terminalName;

    @Column(name = "device_identifier", length = 150)
    private String deviceIdentifier;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
