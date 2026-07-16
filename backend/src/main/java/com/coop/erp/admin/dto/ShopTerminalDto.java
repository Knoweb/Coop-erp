package com.coop.erp.admin.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class ShopTerminalDto {
    private UUID id;
    private UUID shopId;
    private String terminalCode;
    private String terminalName;
    private String deviceIdentifier;
    private Boolean isActive;
}
