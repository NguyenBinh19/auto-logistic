package com.HTPj.htpj.repository;

import com.HTPj.htpj.entity.PartnerLegalInformation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PartnerLegalInformationRepository
        extends JpaRepository<PartnerLegalInformation, Integer> {
}