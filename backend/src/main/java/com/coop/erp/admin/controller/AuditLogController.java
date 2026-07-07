package com.coop.erp.admin.controller;

import com.coop.erp.admin.entity.AuditLog;
import com.coop.erp.admin.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogRepository repository;

    @GetMapping
    public ResponseEntity<List<AuditLog>> getAllLogs() {
        return ResponseEntity.ok(repository.findAllByOrderByCreatedAtDesc());
    }
}