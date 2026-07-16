package com.coop.erp.admin.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@org.hibernate.annotations.FilterDef(name = "tenantFilter", parameters = @org.hibernate.annotations.ParamDef(name = "tenantId", type = java.util.UUID.class))
@Table(name = "tenants", schema = "admin")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tenant {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "tenant_code", length = 50, nullable = false, unique = true)
    private String tenantCode;

    @Column(name = "tenant_name", length = 150, nullable = false)
    private String tenantName;

    @Column(name = "tenant_type", length = 50, nullable = false)
    private String tenantType; // e.g., COOPFED, DISTRIBUTOR, MPCS, SHOP_GROUP

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

