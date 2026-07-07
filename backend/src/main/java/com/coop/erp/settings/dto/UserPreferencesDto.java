package com.coop.erp.settings.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferencesDto {
    private String defaultTheme; // LIGHT, DARK, SYSTEM
    private int dashboardRefreshIntervalSeconds;
    private int itemsPerPage;
    private boolean enableNotifications;
}
