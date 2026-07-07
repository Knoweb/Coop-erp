package com.coop.erp.admin.controller;

import com.coop.erp.admin.dto.SystemUserDto;
import com.coop.erp.admin.dto.UserDto;
import com.coop.erp.admin.service.AdminSystemUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/system-users")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminSystemUserController {

    private final AdminSystemUserService service;

    @GetMapping
    public ResponseEntity<List<SystemUserDto.Response>> getAllSystemUsers() {
        return ResponseEntity.ok(service.getAllSystemUsers());
    }

    @PostMapping
    public ResponseEntity<?> createSystemUser(@Valid @RequestBody SystemUserDto.CreateRequest request) {
        try {
            return ResponseEntity.ok(service.createSystemUser(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSystemUser(@PathVariable UUID id, @Valid @RequestBody SystemUserDto.UpdateRequest request) {
        try {
            return ResponseEntity.ok(service.updateSystemUser(id, request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateSystemUserStatus(@PathVariable UUID id, @RequestBody SystemUserDto.StatusUpdateRequest request) {
        try {
            service.updateSystemUserStatus(id, request.active());
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/password")
    public ResponseEntity<?> resetPassword(@PathVariable UUID id, @Valid @RequestBody UserDto.PasswordResetRequest request) {
        try {
            service.resetPassword(id, request.newPassword());
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
