//package com.HTPj.htpj.service;
//
//import com.HTPj.htpj.dto.request.RoleRequest;
//import com.HTPj.htpj.dto.response.RoleResponse;
//import com.HTPj.htpj.entity.Permission;
//import com.HTPj.htpj.entity.Role;
//import com.HTPj.htpj.mapper.RoleMapper;
//import com.HTPj.htpj.repository.PermissionRepository;
//import com.HTPj.htpj.repository.RoleRepository;
//import com.HTPj.htpj.service.impl.RoleServiceImpl;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//
//import java.util.Collections;
//import java.util.List;
//import java.util.Set;
//
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//class RoleServiceImplTest {
//
//    @Mock RoleRepository roleRepository;
//    @Mock PermissionRepository permissionRepository;
//    @Mock RoleMapper roleMapper;
//
//    @InjectMocks
//    RoleServiceImpl roleService;
//
//    @Test
//    void create_Success() {
//        RoleRequest request = RoleRequest.builder()
//                .name("ADMIN")
//                .description("Admin role")
//                .permissions(Set.of("READ_DATA", "WRITE_DATA"))
//                .build();
//
//        Role role = Role.builder().name("ADMIN").build();
//        Permission p1 = Permission.builder().name("READ_DATA").build();
//        Permission p2 = Permission.builder().name("WRITE_DATA").build();
//
//        RoleResponse expectedResponse = RoleResponse.builder().name("ADMIN").build();
//
//        when(roleMapper.toRole(request)).thenReturn(role);
//        when(permissionRepository.findAllById(request.getPermissions())).thenReturn(List.of(p1, p2));
//        when(roleRepository.save(any(Role.class))).thenReturn(role);
//        when(roleMapper.toRoleResponse(role)).thenReturn(expectedResponse);
//
//        RoleResponse result = roleService.create(request);
//
//        assertThat(result).isNotNull();
//        assertThat(result.getName()).isEqualTo("ADMIN");
//        verify(permissionRepository).findAllById(any());
//        verify(roleRepository).save(role);
//    }
//
//    @Test
//    void getAll_Success() {
//        Role role = Role.builder().name("USER").build();
//        RoleResponse response = RoleResponse.builder().name("USER").build();
//
//        when(roleRepository.findAll()).thenReturn(List.of(role));
//        when(roleMapper.toRoleResponse(role)).thenReturn(response);
//
//        List<RoleResponse> result = roleService.getAll();
//
//        assertThat(result).hasSize(1);
//        assertThat(result.get(0).getName()).isEqualTo("USER");
//        verify(roleRepository).findAll();
//    }
//
//    @Test
//    void delete_Success() {
//        String roleName = "STAFF";
//        doNothing().when(roleRepository).deleteById(roleName);
//
//        roleService.delete(roleName);
//
//        verify(roleRepository, times(1)).deleteById(roleName);
//    }
//
//    @Test
//    void create_WithEmptyPermissions_Success() {
//        RoleRequest request = RoleRequest.builder()
//                .name("GUEST")
//                .permissions(Collections.emptySet())
//                .build();
//
//        Role role = new Role();
//        when(roleMapper.toRole(request)).thenReturn(role);
//        when(permissionRepository.findAllById(any())).thenReturn(Collections.emptyList());
//        when(roleRepository.save(any())).thenReturn(role);
//        when(roleMapper.toRoleResponse(any())).thenReturn(new RoleResponse());
//
//        roleService.create(request);
//
//        assertThat(role.getPermissions()).isEmpty();
//        verify(roleRepository).save(any());
//    }
//}
