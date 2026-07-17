package com.coop.erp.core.config;

import com.coop.erp.admin.entity.Tenant;
import com.coop.erp.admin.repository.TenantRepository;
import com.coop.erp.core.entity.Shop;
import com.coop.erp.core.entity.User;
import com.coop.erp.core.repository.ShopRepository;
import com.coop.erp.core.repository.UserRepository;
import com.coop.erp.settings.service.SettingsService;
import jakarta.persistence.EntityManager;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigInteger;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ShopRepository shopRepository;
    private final PasswordEncoder passwordEncoder;
    private final SettingsService settingsService;
    private final TenantRepository tenantRepository;
    private final EntityManager entityManager;
    private final TransactionTemplate transactionTemplate;

    public DatabaseSeeder(UserRepository userRepository, ShopRepository shopRepository, PasswordEncoder passwordEncoder, SettingsService settingsService, TenantRepository tenantRepository, EntityManager entityManager, TransactionTemplate transactionTemplate) {
        this.userRepository = userRepository;
        this.shopRepository = shopRepository;
        this.passwordEncoder = passwordEncoder;
        this.settingsService = settingsService;
        this.tenantRepository = tenantRepository;
        this.entityManager = entityManager;
        this.transactionTemplate = transactionTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        Tenant defaultTenant = transactionTemplate.execute(status -> seedTenantAndBackfill());
        try {
            settingsService.seedDefaultSettings();
        } catch (Exception e) {
            System.err.println("Failed to seed default settings: " + e.getMessage());
        }
        transactionTemplate.execute(status -> {
            seedAdminUser(defaultTenant);
            seedShopsAndShopAdmins(defaultTenant);
            
            // Seed a second test tenant to verify isolation
            Tenant testTenant2 = seedTestTenant2();
            seedAdminUserForTenant(testTenant2, "tenant2admin", "tenant2admin123");
            seedShopForTenant(testTenant2, "T2_SHOP_1", "Test Tenant 2 Shop");
            
            return null;
        });
    }

    private Tenant seedTestTenant2() {
        return tenantRepository.findByTenantCode("TEST_TENANT_2").orElseGet(() -> {
            Tenant tenant = Tenant.builder()
                    .tenantCode("TEST_TENANT_2")
                    .tenantName("Test Tenant 2")
                    .tenantType("DISTRIBUTOR")
                    .isActive(true)
                    .build();
            return tenantRepository.save(tenant);
        });
    }

    private void seedAdminUserForTenant(Tenant tenant, String username, String password) {
        if (!userRepository.existsByUsername(username)) {
            User admin = User.builder()
                    .name(tenant.getTenantName() + " Admin")
                    .username(username)
                    .email(username + "@example.com")
                    .password(passwordEncoder.encode(password))
                    .role("TENANT_ADMIN")
                    .shop(null)
                    .tenant(tenant)
                    .build();
            userRepository.save(admin);
            System.out.println("Admin user for " + tenant.getTenantCode() + " created.");
        }
    }

    private void seedShopForTenant(Tenant tenant, String shopCode, String shopName) {
        Shop shop = shopRepository.findByCode(shopCode).orElseGet(() -> {
            Shop newShop = Shop.builder()
                    .code(shopCode)
                    .name(shopName)
                    .address("Address for " + shopName)
                    .contactNumber("987654321")
                    .active(true)
                    .tenant(tenant)
                    .build();
            System.out.println(shopName + " created under " + tenant.getTenantCode());
            return shopRepository.save(newShop);
        });

        String shopAdminUsername = shopCode.toLowerCase() + "admin";
        if (!userRepository.existsByUsername(shopAdminUsername)) {
            User shopAdmin = User.builder()
                    .name(shopName + " Admin")
                    .username(shopAdminUsername)
                    .email(shopAdminUsername + "@example.com")
                    .password(passwordEncoder.encode("shop123"))
                    .role("SHOP_ADMIN")
                    .shop(shop)
                    .tenant(tenant)
                    .build();
            userRepository.save(shopAdmin);
            System.out.println("Admin for " + shopName + " created.");
        }
    }

    private Tenant seedTenantAndBackfill() {
        Tenant defaultTenant = tenantRepository.findByTenantCode("COOPFED_KILINOCHCHI").orElseGet(() -> {
            Tenant tenant = Tenant.builder()
                    .tenantCode("COOPFED_KILINOCHCHI")
                    .tenantName("COOPFED Kilinochchi Pilot")
                    .tenantType("COOPFED")
                    .isActive(true)
                    .build();
            return tenantRepository.save(tenant);
        });

        // Exact tables based on actual entity mappings
        String[] schemasAndTables = {
                "admin.shops", "admin.users", "admin.shop_terminals",
                "admin.system_settings", "admin.ui_preferences", "admin.audit_log", "admin.utility_bill",
                "grocery.products", "grocery.suppliers", "grocery.shop_items",
                "grocery.stock_ledger", "grocery.stock_movements", "grocery.purchase_invoices",
                "grocery.purchase_invoice_items", "grocery.sales", "grocery.sale_items",
                "grocery.cash_sessions", "grocery.sequence_counters", "grocery.stock_adjustment_log",
                "accounting.chart_of_accounts", "accounting.journal_entries", "accounting.journal_entry_lines"
        };

        for (String fullTable : schemasAndTables) {
            String[] parts = fullTable.split("\\.");
            String schema = parts[0];
            String table = parts[1];

            try {
                // 1. Check if table exists
                Number tableExists = (Number) entityManager.createNativeQuery(
                        "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = :schema AND table_name = :table"
                ).setParameter("schema", schema).setParameter("table", table).getSingleResult();

                if (tableExists.intValue() == 0) {
                    System.out.println("Skipping tenant backfill for missing table " + fullTable);
                    continue;
                }

                // 2. Check if tenant_id column exists
                Number columnExists = (Number) entityManager.createNativeQuery(
                        "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = :schema AND table_name = :table AND column_name = 'tenant_id'"
                ).setParameter("schema", schema).setParameter("table", table).getSingleResult();

                if (columnExists.intValue() == 0) {
                    System.out.println("Skipping tenant backfill for missing column tenant_id in " + fullTable);
                    continue;
                }

                // 3. Perform update only if both exist
                entityManager.createNativeQuery(
                        "UPDATE " + fullTable + " SET tenant_id = :tenantId WHERE tenant_id IS NULL"
                ).setParameter("tenantId", defaultTenant.getId()).executeUpdate();

                System.out.println("Successfully backfilled tenant_id for " + fullTable);
            } catch (Exception e) {
                System.err.println("Exception while checking/backfilling table " + fullTable + ": " + e.getMessage());
            }
        }
        
        return defaultTenant;
    }

    private void seedAdminUser(Tenant tenant) {
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .name("System Admin")
                    .username("admin")
                    .email("admin@example.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role("TENANT_ADMIN")
                    .shop(null)
                    .tenant(tenant)
                    .build();
            userRepository.save(admin);
            System.out.println("Default admin user created.");
        } else {
            // Ensure existing admin is tied to tenant
            User admin = userRepository.findByUsername("admin").get();
            if (admin.getTenant() == null) {
                admin.setTenant(tenant);
                userRepository.save(admin);
            }
        }
    }

    private void seedShopsAndShopAdmins(Tenant tenant) {
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
                        .tenant(tenant)
                        .build();
                System.out.println(shopName + " created.");
                return shopRepository.save(newShop);
            });
            
            if (shop.getTenant() == null) {
                shop.setTenant(tenant);
                shopRepository.save(shop);
            }

            String shopAdminUsername = "shop" + index + "admin";
            if (!userRepository.existsByUsername(shopAdminUsername)) {
                User shopAdmin = User.builder()
                        .name(shopName + " Admin")
                        .username(shopAdminUsername)
                        .email("shop" + index + "@example.com")
                        .password(passwordEncoder.encode("shop123"))
                        .role("SHOP_ADMIN")
                        .shop(shop)
                        .tenant(tenant)
                        .build();
                userRepository.save(shopAdmin);
                System.out.println("Admin for " + shopName + " created.");
            }
        }
    }
}

