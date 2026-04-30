package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.PartnerBlacklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PartnerBlacklistRepository extends JpaRepository<PartnerBlacklist, Long> {
    boolean existsByBusinessLicenseNumber(String businessLicenseNumber);
    boolean existsByRepresentativeCicNumber(String representativeCicNumber);
}
