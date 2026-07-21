package com.coop.erp.accounting.service;

import com.coop.erp.accounting.entity.AccountingIntegrationOutbox;
import com.coop.erp.accounting.repository.AccountingIntegrationOutboxRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountingOutboxService {

    private final AccountingIntegrationOutboxRepository outboxRepository;
    private final ObjectMapper objectMapper;

    public void queuePosting(
            UUID tenantId,
            UUID shopId,
            String referenceType,
            UUID referenceId,
            String companyCode,
            LocalDate postingDate,
            String description,
            List<PostingLine> lines) {

        try {
            Map<String, Object> payloadMap = Map.of(
                    "sourceSystem", "COOP",
                    "referenceType", referenceType,
                    "referenceId", referenceId.toString(),
                    "companyCode", companyCode,
                    "postingDate", postingDate.toString(),
                    "description", description,
                    "lines", lines
            );

            String jsonPayload = objectMapper.writeValueAsString(payloadMap);

            AccountingIntegrationOutbox outbox = AccountingIntegrationOutbox.builder()
                    .tenantId(tenantId)
                    .shopId(shopId)
                    .referenceType(referenceType)
                    .referenceId(referenceId.toString())
                    .payload(jsonPayload)
                    .status(AccountingIntegrationOutbox.OutboxStatus.PENDING)
                    .retryCount(0)
                    .build();

            outboxRepository.save(outbox);
            log.info("Queued accounting posting to outbox for {} {}", referenceType, referenceId);
        } catch (Exception e) {
            log.error("Failed to queue accounting posting", e);
        }
    }

    public record PostingLine(String accountCode, BigDecimal debit, BigDecimal credit, String narration) {}
}
