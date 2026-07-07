package com.coop.erp.auth.controller;

import com.coop.erp.auth.dto.AuthResponse;
import com.coop.erp.auth.dto.LoginRequest;
import com.coop.erp.auth.dto.LoginTypeResponse;
import com.coop.erp.core.entity.User;
import com.coop.erp.auth.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Arrays;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private AuthService service;

    @PostMapping("/register")
    public String addNewUser(@RequestBody User user) {
        return service.saveUser(user);
    }

    @GetMapping("/login-types")
    public List<LoginTypeResponse> getLoginTypes() {
        return Arrays.asList(
                new LoginTypeResponse("ADMIN", "Admin"),
                new LoginTypeResponse("SHOP", "Shops")
        );
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest loginRequest) {
        return service.generateToken(loginRequest);
    }

    @GetMapping("/validate")
    public String validateToken(@RequestParam("token") String token) {
        service.validateToken(token);
        return "Token is valid.";
    }

    @GetMapping("/secure-test")
    public String testGatewaySecurity() {
        return "The Gateway Bouncer let you in! You are securely inside the system.";
    }
}
