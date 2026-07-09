package com.coop.erp.settings.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "ui_preferences", 
    schema = "admin",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"scope_type", "scope_id"})
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UiPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "scope_type", length = 20, nullable = false)
    private String scopeType;

    @Column(name = "scope_id", length = 100, nullable = false)
    private String scopeId;

    @Column(name = "default_theme", length = 20, nullable = false)
    @Builder.Default
    private String defaultTheme = "Light";

    @Column(name = "dashboard_refresh_interval_seconds", nullable = false)
    @Builder.Default
    private Integer dashboardRefreshIntervalSeconds = 60;

    @Column(name = "items_per_page", nullable = false)
    @Builder.Default
    private Integer itemsPerPage = 10;

    @Column(name = "enable_system_notifications", nullable = false)
    @Builder.Default
    private Boolean enableSystemNotifications = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;
}
