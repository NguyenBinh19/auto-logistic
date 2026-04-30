package com.HTPj.htpj.mapper;

import com.HTPj.htpj.dto.response.partner.ListStaffResponse;
import com.HTPj.htpj.entity.Users;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PartnerMapper {

    @Mapping(target = "permission", expression = "java(getPermission(user))")
    ListStaffResponse toListStaffResponse(Users user);

    default String getPermission(Users user) {
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            return null;
        }

        return user.getRoles()
                .stream()
                .map(role -> role.getName())
                .reduce((r1, r2) -> r1 + "," + r2)
                .orElse(null);
    }
}
