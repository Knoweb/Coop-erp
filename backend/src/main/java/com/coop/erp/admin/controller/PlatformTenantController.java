package com.coop.erp.admin.controller;

import com.coop.erp.admin.dto.TenantAdminRequest;
import com.coop.erp.admin.entity.Tenant;
import com.coop.erp.admin.repository.TenantRepository;
import com.coop.erp.admin.service.AuditLogService;
import com.coop.erp.core.entity.User;
import com.coop.erp.core.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/platform/tenants")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('PLATFORM_ADMIN')")
public class PlatformTenantController {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @GetMapping
    public List<Tenant> getAllTenants() {
        return tenantRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tenant> getTenantById(@PathVariable UUID id) {
        return tenantRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Tenant createTenant(@Valid @RequestBody Tenant tenant) {
        tenant.setActive(true);
        Tenant savedTenant = tenantRepository.save(tenant);
        auditLogService.logPlatformAction(
            "TENANT_CREATED", 
            "TENANT", 
            savedTenant.getId().toString(), 
            "Created new tenant: " + savedTenant.getTenantName(), 
            null, 
            null
        );
        return savedTenant;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Tenant> updateTenant(@PathVariable UUID id, @Valid @RequestBody Tenant tenantDetails) {
        return tenantRepository.findById(id).map(tenant -> {
            tenant.setTenantCode(tenantDetails.getTenantCode());
            tenant.setTenantName(tenantDetails.getTenantName());
            tenant.setTenantType(tenantDetails.getTenantType());
            tenant.setActive(tenantDetails.isActive());
            Tenant savedTenant = tenantRepository.save(tenant);
            
            auditLogService.logPlatformAction(
                "TENANT_UPDATED", 
                "TENANT", 
                savedTenant.getId().toString(), 
                "Updated tenant details", 
                null, 
                null
            );
            return ResponseEntity.ok(savedTenant);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Tenant> updateTenantStatus(@PathVariable UUID id, @RequestBody Map<String, Boolean> statusUpdate) {
        return tenantRepository.findById(id).map(tenant -> {
            if (statusUpdate.containsKey("isActive")) {
                tenant.setActive(statusUpdate.get("isActive"));
            }
            Tenant savedTenant = tenantRepository.save(tenant);
            auditLogService.logPlatformAction(
                "TENANT_STATUS_CHANGED", 
                "TENANT", 
                savedTenant.getId().toString(), 
                "Updated tenant active status to: " + savedTenant.isActive(), 
                null, 
                null
            );
            return ResponseEntity.ok(savedTenant);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{tenantId}/admins")
    public ResponseEntity<User> createTenantAdmin(@PathVariable UUID tenantId, @Valid @RequestBody TenantAdminRequest request) {
        return tenantRepository.findById(tenantId).map(tenant -> {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new IllegalArgumentException("Username already exists");
            }
            
            User admin = User.builder()
                    .name(request.getName())
                    .username(request.getUsername())
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .role("TENANT_ADMIN")
                    .shop(null)
                    .tenant(tenant)
                    .build();
            
            User savedAdmin = userRepository.save(admin);
            auditLogService.logPlatformAction(
                "TENANT_ADMIN_CREATED", 
                "USER", 
                savedAdmin.getId().toString(), 
                "Created tenant admin: " + savedAdmin.getUsername() + " for tenant: " + tenant.getTenantName(), 
                null, 
                null
            );
            
            return ResponseEntity.ok(savedAdmin);
        }).orElse(ResponseEntity.notFound().build());
    }
}
