package com.coop.erp.admin.repository;

import com.coop.erp.admin.entity.ShopTerminal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShopTerminalRepository extends JpaRepository<ShopTerminal, UUID> {
    List<ShopTerminal> findByShopId(UUID shopId);
    List<ShopTerminal> findByShopIdAndIsActiveTrue(UUID shopId);
    Optional<ShopTerminal> findByShopIdAndTerminalCode(UUID shopId, String terminalCode);
}
