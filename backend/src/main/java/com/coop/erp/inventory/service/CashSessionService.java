package com.coop.erp.inventory.service;

import com.coop.erp.admin.entity.ShopTerminal;
import com.coop.erp.core.entity.User;
import com.coop.erp.admin.repository.ShopTerminalRepository;
import com.coop.erp.core.repository.UserRepository;
import com.coop.erp.core.entity.Shop;
import com.coop.erp.core.repository.ShopRepository;
import com.coop.erp.inventory.entity.CashSession;
import com.coop.erp.inventory.entity.CashSessionStatus;
import com.coop.erp.inventory.repository.CashSessionRepository;
import com.coop.erp.admin.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CashSessionService {

    private final CashSessionRepository cashSessionRepository;
    private final ShopRepository shopRepository;
    private final ShopTerminalRepository shopTerminalRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public Optional<CashSession> getCurrentOpenSession(UUID terminalId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return cashSessionRepository.findTopByTerminalIdAndUserIdAndStatusOrderByOpenedAtDesc(terminalId, user.getId(), CashSessionStatus.OPEN);
    }

    @Transactional
    public CashSession openSession(UUID shopId, UUID terminalId, String username, BigDecimal openingCash) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new IllegalArgumentException("Shop not found"));

        ShopTerminal terminal = shopTerminalRepository.findById(terminalId)
                .orElseThrow(() -> new IllegalArgumentException("Terminal not found"));

        // Check if there's already an open session for this terminal
        Optional<CashSession> existingOpen = cashSessionRepository.findTopByTerminalIdAndStatusOrderByOpenedAtDesc(terminalId, CashSessionStatus.OPEN);
        if (existingOpen.isPresent()) {
            throw new IllegalStateException("Terminal already has an open cash session. Close it before opening a new one.");
        }

        CashSession session = CashSession.builder()
                .shop(shop)
                .terminal(terminal)
                .user(user)
                .sessionDate(LocalDate.now())
                .openedAt(LocalDateTime.now())
                .openingCash(openingCash != null ? openingCash : BigDecimal.ZERO)
                .expectedCash(openingCash != null ? openingCash : BigDecimal.ZERO)
                .status(CashSessionStatus.OPEN)
                .build();

        CashSession savedSession = cashSessionRepository.save(session);
        auditLogService.logShopAction(
                shop.getId(),
                terminal.getId(),
                "CASH_SESSION_OPENED",
                "CASH_SESSION",
                savedSession.getId().toString(),
                "Opened cash session on terminal " + terminal.getTerminalCode() + " by " + user.getUsername(),
                null,
                String.format("{\"openingCash\": %s}", openingCash)
        );
        return savedSession;
    }

    @Transactional
    public CashSession closeSession(UUID sessionId, BigDecimal actualCash, String notes, String username) {
        CashSession session = cashSessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Cash Session not found"));

        if (session.getStatus() == CashSessionStatus.CLOSED) {
            throw new IllegalStateException("Session is already closed.");
        }
        
        if (!session.getUser().getUsername().equals(username)) {
            // Depending on policy, maybe Shop Admin can close someone else's session, but typically they shouldn't.
            // For now, allow it but log it in notes.
            notes = (notes == null ? "" : notes) + " (Closed by " + username + ")";
        }

        session.setActualCash(actualCash != null ? actualCash : BigDecimal.ZERO);
        session.setDifference(session.getActualCash().subtract(session.getExpectedCash()));
        session.setClosedAt(LocalDateTime.now());
        session.setStatus(CashSessionStatus.CLOSED);
        session.setNotes(notes);

        CashSession savedSession = cashSessionRepository.save(session);
        auditLogService.logShopAction(
                savedSession.getShop().getId(),
                savedSession.getTerminal().getId(),
                "CASH_SESSION_CLOSED",
                "CASH_SESSION",
                savedSession.getId().toString(),
                "Closed cash session on terminal " + savedSession.getTerminal().getTerminalCode() + " by " + username,
                String.format("{\"expectedCash\": %s}", savedSession.getExpectedCash()),
                String.format("{\"actualCash\": %s, \"difference\": %s}", savedSession.getActualCash(), savedSession.getDifference())
        );
        return savedSession;
    }

    @Transactional(readOnly = true)
    public List<CashSession> getSessionsByShop(UUID shopId, LocalDate fromDate, LocalDate toDate, UUID terminalId) {
        if (fromDate == null) fromDate = LocalDate.now().minusDays(7);
        if (toDate == null) toDate = LocalDate.now();
        return cashSessionRepository.findSessionsByShopAndFilters(shopId, fromDate, toDate, terminalId);
    }

    public CashSession getSessionById(UUID id) {
        return cashSessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cash session not found"));
    }
}
