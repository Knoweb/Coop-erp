package com.coop.erp.admin.repository;

import com.coop.erp.admin.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID>, JpaSpecificationExecutor<AuditLog> {
    List<AuditLog> findAllByOrderByCreatedAtDesc();
    Page<AuditLog> findByTenantId(UUID tenantId, Pageable pageable);
    List<AuditLog> findByTenantIdAndCreatedAtBetweenOrderByCreatedAtDesc(UUID tenantId, java.time.LocalDateTime start, java.time.LocalDateTime end);
}