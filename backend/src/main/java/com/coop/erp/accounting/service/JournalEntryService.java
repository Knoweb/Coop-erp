package com.coop.erp.accounting.service;

import com.coop.erp.accounting.entity.ChartOfAccount;
import com.coop.erp.accounting.entity.JournalEntry;
import com.coop.erp.accounting.entity.JournalEntryLine;
import com.coop.erp.accounting.entity.JournalEntryStatus;
import com.coop.erp.accounting.repository.ChartOfAccountRepository;
import com.coop.erp.accounting.repository.JournalEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JournalEntryService {

    private final JournalEntryRepository journalEntryRepository;
    private final ChartOfAccountRepository chartOfAccountRepository;

    @Transactional
    public JournalEntry postEntry(String referenceType, UUID referenceId, LocalDate entryDate, String description, String createdBy, List<JournalLineRequest> lineRequests) {
        // Idempotency check
        if (referenceType != null && referenceId != null) {
            journalEntryRepository.findByReferenceTypeAndReferenceId(referenceType, referenceId)
                    .ifPresent(existing -> {
                        throw new IllegalArgumentException("Journal entry already exists for " + referenceType + " ID: " + referenceId);
                    });
        }

        BigDecimal totalDebit = BigDecimal.ZERO;
        BigDecimal totalCredit = BigDecimal.ZERO;

        JournalEntry entry = JournalEntry.builder()
                .entryNumber("JE-" + System.currentTimeMillis())
                .entryDate(entryDate != null ? entryDate : LocalDate.now())
                .referenceType(referenceType)
                .referenceId(referenceId)
                .description(description)
                .status(JournalEntryStatus.POSTED)
                .createdBy(createdBy)
                .createdAt(LocalDateTime.now())
                .build();

        for (JournalLineRequest req : lineRequests) {
            ChartOfAccount account = chartOfAccountRepository.findByAccountCode(req.getAccountCode())
                    .orElseThrow(() -> new IllegalArgumentException("Account not found: " + req.getAccountCode()));

            BigDecimal debit = req.getDebit() != null ? req.getDebit() : BigDecimal.ZERO;
            BigDecimal credit = req.getCredit() != null ? req.getCredit() : BigDecimal.ZERO;

            if (debit.compareTo(BigDecimal.ZERO) < 0 || credit.compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("Debit and credit must be non-negative.");
            }

            if (debit.compareTo(BigDecimal.ZERO) > 0 && credit.compareTo(BigDecimal.ZERO) > 0) {
                throw new IllegalArgumentException("A line cannot have both debit and credit greater than zero.");
            }

            totalDebit = totalDebit.add(debit);
            totalCredit = totalCredit.add(credit);

            JournalEntryLine line = JournalEntryLine.builder()
                    .journalEntry(entry)
                    .account(account)
                    .description(req.getDescription() != null ? req.getDescription() : description)
                    .debit(debit)
                    .credit(credit)
                    .build();

            entry.getLines().add(line);
        }

        if (totalDebit.compareTo(totalCredit) != 0) {
            throw new IllegalArgumentException("Journal entry does not balance. Total Debit: " + totalDebit + ", Total Credit: " + totalCredit);
        }

        if (totalDebit.compareTo(BigDecimal.ZERO) == 0) {
            // Ignore zero-value entries instead of throwing error if business rule allows, or throw.
            // Returning null or throwing exception is an option. For safety, let's just return to skip creation of 0$ entries
            return null;
        }

        return journalEntryRepository.save(entry);
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    public static class JournalLineRequest {
        private String accountCode;
        private String description;
        private BigDecimal debit;
        private BigDecimal credit;
    }
}
