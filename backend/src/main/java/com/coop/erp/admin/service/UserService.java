package com.coop.erp.admin.service;

import com.coop.erp.admin.dto.UserDto;
import com.coop.erp.core.entity.User;
import com.coop.erp.admin.service.AuditLogService;
import com.coop.erp.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final AuditLogService auditLogService;

    @Transactional
    public UserDto.Response createUser(UserDto.CreateRequest request) {
        if (repository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Username already exists in the system.");
        }

        User user = User.builder()
                .name(request.name())
                .username(request.username())
                .password(passwordEncoder.encode(request.rawPassword()))
                .role(request.role())
                .isActive(true)
                .build();

        User savedUser = repository.save(user);

        auditLogService.logTenantAction(
                "USER_CREATED", 
                "USER", 
                savedUser.getId().toString(), 
                "Provisioned new account for username: " + request.username() + " with role: " + request.role(),
                null,
                null
        );

        return mapToResponse(savedUser);
    }

    public List<UserDto.Response> getAllUsers(UUID shopId) {
        java.util.stream.Stream<User> stream = repository.findAll().stream();
        if (shopId != null) {
            stream = stream.filter(u -> u.getShop() != null && u.getShop().getId().equals(shopId));
        }
        return stream.map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public void toggleUserStatus(UUID id) {
        User user = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setIsActive(!user.getIsActive());
        User savedUser = repository.save(user);
        auditLogService.logTenantAction(
                "USER_STATUS_CHANGED",
                "USER",
                savedUser.getId().toString(),
                "Changed status to " + savedUser.getIsActive() + " for user " + savedUser.getUsername(),
                String.valueOf(!savedUser.getIsActive()),
                String.valueOf(savedUser.getIsActive())
        );
    }

    private UserDto.Response mapToResponse(User user) {
        return new UserDto.Response(
                user.getId(),
                user.getName(),
                user.getUsername(),
                user.getRole(),
                user.getIsActive(),
                user.getCreatedAt(),
                user.getShop() != null ? user.getShop().getId() : null,
                user.getShop() != null ? user.getShop().getName() : null
        );
    }

    // Admin sets a new permanent password for the user
    @Transactional
    public void resetPassword(UUID id, String newRawPassword) {
        User user = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Hash the new password and override the old one
        user.setPassword(passwordEncoder.encode(newRawPassword));
        repository.save(user);
        auditLogService.logTenantAction(
                "USER_UPDATED",
                "USER",
                user.getId().toString(),
                "Reset password for user " + user.getUsername(),
                null,
                null
        );
    }
}
