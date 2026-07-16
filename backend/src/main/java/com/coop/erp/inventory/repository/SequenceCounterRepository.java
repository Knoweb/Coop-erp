package com.coop.erp.inventory.repository;

import com.coop.erp.inventory.entity.SequenceCounter;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SequenceCounterRepository extends JpaRepository<SequenceCounter, UUID> {
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM SequenceCounter s WHERE s.scope = :scope AND s.sequenceDate = :sequenceDate")
    Optional<SequenceCounter> findByScopeAndSequenceDateForUpdate(String scope, LocalDate sequenceDate);
}
