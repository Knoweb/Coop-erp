package com.coop.erp.accounting.repository;

import com.coop.erp.accounting.entity.JournalEntryLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface JournalEntryLineRepository extends JpaRepository<JournalEntryLine, UUID> {

    @Query("SELECT l FROM JournalEntryLine l WHERE l.journalEntry.entryDate >= :fromDate AND l.journalEntry.entryDate <= :toDate")
    List<JournalEntryLine> findByDateBetween(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);

    @Query("SELECT l FROM JournalEntryLine l WHERE l.journalEntry.entryDate <= :asOfDate")
    List<JournalEntryLine> findByDateBeforeOrEqual(@Param("asOfDate") LocalDate asOfDate);

    @Query("SELECT l FROM JournalEntryLine l WHERE l.journalEntry.entryDate >= :fromDate AND l.journalEntry.entryDate <= :toDate AND l.account.accountCode = :accountCode")
    List<JournalEntryLine> findByDateBetweenAndAccountCode(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate, @Param("accountCode") String accountCode);

    @Query("SELECT l FROM JournalEntryLine l WHERE l.journalEntry.entryDate <= :asOfDate AND l.account.accountCode = :accountCode")
    List<JournalEntryLine> findByDateBeforeOrEqualAndAccountCode(@Param("asOfDate") LocalDate asOfDate, @Param("accountCode") String accountCode);
}
