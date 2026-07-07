package com.coop.erp.auth.service;

import com.coop.erp.core.entity.User;
import com.coop.erp.core.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    public String saveUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        repository.save(user);
        return "User added to the system";
    }

    public String generateToken(String username, String password) {
        User user = repository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (passwordEncoder.matches(password, user.getPassword())) {
            // PASS THE ROLE HERE TO MATCH YOUR JWTSERVICE DEFINITION
            return jwtService.generateToken(username, user.getRole());
        } else {
            throw new RuntimeException("Invalid password");
        }
    }

    public void validateToken(String token) {
        jwtService.validateToken(token);
    }
}
