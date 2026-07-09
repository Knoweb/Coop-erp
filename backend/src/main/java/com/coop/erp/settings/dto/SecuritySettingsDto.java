package com.coop.erp.settings.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecuritySettingsDto {
    private int minimumPasswordLength;
    private boolean requireUppercase;
    private boolean requireNumber;
    private boolean requireSpecialCharacter;
    private int sessionTimeoutMinutes;
    private int maxLoginAttempts;
    private int accountLockMinutes;
}
