package com.coop.erp.accounting.repository;

import com.coop.erp.accounting.entity.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface JournalEntryRepository extends JpaRepository<JournalEntry, UUID> {
    Optional<JournalEntry> findByReferenceTypeAndReferenceId(String referenceType, UUID referenceId);
}
