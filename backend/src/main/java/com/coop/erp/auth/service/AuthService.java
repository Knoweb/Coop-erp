package com.coop.erp.auth.service;

import com.coop.erp.auth.dto.AuthResponse;
import com.coop.erp.auth.dto.LoginRequest;
import com.coop.erp.auth.dto.LoginType;
import com.coop.erp.auth.dto.UserDetailsDto;

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

    public AuthResponse generateToken(LoginRequest loginRequest) {
        String usernameOrEmail = loginRequest.getUsernameOrEmail();
        String password = loginRequest.getPassword();
        LoginType loginType = loginRequest.getLoginType();

        User user = repository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        if (loginType == LoginType.ADMIN && !user.getRole().equals("ADMIN")) {
            throw new RuntimeException("Invalid login type for user");
        }

        if (loginType == LoginType.SHOP && (!user.getRole().equals("SHOP_ADMIN") && !user.getRole().equals("SHOP_USER"))) {
            throw new RuntimeException("Invalid login type for user");
        }

        String shopId = user.getShop() != null ? user.getShop().getId().toString() : null;
        String shopCode = user.getShop() != null ? user.getShop().getCode() : null;
        String shopName = user.getShop() != null ? user.getShop().getName() : null;

        String token = jwtService.generateToken(user.getUsername(), user.getRole(), loginType.name(), shopId, shopCode, shopName);

        UserDetailsDto userDetailsDto = UserDetailsDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role("ROLE_" + user.getRole())
                .loginType(loginType.name())
                .shopId(user.getShop() != null ? user.getShop().getId() : null)
                .shopCode(shopCode)
                .shopName(shopName)
                .build();

        return new AuthResponse(token, userDetailsDto);
    }

    public void validateToken(String token) {
        jwtService.validateToken(token);
    }
}
