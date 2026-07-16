package com.coop.erp.auth.util;

import jakarta.persistence.EntityManager;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.hibernate.Session;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.UUID;

@Aspect
@Component
public class TenantFilterAspect {

    private final EntityManager entityManager;

    public TenantFilterAspect(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Before("execution(* com.coop.erp..service..*(..)) || execution(* com.coop.erp..controller..*(..))")
    public void enableTenantFilter() {
        // Only run within a web request context (not during startup/seeding)
        if (RequestContextHolder.getRequestAttributes() == null) {
            return;
        }

        UUID tenantId = TenantContext.getCurrentTenantId();

        // If tenantId is available, enable the Hibernate filter
        if (tenantId != null) {
            try {
                Session session = entityManager.unwrap(Session.class);
                session.enableFilter("tenantFilter").setParameter("tenantId", tenantId);
            } catch (Exception e) {
                // Silently ignore if session is not available
            }
        }
        // If tenantId is null, do not enable the filter - queries will still work but cross-tenant
        // This is safe for auth/public endpoints where no tenantId is expected.
    }
}

