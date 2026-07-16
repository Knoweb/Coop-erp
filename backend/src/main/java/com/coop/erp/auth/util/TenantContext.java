package com.coop.erp.auth.util;

import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;
import java.util.UUID;

public class TenantContext {

    public static UUID getCurrentTenantId() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            String tenantIdStr = (String) request.getAttribute("tenantId");
            if (tenantIdStr != null && !tenantIdStr.isEmpty()) {
                return UUID.fromString(tenantIdStr);
            }
        }
        return null;
    }

    public static String getCurrentTenantCode() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            return (String) request.getAttribute("tenantCode");
        }
        return null;
    }
}

