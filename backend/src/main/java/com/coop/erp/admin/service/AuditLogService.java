package com.coop.erp.admin.service;

import com.coop.erp.admin.entity.AuditLog;
import com.coop.erp.admin.entity.Tenant;
import com.coop.erp.admin.repository.AuditLogRepository;
import com.coop.erp.admin.repository.TenantRepository;
import com.coop.erp.auth.util.TenantContext;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final TenantRepository tenantRepository;

    public void logPlatformAction(String action, String entityType, String entityId, String description, String oldValue, String newValue) {
        logAction(null, null, null, action, entityType, entityId, description, oldValue, newValue);
    }

    public void logTenantAction(String action, String entityType, String entityId, String description, String oldValue, String newValue) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        logAction(tenantId, null, null, action, entityType, entityId, description, oldValue, newValue);
    }

    public void logShopAction(UUID shopId, UUID terminalId, String action, String entityType, String entityId, String description, String oldValue, String newValue) {
        UUID tenantId = TenantContext.getCurrentTenantId();
        logAction(tenantId, shopId, terminalId, action, entityType, entityId, description, oldValue, newValue);
    }

    private void logAction(UUID tenantId, UUID shopId, UUID terminalId, String action, String entityType, String entityId, String description, String oldValue, String newValue) {
        try {
            AuditLog auditLog = new AuditLog();
            
            if (tenantId != null) {
                Tenant tenant = tenantRepository.findById(tenantId).orElse(null);
                auditLog.setTenant(tenant);
            }
            
            auditLog.setShopId(shopId);
            auditLog.setTerminalId(terminalId);
            auditLog.setAction(action);
            auditLog.setEntityType(entityType);
            auditLog.setEntityId(entityId);
            auditLog.setDescription(description);
            auditLog.setOldValue(oldValue);
            auditLog.setNewValue(newValue);

            // Capture User Details
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null && !auth.getName().equals("anonymousUser")) {
                auditLog.setUsername(auth.getName());
                // We could fetch user from DB to get ID and Role if needed, or rely on JWT claims.
                // For now, setting username is sufficient for audit logs.
            }

            // Capture Request IP and User Agent
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                auditLog.setIpAddress(getClientIp(request));
                auditLog.setUserAgent(request.getHeader("User-Agent"));
            }

            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.warn("Failed to write audit log for action: {}. Error: {}", action, e.getMessage());
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
