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

import com.coop.erp.core.entity.Shop;
import com.coop.erp.core.entity.User;
import com.coop.erp.core.repository.ShopRepository;
import com.coop.erp.core.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService service;
    private final UserRepository userRepository;
    private final ShopRepository shopRepository;
    private final PasswordEncoder passwordEncoder;



    @PostMapping
    public User createUser(@RequestBody UserCreationRequest request) {
        if (userRepository.existsByUsernameOrEmail(request.getUsername(), request.getEmail())) {
            throw new RuntimeException("Username or email already exists");
        }

        Shop shop = null;
        if (request.getShopId() != null) {
            shop = shopRepository.findById(request.getShopId())
                    .orElseThrow(() -> new RuntimeException("Shop not found"));
        }

        User user = User.builder()
                .name(request.getUsername()) // Simple mapping
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole().replace("ROLE_", "") : "SHOP_USER")
                .shop(shop)
                .build();

        return userRepository.save(user);
    }

    @GetMapping
    public ResponseEntity<List<UserDto.Response>> getAllUsers(@RequestParam(required = false) UUID shopId) {
        return ResponseEntity.ok(service.getAllUsers(shopId));
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

class UserCreationRequest {
    private UUID shopId;
    private String username;
    private String email;
    private String password;
    private String role;

    public UUID getShopId() { return shopId; }
    public void setShopId(UUID shopId) { this.shopId = shopId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}