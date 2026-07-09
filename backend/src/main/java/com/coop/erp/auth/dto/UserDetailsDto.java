package com.coop.erp.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDetailsDto {
    private UUID id;
    private String username;
    private String email;
    private String role;
    private UUID shopId;
    private String shopCode;
    private String shopName;
}
