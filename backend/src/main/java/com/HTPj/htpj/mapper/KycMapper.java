package com.HTPj.htpj.mapper;

import com.HTPj.htpj.dto.response.kyc.KycQueueResponse;
import com.HTPj.htpj.dto.response.kyc.KycVerificationDetailResponse;
import com.HTPj.htpj.entity.PartnerVerification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = KycDocumentMapper.class)
public interface KycMapper {
    @Mapping(source = "legalInformation.legalName", target = "legalName")
    @Mapping(source = "legalInformation.taxCode", target = "taxCode")
    // THÊM 2 DÒNG DƯỚI ĐÂY ĐỂ TRẢ VỀ ID CHO DANH SÁCH
    @Mapping(source = "agency.agencyId", target = "agencyId") // Kiểm tra lại entity Agency là agency_id hay agencyId
    @Mapping(source = "hotel.hotelId", target = "hotelId")         // Entity Hotel của bạn dùng 'id'
    KycQueueResponse toResponse(PartnerVerification entity);

    @Mapping(source = "legalInformation.legalName", target = "legalName")
    @Mapping(source = "legalInformation.taxCode", target = "taxCode")
    @Mapping(source = "legalInformation.businessAddress", target = "businessAddress")
    @Mapping(source = "legalInformation.representativeName", target = "representativeName")
    @Mapping(source = "legalInformation.representativeCICNumber", target = "representativeCICNumber")
    @Mapping(source = "legalInformation.businessLicenseNumber", target = "businessLicenseNumber")
    @Mapping(source = "legalInformation.representativeCICDate", target = "representativeCICDate")
    @Mapping(source = "legalInformation.representativeCICPlace", target = "representativeCICPlace")
    @Mapping(source = "agency.agencyId", target = "agencyId")
    @Mapping(source = "hotel.hotelId", target = "hotelId")
    KycVerificationDetailResponse toDetailResponse(PartnerVerification entity);

}
