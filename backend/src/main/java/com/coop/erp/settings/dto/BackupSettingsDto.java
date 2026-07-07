package com.coop.erp.settings.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BackupSettingsDto {
    private boolean enableAutomaticBackup;
    private String backupFrequency; // DAILY, WEEKLY, MONTHLY
    private String backupTime;
    private String lastBackupTime;
    private boolean maintenanceMode;
}
