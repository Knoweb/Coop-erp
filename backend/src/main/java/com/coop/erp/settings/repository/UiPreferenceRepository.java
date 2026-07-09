package com.coop.erp.settings.repository;

import com.coop.erp.settings.entity.UiPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UiPreferenceRepository extends JpaRepository<UiPreference, UUID> {
    Optional<UiPreference> findByScopeTypeAndScopeId(String scopeType, String scopeId);
}
