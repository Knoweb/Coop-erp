package com.coop.erp.accounting.controller;

import com.coop.erp.accounting.entity.AccountingIntegrationOutbox;
import com.coop.erp.accounting.repository.AccountingIntegrationOutboxRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/admin/accounting-integration")
@RequiredArgsConstructor
@Slf4j
public class AccountingIntegrationController {

    private final AccountingIntegrationOutboxRepository outboxRepository;

    @PostConstruct
    public void init() {
        log.info("AccountingIntegrationController registered and mapped to /api/v1/admin/accounting-integration");
    }

    @GetMapping("/outbox")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'TENANT_ADMIN')")
    public ResponseEntity<List<AccountingIntegrationOutbox>> getOutboxLogs() {
        return ResponseEntity.ok(outboxRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/outbox/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'TENANT_ADMIN')")
    public ResponseEntity<AccountingIntegrationOutbox> getOutboxLog(@PathVariable UUID id) {
        return outboxRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/postings/{id}/retry")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'TENANT_ADMIN')")
    public ResponseEntity<Void> retryPosting(@PathVariable UUID id) {
        return outboxRepository.findById(id).map(outbox -> {
            outbox.setStatus(AccountingIntegrationOutbox.OutboxStatus.PENDING);
            outbox.setRetryCount(0);
            outbox.setErrorMessage(null);
            outboxRepository.save(outbox);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
