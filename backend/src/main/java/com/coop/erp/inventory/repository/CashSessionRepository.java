package com.coop.erp.inventory.repository;

import com.coop.erp.inventory.entity.CashSession;
import com.coop.erp.inventory.entity.CashSessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CashSessionRepository extends JpaRepository<CashSession, UUID> {
    
    Optional<CashSession> findTopByTerminalIdAndUserIdAndStatusOrderByOpenedAtDesc(UUID terminalId, UUID userId, CashSessionStatus status);
    
    Optional<CashSession> findTopByTerminalIdAndStatusOrderByOpenedAtDesc(UUID terminalId, CashSessionStatus status);

    @Query("SELECT c FROM CashSession c WHERE c.shop.id = :shopId AND c.sessionDate BETWEEN :fromDate AND :toDate " +
           "AND (:terminalId IS NULL OR c.terminal.id = :terminalId) ORDER BY c.openedAt DESC")
    List<CashSession> findSessionsByShopAndFilters(
            @Param("shopId") UUID shopId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("terminalId") UUID terminalId
    );
    
    List<CashSession> findByOpenedAtBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);
}
