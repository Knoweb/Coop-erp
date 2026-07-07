package com.coop.erp.settings.controller;

import com.coop.erp.settings.dto.BackupSettingsDto;
import com.coop.erp.settings.dto.BusinessProfileDto;
import com.coop.erp.settings.dto.SecuritySettingsDto;
import com.coop.erp.settings.dto.UserPreferencesDto;
import com.coop.erp.settings.service.SettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/settings")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')")
public class SettingsController {

    private final SettingsService settingsService;

    @GetMapping("/business-profile")
    public ResponseEntity<BusinessProfileDto> getBusinessProfile() {
        return ResponseEntity.ok(settingsService.getBusinessProfile());
    }

    @PutMapping("/business-profile")
    public ResponseEntity<?> updateBusinessProfile(@RequestBody BusinessProfileDto dto) {
        settingsService.updateBusinessProfile(dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/security")
    public ResponseEntity<SecuritySettingsDto> getSecuritySettings() {
        return ResponseEntity.ok(settingsService.getSecuritySettings());
    }

    @PutMapping("/security")
    public ResponseEntity<?> updateSecuritySettings(@RequestBody SecuritySettingsDto dto) {
        settingsService.updateSecuritySettings(dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/user-preferences")
    public ResponseEntity<UserPreferencesDto> getUserPreferences() {
        return ResponseEntity.ok(settingsService.getUserPreferences());
    }

    @PutMapping("/user-preferences")
    public ResponseEntity<?> updateUserPreferences(@RequestBody UserPreferencesDto dto) {
        settingsService.updateUserPreferences(dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/backup")
    public ResponseEntity<BackupSettingsDto> getBackupSettings() {
        return ResponseEntity.ok(settingsService.getBackupSettings());
    }

    @PutMapping("/backup")
    public ResponseEntity<?> updateBackupSettings(@RequestBody BackupSettingsDto dto) {
        settingsService.updateBackupSettings(dto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/backup/run-now")
    public ResponseEntity<?> runManualBackup() {
        return ResponseEntity.ok("Manual backup action is not implemented yet.");
    }
}
