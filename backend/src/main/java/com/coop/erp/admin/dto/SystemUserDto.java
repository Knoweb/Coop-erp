package com.coop.erp.admin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDateTime;
import java.util.UUID;

public class SystemUserDto {

    public record CreateRequest(
            @NotBlank(message = "Full name cannot be blank")
            String name,

            @NotBlank(message = "Username cannot be blank")
            String username,

            @NotBlank(message = "Email cannot be blank")
            @Email(message = "Invalid email format")
            String email,

            @NotBlank(message = "Password is required")
            String password,

            @Pattern(regexp = "^(ADMIN)$", message = "Role must be ADMIN for system users")
            String role,

            Boolean active
    ) {}

    public record UpdateRequest(
            @NotBlank(message = "Full name cannot be blank")
            String name,

            @NotBlank(message = "Username cannot be blank")
            String username,

            @NotBlank(message = "Email cannot be blank")
            @Email(message = "Invalid email format")
            String email,

            Boolean active
    ) {}

    public record StatusUpdateRequest(
            Boolean active
    ) {}

    public record Response(
            UUID id,
            String name,
            String username,
            String email,
            String role,
            Boolean active,
            LocalDateTime createdAt
    ) {}
}
