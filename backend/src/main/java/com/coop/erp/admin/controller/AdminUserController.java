package com.coop.erp.admin.controller;

import com.coop.erp.core.entity.Shop;
import com.coop.erp.core.entity.User;
import com.coop.erp.core.repository.ShopRepository;
import com.coop.erp.core.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/users")
public class AdminUserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

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
