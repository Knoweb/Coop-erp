package com.coop.erp.admin.controller;

import com.coop.erp.admin.dto.ShopTerminalDto;
import com.coop.erp.admin.entity.ShopTerminal;
import com.coop.erp.admin.repository.ShopTerminalRepository;
import com.coop.erp.core.entity.Shop;
import com.coop.erp.core.repository.ShopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin/shops/{shopId}/terminals")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ADMIN', 'TENANT_ADMIN')")
public class AdminShopTerminalController {

    private final ShopTerminalRepository shopTerminalRepository;
    private final ShopRepository shopRepository;

    @GetMapping
    public ResponseEntity<List<ShopTerminalDto>> getTerminals(@PathVariable UUID shopId) {
        return ResponseEntity.ok(shopTerminalRepository.findByShopId(shopId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<ShopTerminalDto> createTerminal(@PathVariable UUID shopId, @RequestBody ShopTerminalDto request) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new IllegalArgumentException("Shop not found"));

        if (shopTerminalRepository.findByShopIdAndTerminalCode(shopId, request.getTerminalCode()).isPresent()) {
            throw new IllegalArgumentException("Terminal code already exists for this shop");
        }

        ShopTerminal terminal = new ShopTerminal();
        terminal.setShop(shop);
        terminal.setTerminalCode(request.getTerminalCode());
        terminal.setTerminalName(request.getTerminalName());
        terminal.setDeviceIdentifier(request.getDeviceIdentifier());
        terminal.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        return ResponseEntity.ok(mapToDto(shopTerminalRepository.save(terminal)));
    }

    @PutMapping("/{terminalId}")
    public ResponseEntity<ShopTerminalDto> updateTerminal(@PathVariable UUID shopId, @PathVariable UUID terminalId, @RequestBody ShopTerminalDto request) {
        ShopTerminal terminal = shopTerminalRepository.findById(terminalId)
                .orElseThrow(() -> new IllegalArgumentException("Terminal not found"));

        if (!terminal.getShop().getId().equals(shopId)) {
            throw new IllegalArgumentException("Terminal does not belong to the specified shop");
        }

        if (!terminal.getTerminalCode().equals(request.getTerminalCode())) {
            if (shopTerminalRepository.findByShopIdAndTerminalCode(shopId, request.getTerminalCode()).isPresent()) {
                throw new IllegalArgumentException("Terminal code already exists for this shop");
            }
        }

        terminal.setTerminalCode(request.getTerminalCode());
        terminal.setTerminalName(request.getTerminalName());
        terminal.setDeviceIdentifier(request.getDeviceIdentifier());
        if (request.getIsActive() != null) {
            terminal.setIsActive(request.getIsActive());
        }

        return ResponseEntity.ok(mapToDto(shopTerminalRepository.save(terminal)));
    }

    @PatchMapping("/{terminalId}/status")
    public ResponseEntity<Void> updateTerminalStatus(@PathVariable UUID shopId, @PathVariable UUID terminalId, @RequestBody Map<String, Boolean> body) {
        ShopTerminal terminal = shopTerminalRepository.findById(terminalId)
                .orElseThrow(() -> new IllegalArgumentException("Terminal not found"));

        if (!terminal.getShop().getId().equals(shopId)) {
            throw new IllegalArgumentException("Terminal does not belong to the specified shop");
        }

        if (body.containsKey("isActive")) {
            terminal.setIsActive(body.get("isActive"));
            shopTerminalRepository.save(terminal);
        }
        return ResponseEntity.ok().build();
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
