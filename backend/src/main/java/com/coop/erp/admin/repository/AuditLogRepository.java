package com.coop.erp.admin.repository;

import com.coop.erp.admin.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    List<AuditLog> findAllByOrderByCreatedAtDesc(); // Always fetch newest first
}