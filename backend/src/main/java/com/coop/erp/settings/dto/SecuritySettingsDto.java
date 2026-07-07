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
    private boolean requireStrongPassword;
    private int sessionTimeoutMinutes;
    private boolean enableAccountLocking;
    private int maxFailedLoginAttempts;
}
