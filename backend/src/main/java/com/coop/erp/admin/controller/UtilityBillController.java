package com.coop.erp.admin.controller;

import com.coop.erp.admin.dto.UtilityBillRequest;
import com.coop.erp.admin.dto.UtilityBillResponse;
import com.coop.erp.admin.service.UtilityBillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/utilities")
@RequiredArgsConstructor // Remove if handled by API Gateway
public class UtilityBillController {

    private final UtilityBillService service;

    @PostMapping
    public ResponseEntity<?> recordUtilityBill(@Valid @RequestBody UtilityBillRequest request) {
        try {
            UtilityBillResponse response = service.recordBill(request);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping
    public ResponseEntity<List<UtilityBillResponse>> getAllBills() {
        return ResponseEntity.ok(service.getAllBills());
    }
}