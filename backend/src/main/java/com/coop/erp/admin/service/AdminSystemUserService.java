package com.coop.erp.admin.service;

import com.coop.erp.admin.dto.SystemUserDto;
import com.coop.erp.core.entity.User;
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
public class AdminSystemUserService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional(readOnly = true)
    public List<SystemUserDto.Response> getAllSystemUsers() {
        return repository.findAll().stream()
                .filter(u -> u.getShop() == null && "ADMIN".equals(u.getRole()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SystemUserDto.Response createSystemUser(SystemUserDto.CreateRequest request) {
        if (repository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Username already exists in the system.");
        }

        User user = User.builder()
                .name(request.name())
                .username(request.username())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(request.role())
                .isActive(request.active() != null ? request.active() : true)
                .shop(null) // explicitly null for system users
                .build();

        return mapToResponse(repository.save(user));
    }

    @Transactional
    public SystemUserDto.Response updateSystemUser(UUID id, SystemUserDto.UpdateRequest request) {
        User user = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.getUsername().equals(request.username()) && repository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Username already exists in the system.");
        }

        user.setName(request.name());
        user.setUsername(request.username());
        user.setEmail(request.email());
        if (request.active() != null) {
            user.setIsActive(request.active());
        }

        return mapToResponse(repository.save(user));
    }

    @Transactional
    public void updateSystemUserStatus(UUID id, Boolean active) {
        User user = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // TODO: Prevent the logged-in user from deactivating themselves
        
        long activeAdminCount = repository.findAll().stream()
                .filter(u -> u.getShop() == null && "ADMIN".equals(u.getRole()) && u.getIsActive())
                .count();

        if (active != null && !active && activeAdminCount <= 1 && user.getIsActive()) {
            throw new IllegalArgumentException("Cannot deactivate the last active ADMIN user.");
        }

        user.setIsActive(active);
        repository.save(user);
    }

    @Transactional
    public void resetPassword(UUID id, String newPassword) {
        User user = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        repository.save(user);
    }

    private SystemUserDto.Response mapToResponse(User user) {
        return new SystemUserDto.Response(
                user.getId(),
                user.getName(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getIsActive(),
                user.getCreatedAt()
        );
    }
}
