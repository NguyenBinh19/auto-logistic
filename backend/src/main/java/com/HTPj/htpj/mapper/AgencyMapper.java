package com.HTPj.htpj.mapper;

import com.HTPj.htpj.dto.response.agency.AgencyDetailResponse;
import com.HTPj.htpj.dto.response.agency.AgencyResponse;
import com.HTPj.htpj.dto.response.kyc.VerificationInfoResponse;
import com.HTPj.htpj.entity.Agency;
import com.HTPj.htpj.entity.PartnerLegalInformation;
import com.HTPj.htpj.entity.PartnerVerification;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AgencyMapper {

    AgencyResponse toAgencyResponse(Agency agency);

    default AgencyDetailResponse toAgencyDetailResponse(Agency agency, PartnerVerification verification) {

        PartnerLegalInformation legal = verification.getLegalInformation();

        VerificationInfoResponse verificationInfoResponse = VerificationInfoResponse.builder()
                .verificationId(verification.getId())
                .legalInformationId(legal.getId())
                .legalName(legal.getLegalName())
                .taxCode(legal.getTaxCode())
                .businessLicenseNumber(legal.getBusinessLicenseNumber())
                .representativeName(legal.getRepresentativeName())
                .representativeCICNumber(legal.getRepresentativeCICNumber())
                .build();

        return AgencyDetailResponse.builder()
                .agencyId(agency.getAgencyId())
                .agencyName(agency.getAgencyName())
                .email(agency.getEmail())
                .contactPhone(agency.getContactPhone())
                .hotline(agency.getHotline())
                .address(agency.getAddress())
                .creditLimit(agency.getCreditLimit())
                .currentCredit(agency.getCurrentCredit())
                .walletBalance(agency.getWalletBalance())
                .status(agency.getStatus())
                .createdAt(agency.getCreatedAt())
                .updatedAt(agency.getUpdatedAt())
                .verification(verificationInfoResponse)
                .rankId(agency.getRank().getId())
                .rankName(agency.getRank().getRankName())
                .build();
    }
}