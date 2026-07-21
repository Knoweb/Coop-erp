package com.coop.erp.accounting.service;

import com.coop.erp.accounting.client.GinumAccountingClient;
import com.coop.erp.accounting.entity.AccountingIntegrationOutbox;
import com.coop.erp.accounting.repository.AccountingIntegrationOutboxRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountingIntegrationService {

    private final AccountingIntegrationOutboxRepository outboxRepository;
    private final GinumAccountingClient ginumClient;

    @Scheduled(fixedDelay = 60000) // Run every 60 seconds
    @Transactional
    public void processOutbox() {
        List<AccountingIntegrationOutbox> pendingRecords = outboxRepository.findByStatusAndRetryCountLessThan(
                AccountingIntegrationOutbox.OutboxStatus.PENDING, 5
        );

        for (AccountingIntegrationOutbox record : pendingRecords) {
            try {
                record.setStatus(AccountingIntegrationOutbox.OutboxStatus.PROCESSING);
                outboxRepository.saveAndFlush(record);

                ginumClient.postToGinum(record.getPayload());

                record.setStatus(AccountingIntegrationOutbox.OutboxStatus.COMPLETED);
                record.setProcessedAt(LocalDateTime.now());
                record.setErrorMessage(null);
            } catch (Exception e) {
                log.error("Failed to process outbox record: {}", record.getId(), e);
                record.setStatus(AccountingIntegrationOutbox.OutboxStatus.FAILED);
                record.setErrorMessage(e.getMessage());
                record.setRetryCount(record.getRetryCount() + 1);
            }
            outboxRepository.save(record);
        }
        
        // Also retry failed ones
        List<AccountingIntegrationOutbox> failedRecords = outboxRepository.findByStatusAndRetryCountLessThan(
                AccountingIntegrationOutbox.OutboxStatus.FAILED, 5
        );
        for (AccountingIntegrationOutbox record : failedRecords) {
            try {
                record.setStatus(AccountingIntegrationOutbox.OutboxStatus.PROCESSING);
                outboxRepository.saveAndFlush(record);

                ginumClient.postToGinum(record.getPayload());

                record.setStatus(AccountingIntegrationOutbox.OutboxStatus.COMPLETED);
                record.setProcessedAt(LocalDateTime.now());
                record.setErrorMessage(null);
            } catch (Exception e) {
                log.error("Failed to retry outbox record: {}", record.getId(), e);
                record.setStatus(AccountingIntegrationOutbox.OutboxStatus.FAILED);
                record.setErrorMessage(e.getMessage());
                record.setRetryCount(record.getRetryCount() + 1);
            }
            outboxRepository.save(record);
        }
    }
}
