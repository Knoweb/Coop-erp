package com.coop.erp.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthRequest {
    private String username; // Must be named 'username'
    private String password;

    // Ensure you have these getters!
    public String getUsername() { return username; }
    public String getPassword() { return password; }
}