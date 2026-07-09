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
    private boolean autoBackupEnabled;
    private String backupFrequency; 
    private String backupTime;
    private int retentionDays;
    private String lastBackupAt;
    private String lastBackupStatus;
}
