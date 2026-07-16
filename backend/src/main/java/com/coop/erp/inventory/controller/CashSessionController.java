package com.coop.erp.inventory.controller;

import com.coop.erp.inventory.entity.CashSession;
import com.coop.erp.inventory.service.CashSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/shop/cash-session")
@RequiredArgsConstructor
public class CashSessionController {

    private final CashSessionService cashSessionService;

    @GetMapping("/current")
    public ResponseEntity<CashSession> getCurrentOpenSession(
            @RequestParam UUID terminalId,
            Authentication authentication) {
        
        Optional<CashSession> session = cashSessionService.getCurrentOpenSession(terminalId, authentication.getName());
        return session.map(ResponseEntity::ok).orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/open")
    public ResponseEntity<CashSession> openSession(
            @RequestBody Map<String, Object> payload,
            Authentication authentication) {
        
        UUID shopId = UUID.fromString((String) payload.get("shopId"));
        UUID terminalId = UUID.fromString((String) payload.get("terminalId"));
        BigDecimal openingCash = new BigDecimal(payload.get("openingCash").toString());

        CashSession session = cashSessionService.openSession(shopId, terminalId, authentication.getName(), openingCash);
        return ResponseEntity.ok(session);
    }

    @PostMapping("/close")
    public ResponseEntity<CashSession> closeSession(
            @RequestBody Map<String, Object> payload,
            Authentication authentication) {
        
        UUID sessionId = UUID.fromString((String) payload.get("sessionId"));
        BigDecimal actualCash = new BigDecimal(payload.get("actualCash").toString());
        String notes = (String) payload.get("notes");

        CashSession session = cashSessionService.closeSession(sessionId, actualCash, notes, authentication.getName());
        return ResponseEntity.ok(session);
    }

    @GetMapping("/report")
    public ResponseEntity<List<CashSession>> getSessionsReport(
            @RequestParam UUID shopId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) UUID terminalId) {
        
        List<CashSession> sessions = cashSessionService.getSessionsByShop(shopId, fromDate, toDate, terminalId);
        return ResponseEntity.ok(sessions);
    }
}
