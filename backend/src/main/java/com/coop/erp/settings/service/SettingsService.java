package com.coop.erp.settings.service;

import com.coop.erp.settings.dto.BackupSettingsDto;
import com.coop.erp.settings.dto.BusinessProfileDto;
import com.coop.erp.settings.dto.SecuritySettingsDto;
import com.coop.erp.settings.dto.UserPreferencesDto;
import com.coop.erp.settings.entity.SystemSetting;
import com.coop.erp.settings.repository.SystemSettingRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private final SystemSettingRepository repository;
    private final ObjectMapper objectMapper;

    private static final String BUSINESS_PROFILE_KEY = "BUSINESS_PROFILE";
    private static final String SECURITY_SETTINGS_KEY = "SECURITY_SETTINGS";
    private static final String USER_PREFS_KEY = "USER_PREFERENCES";
    private static final String BACKUP_SETTINGS_KEY = "BACKUP_SETTINGS";

    @PostConstruct
    public void seedDefaultSettings() {
        seedSettingIfMissing(BUSINESS_PROFILE_KEY, BusinessProfileDto.builder()
                .businessName("Coop Grocery")
                .address("Main Shop")
                .contactNumber("")
                .email("")
                .receiptFooterText("Thank you for shopping with us")
                .build());

        seedSettingIfMissing(SECURITY_SETTINGS_KEY, SecuritySettingsDto.builder()
                .minimumPasswordLength(8)
                .requireStrongPassword(false)
                .sessionTimeoutMinutes(60)
                .enableAccountLocking(false)
                .maxFailedLoginAttempts(5)
                .build());

        seedSettingIfMissing(USER_PREFS_KEY, UserPreferencesDto.builder()
                .defaultTheme("LIGHT")
                .dashboardRefreshIntervalSeconds(60)
                .itemsPerPage(10)
                .enableNotifications(true)
                .build());

        seedSettingIfMissing(BACKUP_SETTINGS_KEY, BackupSettingsDto.builder()
                .enableAutomaticBackup(false)
                .backupFrequency("DAILY")
                .backupTime("23:00")
                .lastBackupTime(null)
                .maintenanceMode(false)
                .build());
    }

    private void seedSettingIfMissing(String key, Object defaultDto) {
        if (!repository.existsById(key)) {
            try {
                SystemSetting setting = SystemSetting.builder()
                        .settingKey(key)
                        .settingValue(objectMapper.writeValueAsString(defaultDto))
                        .updatedBy("SYSTEM")
                        .build();
                repository.save(setting);
            } catch (JsonProcessingException e) {
                // Ignore seeding failure
            }
        }
    }

    private <T> T getSetting(String key, Class<T> clazz) {
        return repository.findById(key)
                .map(setting -> {
                    try {
                        return objectMapper.readValue(setting.getSettingValue(), clazz);
                    } catch (JsonProcessingException e) {
                        throw new RuntimeException("Failed to parse setting", e);
                    }
                })
                .orElse(null);
    }

    private void saveSetting(String key, Object dto) {
        try {
            String value = objectMapper.writeValueAsString(dto);
            SystemSetting setting = repository.findById(key)
                    .orElseGet(() -> SystemSetting.builder().settingKey(key).build());
            setting.setSettingValue(value);
            // Ideally set updatedBy with the current admin username
            setting.setUpdatedBy("admin");
            repository.save(setting);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to save setting", e);
        }
    }

    public BusinessProfileDto getBusinessProfile() {
        return getSetting(BUSINESS_PROFILE_KEY, BusinessProfileDto.class);
    }

    public void updateBusinessProfile(BusinessProfileDto dto) {
        saveSetting(BUSINESS_PROFILE_KEY, dto);
    }

    public SecuritySettingsDto getSecuritySettings() {
        return getSetting(SECURITY_SETTINGS_KEY, SecuritySettingsDto.class);
    }

    public void updateSecuritySettings(SecuritySettingsDto dto) {
        saveSetting(SECURITY_SETTINGS_KEY, dto);
    }

    public UserPreferencesDto getUserPreferences() {
        return getSetting(USER_PREFS_KEY, UserPreferencesDto.class);
    }

    public void updateUserPreferences(UserPreferencesDto dto) {
        saveSetting(USER_PREFS_KEY, dto);
    }

    public BackupSettingsDto getBackupSettings() {
        return getSetting(BACKUP_SETTINGS_KEY, BackupSettingsDto.class);
    }

    public void updateBackupSettings(BackupSettingsDto dto) {
        saveSetting(BACKUP_SETTINGS_KEY, dto);
    }
}
