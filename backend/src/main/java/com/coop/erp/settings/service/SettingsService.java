package com.coop.erp.settings.service;

import com.coop.erp.settings.dto.AllSettingsDto;
import com.coop.erp.settings.dto.BackupSettingsDto;
import com.coop.erp.settings.dto.BusinessProfileDto;
import com.coop.erp.settings.dto.SecuritySettingsDto;
import com.coop.erp.settings.dto.UserPreferencesDto;
import com.coop.erp.settings.entity.SystemSetting;
import com.coop.erp.settings.entity.UiPreference;
import com.coop.erp.settings.repository.SystemSettingRepository;
import com.coop.erp.settings.repository.UiPreferenceRepository;
import com.coop.erp.core.entity.User;
import com.coop.erp.core.repository.UserRepository;
import com.coop.erp.admin.repository.ShopTerminalRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private final SystemSettingRepository repository;
    private final UiPreferenceRepository uiPreferenceRepository;
    private final UserRepository userRepository;
    private final ShopTerminalRepository shopTerminalRepository;
    private final ObjectMapper objectMapper;

    private static final String BUSINESS_PROFILE_KEY = "BUSINESS_PROFILE";
    private static final String SECURITY_SETTINGS_KEY = "SECURITY_SETTINGS";
    private static final String USER_PREFS_KEY = "USER_PREFERENCES";
    private static final String BACKUP_SETTINGS_KEY = "BACKUP_SETTINGS";

    public void seedDefaultSettings() {
        seedSettingIfMissing(BUSINESS_PROFILE_KEY, BusinessProfileDto.builder()
                .businessName("Coop Grocery Management System")
                .mainShopName("Main Shop")
                .address("")
                .phone("")
                .email("")
                .taxNumber("")
                .receiptFooter("Thank you for shopping with us!")
                .build());

        seedSettingIfMissing(SECURITY_SETTINGS_KEY, SecuritySettingsDto.builder()
                .minimumPasswordLength(8)
                .requireUppercase(true)
                .requireNumber(true)
                .requireSpecialCharacter(false)
                .sessionTimeoutMinutes(30)
                .maxLoginAttempts(5)
                .accountLockMinutes(15)
                .build());

        // User preferences seeded on-demand in getUserPreferencesForCurrentUser

        seedSettingIfMissing(BACKUP_SETTINGS_KEY, BackupSettingsDto.builder()
                .autoBackupEnabled(false)
                .backupFrequency("Daily")
                .backupTime("23:00")
                .retentionDays(30)
                .lastBackupAt(null)
                .lastBackupStatus("Never Run")
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

    public UserPreferencesDto getAdminUiPreferences() {
        return getUiPreferences("ADMIN", "ADMIN");
    }

    public void updateAdminUiPreferences(UserPreferencesDto dto) {
        saveUiPreferences("ADMIN", "ADMIN", dto);
    }

    public UserPreferencesDto getShopUiPreferences(String terminalId) {
        if (terminalId == null || terminalId.trim().isEmpty()) {
            throw new IllegalArgumentException("Terminal is required for shop preferences.");
        }

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        if (user.getShop() == null) {
            throw new RuntimeException("User is not assigned to a shop");
        }
        
        // Validate terminal belongs to shop
        boolean validTerminal = shopTerminalRepository.findById(java.util.UUID.fromString(terminalId))
                .map(t -> t.getShop().getId().equals(user.getShop().getId()) && Boolean.TRUE.equals(t.getIsActive()))
                .orElse(false);
                
        if (!validTerminal) {
            throw new IllegalArgumentException("Invalid or inactive terminal for this shop.");
        }

        UserPreferencesDto prefs = getUiPreferences("TERMINAL", terminalId);
        prefs.setTerminalId(terminalId);
        return prefs;
    }

    public void updateShopUiPreferences(UserPreferencesDto dto) {
        if (dto.getTerminalId() == null || dto.getTerminalId().trim().isEmpty()) {
            throw new IllegalArgumentException("Terminal is required for shop preferences.");
        }

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        if (user.getShop() == null) {
            throw new RuntimeException("User is not assigned to a shop");
        }
        
        // Validate terminal belongs to shop
        boolean validTerminal = shopTerminalRepository.findById(java.util.UUID.fromString(dto.getTerminalId()))
                .map(t -> t.getShop().getId().equals(user.getShop().getId()) && Boolean.TRUE.equals(t.getIsActive()))
                .orElse(false);
                
        if (!validTerminal) {
            throw new IllegalArgumentException("Invalid or inactive terminal for this shop.");
        }

        saveUiPreferences("TERMINAL", dto.getTerminalId(), dto);
    }

    private UserPreferencesDto getUiPreferences(String scopeType, String scopeId) {
        UiPreference pref = uiPreferenceRepository.findByScopeTypeAndScopeId(scopeType, scopeId)
                .orElseGet(() -> {
                    String username = SecurityContextHolder.getContext().getAuthentication().getName();
                    UiPreference defaultPref = UiPreference.builder()
                            .scopeType(scopeType)
                            .scopeId(scopeId)
                            .defaultTheme("Light")
                            .dashboardRefreshIntervalSeconds(60)
                            .itemsPerPage(10)
                            .enableSystemNotifications(true)
                            .updatedBy(username)
                            .build();
                    return uiPreferenceRepository.save(defaultPref);
                });

        return UserPreferencesDto.builder()
                .defaultTheme(pref.getDefaultTheme())
                .dashboardRefreshIntervalSeconds(pref.getDashboardRefreshIntervalSeconds())
                .itemsPerPage(pref.getItemsPerPage())
                .enableSystemNotifications(pref.getEnableSystemNotifications() != null ? pref.getEnableSystemNotifications() : true)
                .build();
    }

    private void saveUiPreferences(String scopeType, String scopeId, UserPreferencesDto dto) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        
        UiPreference pref = uiPreferenceRepository.findByScopeTypeAndScopeId(scopeType, scopeId)
                .orElseGet(() -> UiPreference.builder().scopeType(scopeType).scopeId(scopeId).build());

        pref.setDefaultTheme(dto.getDefaultTheme());
        pref.setDashboardRefreshIntervalSeconds(dto.getDashboardRefreshIntervalSeconds());
        pref.setItemsPerPage(dto.getItemsPerPage());
        pref.setEnableSystemNotifications(dto.isEnableSystemNotifications());
        pref.setUpdatedBy(username);
        
        uiPreferenceRepository.save(pref);
    }

    public BackupSettingsDto getBackupSettings() {
        return getSetting(BACKUP_SETTINGS_KEY, BackupSettingsDto.class);
    }

    public void updateBackupSettings(BackupSettingsDto dto) {
        saveSetting(BACKUP_SETTINGS_KEY, dto);
    }

    public AllSettingsDto getAllSettings() {
        return AllSettingsDto.builder()
                .businessProfile(getBusinessProfile())
                .securitySettings(getSecuritySettings())
                .userPreferences(getAdminUiPreferences())
                .backupSettings(getBackupSettings())
                .build();
    }
}
