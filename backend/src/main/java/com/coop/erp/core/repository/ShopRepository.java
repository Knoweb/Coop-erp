package com.coop.erp.core.repository;

import com.coop.erp.core.entity.Shop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShopRepository extends JpaRepository<Shop, UUID> {
    Optional<Shop> findByCode(String code);
    List<Shop> findByActiveTrue();
    long countByActiveTrue();
}
