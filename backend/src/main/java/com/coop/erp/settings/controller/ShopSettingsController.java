package com.coop.erp.settings.controller;

import com.coop.erp.settings.dto.UserPreferencesDto;
import com.coop.erp.settings.service.SettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/shop/settings")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('SHOP_ADMIN', 'SHOP_USER')")
public class ShopSettingsController {

    private final SettingsService settingsService;

    @GetMapping("/user-preferences")
    public ResponseEntity<UserPreferencesDto> getUserPreferences(@RequestParam String terminalId) {
        return ResponseEntity.ok(settingsService.getShopUiPreferences(terminalId));
    }

    @PutMapping("/user-preferences")
    public ResponseEntity<?> updateUserPreferences(@RequestBody UserPreferencesDto dto) {
        settingsService.updateShopUiPreferences(dto);
        return ResponseEntity.ok().build();
    }
}
