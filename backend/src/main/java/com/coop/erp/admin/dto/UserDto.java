package com.coop.erp.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDateTime;
import java.util.UUID;

public class UserDto {

    public record CreateRequest(

            @NotBlank(message = "Full name cannot be blank")
            String name,
            @NotBlank(message = "Username cannot be blank")
            String username,

            @NotBlank(message = "Password is required")
            String rawPassword,

            @Pattern(regexp = "^(ROLE_ADMIN|ROLE_MILK_SHOP|ROLE_BEER_GARDEN|ROLE_ROOM_BOOKING)$",
                    message = "Invalid role assigned")
            String role
    ) {}

    public record Response(
            UUID id,
            String name,
            String username,
            String role,
            Boolean isActive,
            LocalDateTime createdAt
    ) {}

    // Admin resets the user's password directly
    public record PasswordResetRequest(
            @NotBlank(message = "New password is required")
            String newPassword
    ) {}
}