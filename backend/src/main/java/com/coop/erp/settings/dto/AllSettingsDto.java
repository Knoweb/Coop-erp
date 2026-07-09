package com.coop.erp.settings.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AllSettingsDto {
    private BusinessProfileDto businessProfile;
    private SecuritySettingsDto securitySettings;
    private UserPreferencesDto userPreferences;
    private BackupSettingsDto backupSettings;
}
