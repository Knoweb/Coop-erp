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
}
