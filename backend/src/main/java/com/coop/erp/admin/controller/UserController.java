package com.coop.erp.admin.controller;

import com.coop.erp.admin.dto.UserDto;
import com.coop.erp.admin.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService service;



    @GetMapping
    public ResponseEntity<List<UserDto.Response>> getAllUsers() {
        return ResponseEntity.ok(service.getAllUsers());
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleStatus(@PathVariable UUID id) {
        try {
            service.toggleUserStatus(id);
            return ResponseEntity.ok("User status updated successfully.");
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @PatchMapping("/{id}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable UUID id, @Valid @RequestBody UserDto.PasswordResetRequest request) {
        try {
            service.resetPassword(id, request.newPassword());
            return ResponseEntity.ok("Password has been successfully updated.");
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }
}