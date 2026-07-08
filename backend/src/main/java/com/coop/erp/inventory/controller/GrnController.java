package com.coop.erp.inventory.controller;

import com.coop.erp.inventory.dto.GrnRequest;
import com.coop.erp.inventory.dto.GrnResponse;
import com.coop.erp.inventory.service.GrnService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/purchases")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
public class GrnController {

    private final GrnService grnService;

    @PostMapping
    public GrnResponse createGrn(@Valid @RequestBody GrnRequest request) {
        return grnService.createGrn(request);
    }

    @GetMapping
    public List<GrnResponse> getAllGrns() {
        return grnService.getAllGrns();
    }
}