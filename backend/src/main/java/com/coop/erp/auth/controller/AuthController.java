package com.coop.erp.auth.controller;

import com.coop.erp.auth.dto.AuthRequest;
import com.coop.erp.core.entity.User;
import com.coop.erp.auth.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService service;

    @PostMapping("/register")
    public String addNewUser(@RequestBody User user) {
        return service.saveUser(user);
    }

    @PostMapping("/token")
    public String getToken(@RequestBody AuthRequest authRequest) {
        // We use .getUsername() here because your AuthRequest DTO has a 'username' field
        return service.generateToken(authRequest.getUsername(), authRequest.getPassword());
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
