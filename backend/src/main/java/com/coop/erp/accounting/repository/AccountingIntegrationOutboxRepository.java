package com.coop.erp.accounting.repository;

import com.coop.erp.accounting.entity.AccountingIntegrationOutbox;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AccountingIntegrationOutboxRepository extends JpaRepository<AccountingIntegrationOutbox, UUID> {
    List<AccountingIntegrationOutbox> findByStatusAndRetryCountLessThan(AccountingIntegrationOutbox.OutboxStatus status, int maxRetries);
    List<AccountingIntegrationOutbox> findAllByOrderByCreatedAtDesc();
}
