package com.coop.erp.core.config;

import com.coop.erp.core.entity.Shop;
import com.coop.erp.core.entity.User;
import com.coop.erp.core.repository.ShopRepository;
import com.coop.erp.core.repository.UserRepository;
import com.coop.erp.settings.service.SettingsService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ShopRepository shopRepository;
    private final PasswordEncoder passwordEncoder;
    private final SettingsService settingsService;

    public DatabaseSeeder(UserRepository userRepository, ShopRepository shopRepository, PasswordEncoder passwordEncoder, SettingsService settingsService) {
        this.userRepository = userRepository;
        this.shopRepository = shopRepository;
        this.passwordEncoder = passwordEncoder;
        this.settingsService = settingsService;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        settingsService.seedDefaultSettings();
        seedAdminUser();
        seedShopsAndShopAdmins();
    }

    private void seedAdminUser() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .name("System Admin")
                    .username("admin")
                    .email("admin@example.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role("ADMIN")
                    .shop(null)
                    .build();
            userRepository.save(admin);
            System.out.println("Default admin user created.");
        }
    }

    private void seedShopsAndShopAdmins() {
        for (int i = 1; i <= 4; i++) {
            final int index = i;
            String shopCode = "SHOP_" + index;
            String shopName = "Shop " + index;
            
            Shop shop = shopRepository.findByCode(shopCode).orElseGet(() -> {
                Shop newShop = Shop.builder()
                        .code(shopCode)
                        .name(shopName)
                        .address("Address for " + shopName)
                        .contactNumber("123456789" + index)
                        .active(true)
                        .build();
                System.out.println(shopName + " created.");
                return shopRepository.save(newShop);
            });

            String shopAdminUsername = "shop" + index + "admin";
            if (!userRepository.existsByUsername(shopAdminUsername)) {
                User shopAdmin = User.builder()
                        .name(shopName + " Admin")
                        .username(shopAdminUsername)
                        .email("shop" + index + "@example.com")
                        .password(passwordEncoder.encode("shop123"))
                        .role("SHOP_ADMIN")
                        .shop(shop)
                        .build();
                userRepository.save(shopAdmin);
                System.out.println("Admin for " + shopName + " created.");
            }
        }
    }
}
