package com.coop.erp.admin.controller;

import com.coop.erp.core.entity.Shop;
import com.coop.erp.core.repository.ShopRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/shops")
public class AdminShopController {

    @Autowired
    private ShopRepository shopRepository;

    @PostMapping
    public Shop createShop(@RequestBody Shop shop) {
        return shopRepository.save(shop);
    }

    @GetMapping
    public List<Shop> getAllShops() {
        return shopRepository.findAll();
    }

    @PutMapping("/{id}")
    public Shop updateShop(@PathVariable java.util.UUID id, @RequestBody Shop shopDetails) {
        Shop shop = shopRepository.findById(id).orElseThrow(() -> new RuntimeException("Shop not found"));
        shop.setName(shopDetails.getName());
        shop.setCode(shopDetails.getCode());
        shop.setAddress(shopDetails.getAddress());
        shop.setContactNumber(shopDetails.getContactNumber());
        shop.setActive(shopDetails.getActive());
        return shopRepository.save(shop);
    }

    @PatchMapping("/{id}/status")
    public Shop toggleShopStatus(@PathVariable java.util.UUID id) {
        Shop shop = shopRepository.findById(id).orElseThrow(() -> new RuntimeException("Shop not found"));
        shop.setActive(!shop.getActive());
        return shopRepository.save(shop);
    }
}
