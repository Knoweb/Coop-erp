package com.coop.erp.inventory.service;

import com.coop.erp.core.entity.Shop;
import com.coop.erp.core.entity.User;
import com.coop.erp.core.repository.UserRepository;
import com.coop.erp.inventory.dto.ShopProductCountDto;
import com.coop.erp.inventory.repository.ItemProductRepository;
import com.coop.erp.inventory.repository.ShopItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ShopItemRepository shopItemRepository;
    private final ItemProductRepository itemProductRepository;
    private final UserRepository userRepository;

    private Shop getCurrentUserShop() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getShop() == null) {
            throw new RuntimeException("User is not assigned to any shop");
        }
        return user.getShop();
    }

    public long getCurrentShopSelectedProductCount() {
        Shop currentShop = getCurrentUserShop();
        return shopItemRepository.countByShopIdAndIsActiveTrue(currentShop.getId());
    }

    public List<ShopProductCountDto> getAllShopSelectedProductCounts() {
        return shopItemRepository.countAllShopSelectedProducts();
    }

    public long getTotalProductCount() {
        return itemProductRepository.countByIsActiveTrue();
    }
}
