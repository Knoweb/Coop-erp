package com.coop.erp.dashboard.controller;

import com.coop.erp.admin.dto.ShopTerminalDto;
import com.coop.erp.admin.entity.ShopTerminal;
import com.coop.erp.admin.repository.ShopTerminalRepository;
import com.coop.erp.core.entity.User;
import com.coop.erp.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/shop/terminals")
@RequiredArgsConstructor
public class ShopTerminalController {

    private final ShopTerminalRepository shopTerminalRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<ShopTerminalDto>> getActiveTerminals(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getShop() == null) {
            throw new IllegalArgumentException("User does not belong to a shop");
        }

        List<ShopTerminal> terminals = shopTerminalRepository.findByShopIdAndIsActiveTrue(user.getShop().getId());
        
        return ResponseEntity.ok(terminals.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList()));
    }

    private ShopTerminalDto mapToDto(ShopTerminal terminal) {
        return ShopTerminalDto.builder()
                .id(terminal.getId())
                .shopId(terminal.getShop().getId())
                .terminalCode(terminal.getTerminalCode())
                .terminalName(terminal.getTerminalName())
                .deviceIdentifier(terminal.getDeviceIdentifier())
                .isActive(terminal.getIsActive())
                .build();
    }
}
