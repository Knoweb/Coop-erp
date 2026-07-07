package com.coop.erp.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    private LoginType loginType;
    private String usernameOrEmail;
    private String password;
}
