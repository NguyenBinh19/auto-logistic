package com.HTPj.htpj.mapper;

import com.HTPj.htpj.dto.response.kyc.KycDocumentResponse;
import com.HTPj.htpj.entity.KycDocument;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface KycDocumentMapper {

    @Mapping(target = "fileUrl", ignore = true)
    @Mapping(target = "adminComment", ignore = true)
    KycDocumentResponse toResponse(KycDocument entity);

}
