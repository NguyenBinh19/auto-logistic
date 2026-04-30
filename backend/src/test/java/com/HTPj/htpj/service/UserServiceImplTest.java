//package com.HTPj.htpj.service;
//
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
//import static org.junit.jupiter.api.Assertions.assertThrows;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.ArgumentMatchers.anyString;
//import static org.mockito.Mockito.*;
//
//import java.io.IOException;
//import java.util.Collections;
//import java.util.HashSet;
//import java.util.Optional;
//
//import com.HTPj.htpj.constant.PredefinedRole;
//import com.HTPj.htpj.dto.request.BanUserRequest;
//import com.HTPj.htpj.dto.request.ProfileUpdateRequest;
//import com.HTPj.htpj.dto.request.UserCreationRequest;
//import com.HTPj.htpj.dto.request.UserUpdateRequest;
//import com.HTPj.htpj.dto.response.UserResponse;
//import com.HTPj.htpj.entity.Role;
//import com.HTPj.htpj.entity.Users;
//import com.HTPj.htpj.exception.AppException;
//import com.HTPj.htpj.exception.ErrorCode;
//import com.HTPj.htpj.mapper.UserMapper;
//import com.HTPj.htpj.repository.RoleRepository;
//import com.HTPj.htpj.repository.UserRepository;
//import com.HTPj.htpj.service.impl.UserServiceImpl;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.mock.web.MockMultipartFile;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.context.SecurityContext;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.security.oauth2.jwt.Jwt;
//
//@ExtendWith(MockitoExtension.class)
//class UserServiceImplTest {
//
//    @Mock UserRepository userRepository;
//    @Mock RoleRepository roleRepository;
//    @Mock UserMapper userMapper;
//    @Mock PasswordEncoder passwordEncoder;
//    @Mock EmailService emailService;
//    @Mock S3Service s3Service;
//
//    @InjectMocks UserServiceImpl userService;
//
//    private UserCreationRequest creationRequest;
//    private UserResponse userResponse;
//    private Users mockUser;
//    private MockMultipartFile validFile;
//    @BeforeEach
//    void setUp() {
//        creationRequest = UserCreationRequest.builder()
//                .email("nguyenbinh@gmail.com")
//                .password("pass123")
//                .phone("0123456789")
//                .role(PredefinedRole.HOTEL_MANAGER_ROLE)
//                .build();
//
//        mockUser = Users.builder()
//                .id("user-123")
//                .email("nguyenbinh@gmail.com")
//                .username("binh123")
//                .status("UNVERIFIED")
//                .roles(new HashSet<>())
//                .build();
//
//        userResponse = UserResponse.builder()
//                .id("user-123")
//                .email("nguyenbinh@gmail.com")
//                .username("binh123")
//                .build();
//
//        validFile = new MockMultipartFile(
//                "file",
//                "test-image.jpg",
//                "image/jpeg",
//                "some-image-data".getBytes()
//        );
//    }
//
//    // --- TEST CREATE USER ---
//
//    @Test
//    void createUser_Success() {
//        // GIVEN
//        when(userRepository.existsByEmail(anyString())).thenReturn(false);
//        when(userMapper.toUser(any())).thenReturn(mockUser);
//        when(passwordEncoder.encode(anyString())).thenReturn("hashed_pass");
//        when(userRepository.save(any())).thenReturn(mockUser);
//        when(userMapper.toUserResponse(any())).thenReturn(userResponse);
//
//        // WHEN
//        var response = userService.createUser(creationRequest);
//
//        // THEN
//        assertThat(response.getEmail()).isEqualTo("nguyenbinh@gmail.com");
//        verify(emailService).sendOtpEmail(eq("nguyenbinh@gmail.com"), anyString(), any());
//        verify(userRepository).save(argThat(u -> u.getOtp() != null));
//    }
//    @Test
//    void createUser_InvalidRole_Fail() {
//        // GIVEN
//        creationRequest.setRole("ADMIN_FAKE");
//
//        // WHEN & THEN
//        AppException ex = assertThrows(AppException.class, () -> userService.createUser(creationRequest));
//        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.INVALID_ROLE_SELECTION);
//    }
//    @Test
//    void createUser_UserExisted_Fail() {
//        // GIVEN
//        when(userRepository.existsByEmail(anyString())).thenReturn(true);
//
//        // WHEN & THEN
//        AppException ex = assertThrows(AppException.class, () -> userService.createUser(creationRequest));
//        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.USER_EXISTED);
//    }
//
//    @Test
//    void updateUser_Success() {
//        // GIVEN
//        String userId = "user-123";
//        UserUpdateRequest request = UserUpdateRequest.builder()
//                .password("new-password")
//                .roles(Collections.singletonList(PredefinedRole.USER_ROLE))
//                .build();
//
//        Role userRole = Role.builder().name(PredefinedRole.USER_ROLE).build();
//
//        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
//        when(passwordEncoder.encode(anyString())).thenReturn("hashed-new-password");
//        when(roleRepository.findAllById(any())).thenReturn(Collections.singletonList(userRole));
//        when(userRepository.save(any())).thenReturn(mockUser);
//
//        // Giả lập sau khi save, mapper trả về đúng username để thoả mãn PostAuthorize
//        userResponse.setUsername("binh123");
//        when(userMapper.toUserResponse(any())).thenReturn(userResponse);
//
//        // WHEN
//        var response = userService.updateUser(userId, request);
//
//        // THEN
//        assertThat(response.getUsername()).isEqualTo("binh123");
//        verify(passwordEncoder).encode("new-password");
//        verify(userRepository).save(argThat(u -> u.getRoles().size() == 1));
//    }
//
//    @Test
//    void updateUser_UserNotFound_Fail() {
//        // GIVEN
//        when(userRepository.findById(anyString())).thenReturn(Optional.empty());
//
//        // WHEN & THEN
//        AppException ex = assertThrows(AppException.class,
//                () -> userService.updateUser("invalid-id", new UserUpdateRequest()));
//        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.USER_NOT_EXISTED);
//    }
//    @Test
//    void deleteUser_Success() {
//        // GIVEN
//        String userId = "user-to-delete";
//
//        // WHEN
//        userService.deleteUser(userId);
//
//        // THEN
//        verify(userRepository, times(1)).deleteById(userId);
//    }
//    @Test
//    void deleteUser_UserNotFound_Fail() {
//        // GIVEN
//        when(userRepository.existsById(anyString())).thenReturn(false);
//
//        // WHEN & THEN
//        assertThrows(AppException.class, () -> userService.deleteUser("invalid-id"));
//        verify(userRepository, never()).deleteById(anyString());
//    }
//    @Test
//    void getUsers_Success() {
//        // GIVEN
//        Users user1 = Users.builder().id("1").email("u1@gmail.com").build();
//        Users user2 = Users.builder().id("2").email("u2@gmail.com").build();
//
//        when(userRepository.findAll()).thenReturn(java.util.List.of(user1, user2));
//        when(userMapper.toUserResponse(user1)).thenReturn(UserResponse.builder().id("1").build());
//        when(userMapper.toUserResponse(user2)).thenReturn(UserResponse.builder().id("2").build());
//
//        // WHEN
//        var result = userService.getUsers();
//
//        // THEN
//        assertThat(result).hasSize(2);
//        assertThat(result.get(0).getId()).isEqualTo("1");
//        verify(userRepository).findAll();
//    }
//    @Test
//    void getMyInfo_Success() {
//        // GIVEN
//        mockJwtContext("user-123");
//        when(userRepository.findById("user-123")).thenReturn(Optional.of(mockUser));
//        when(userMapper.toUserResponse(mockUser)).thenReturn(userResponse);
//
//        // WHEN
//        var response = userService.getMyInfo();
//
//        // THEN
//        assertThat(response.getId()).isEqualTo("user-123");
//        verify(userRepository).findById("user-123");
//    }
//
//    @Test
//    void getMyInfo_Unauthenticated_Fail() {
//        // GIVEN: Trống SecurityContext
//        SecurityContextHolder.clearContext();
//
//        // WHEN & THEN
//        assertThrows(AppException.class, () -> userService.getMyInfo());
//    }
//
//    @Test
//    void updateMyProfile_Success() {
//        // GIVEN
//        mockJwtContext("user-123");
//        ProfileUpdateRequest request = new ProfileUpdateRequest("0987654321", "123 New Street");
//
//        // Giả lập user hiện tại trong DB
//        mockUser.setPhone("0000000000");
//        mockUser.setAddress("Old Address");
//
//        when(userRepository.findById("user-123")).thenReturn(Optional.of(mockUser));
//        when(userRepository.save(any(Users.class))).thenReturn(mockUser);
//
//        // Giả lập response sau khi map
//        UserResponse expectedResponse = UserResponse.builder()
//                .phone("0987654321")
//                .address("123 New Street")
//                .build();
//        when(userMapper.toUserResponse(any())).thenReturn(expectedResponse);
//
//        // WHEN
//        var response = userService.updateMyProfile(request);
//
//        // THEN
//        assertThat(response.getPhone()).isEqualTo("0987654321");
//        verify(userRepository).save(argThat(u ->
//                u.getPhone().equals("0987654321") && u.getAddress().equals("123 New Street")
//        ));
//    }
//
//    @Test
//    void updateMyProfile_OnlyPhone_Success() {
//        // GIVEN
//        mockJwtContext("user-123");
//        ProfileUpdateRequest request = new ProfileUpdateRequest();
//        request.setPhone("0111222333");
//        // request.setAddress(null);
//
//        mockUser.setAddress("Hanoi, Vietnam"); // Dữ liệu cũ cần giữ lại
//
//        when(userRepository.findById("user-123")).thenReturn(Optional.of(mockUser));
//        when(userRepository.save(any(Users.class))).thenReturn(mockUser);
//        when(userMapper.toUserResponse(any())).thenReturn(userResponse);
//
//        // WHEN
//        userService.updateMyProfile(request);
//
//        // THEN
//        verify(userRepository).save(argThat(u ->
//                u.getPhone().equals("0111222333") && u.getAddress().equals("Hanoi, Vietnam")
//        ));
//    }
//
//    @Test
//    void updateMyProfile_Unauthenticated_Fail() {
//        // GIVEN
//        SecurityContextHolder.clearContext();
//
//        // WHEN & THEN
//        assertThrows(AppException.class, () -> userService.updateMyProfile(new ProfileUpdateRequest()));
//    }
//
//    // --- TEST AVATAR LOGIC ---
//    @Test
//    void updateMyAvatar_InvalidFormat_Fail() {
//        // GIVEN
//        mockJwtContext("user-123");
//        MockMultipartFile file = new MockMultipartFile("file", "test.pdf", "application/pdf", "data".getBytes());
//
//        // WHEN & THEN
//        AppException ex = assertThrows(AppException.class, () -> userService.updateMyAvatar(file));
//        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.INVALID_IMAGE_FORMAT);
//    }
//    @Test
//    void updateMyAvatar_NoExtension_Fail() {
//        MockMultipartFile file = new MockMultipartFile("file", "no-extension-file", "image/jpeg", "data".getBytes());
//        // Giả sử getFileExtension sẽ throw lỗi hoặc return empty dẫn đến lỗi upload
//        assertThrows(AppException.class, () -> userService.updateMyAvatar(file));
//    }
//
//    @Test
//    void updateMyAvatar_NoOldAvatar_Success() throws IOException {
//        Users user = Users.builder().id("user-1").avatarUrl(null).build();
//        mockJwtContext("user-1");
//        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
//
//        userService.updateMyAvatar(validFile);
//
//        verify(s3Service, never()).deleteFile(anyString()); // Quan trọng: không delete file cũ
//        verify(s3Service).uploadFile(any(), anyString());
//    }
//    @Test
//    void removeMyAvatar_Success() {
//        // GIVEN
//        mockJwtContext("user-123");
//        mockUser.setAvatarUrl("https://my-bucket.s3.amazonaws.com/avatars/old-photo.jpg");
//
//        when(userRepository.findById("user-123")).thenReturn(Optional.of(mockUser));
//        when(userRepository.save(any())).thenReturn(mockUser);
//        when(userMapper.toUserResponse(any())).thenReturn(userResponse);
//
//        // WHEN
//        userService.removeMyAvatar();
//
//        // THEN
//        verify(s3Service).deleteFile(anyString());
//        assertThat(mockUser.getAvatarUrl()).isNull();
//    }
//
//
//    @Test
//    void banUser_BanAdmin_Fail() {
//        // GIVEN
//        mockUser.setRoles(new HashSet<>(Collections.singleton(
//                com.HTPj.htpj.entity.Role.builder().name(PredefinedRole.ADMIN_ROLE).build()
//        )));
//        when(userRepository.findById("user-123")).thenReturn(Optional.of(mockUser));
//        BanUserRequest request = new BanUserRequest(true, "Reason");
//
//        // WHEN & THEN
//        AppException ex = assertThrows(AppException.class, () -> userService.banUser("user-123", request));
//        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.CANNOT_BAN_ADMIN);
//    }
//
//    @Test
//    void banUser_Success() {
//        // GIVEN
//        String userId = "user-123";
//        // Trường hợp khóa user
//        BanUserRequest banRequest = new BanUserRequest(true, "Vi phạm chính sách");
//
//        // Giả lập user mục tiêu không có quyền ADMIN
//        Role userRole = Role.builder().name(PredefinedRole.USER_ROLE).build();
//        mockUser.setRoles(new HashSet<>(Collections.singleton(userRole)));
//        mockUser.setStatus("ACTIVE");
//
//        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
//        when(userRepository.save(any(Users.class))).thenReturn(mockUser);
//
//        // Giả lập map sang response với status BANNED
//        UserResponse expectedResponse = UserResponse.builder()
//                .id(userId)
//                .status("BANNED")
//                .build();
//        when(userMapper.toUserResponse(any(Users.class))).thenReturn(expectedResponse);
//
//        // WHEN
//        var response = userService.banUser(userId, banRequest);
//
//        // THEN
//        assertThat(response.getStatus()).isEqualTo("BANNED");
//
//        // Kiểm tra xem repository có được gọi save với status là BANNED hay chưa
//        verify(userRepository).save(argThat(u -> u.getStatus().equals("BANNED")));
//    }
//
//    @Test
//    void unbanUser_Success() {
//        // GIVEN - Trường hợp mở khóa user (banned = false)
//        String userId = "user-123";
//        BanUserRequest unbanRequest = new BanUserRequest(false, "Đã khiếu nại thành công");
//
//        mockUser.setStatus("BANNED");
//        mockUser.setRoles(new HashSet<>()); // Không phải admin
//
//        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
//        when(userRepository.save(any(Users.class))).thenReturn(mockUser);
//
//        UserResponse expectedResponse = UserResponse.builder()
//                .id(userId)
//                .status("ACTIVE")
//                .build();
//        when(userMapper.toUserResponse(any(Users.class))).thenReturn(expectedResponse);
//
//        // WHEN
//        var response = userService.banUser(userId, unbanRequest);
//
//        // THEN
//        assertThat(response.getStatus()).isEqualTo("ACTIVE");
//        verify(userRepository).save(argThat(u -> u.getStatus().equals("ACTIVE")));
//    }
//
//    @Test
//    void banUser_UserNotFound_Fail() {
//        // GIVEN
//        String userId = "non-existent-id";
//        BanUserRequest request = new BanUserRequest(true, "Reason");
//
//        // Giả lập không tìm thấy user trong Database
//        when(userRepository.findById(userId)).thenReturn(Optional.empty());
//
//        // WHEN & THEN
//        AppException ex = assertThrows(AppException.class, () -> userService.banUser(userId, request));
//
//        // Kiểm tra ErrorCode có đúng là USER_NOT_EXISTED không
//        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.USER_NOT_EXISTED);
//
//        // Đảm bảo không có lệnh save nào được gọi sau đó
//        verify(userRepository, never()).save(any());
//        verifyNoInteractions(userMapper);
//    }
//
//    // --- TEST GET USER BY ID ---
//
//    @Test
//    void getUser_Success() {
//        // GIVEN
//        String userId = "user-123";
//        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
//        when(userMapper.toUserResponse(mockUser)).thenReturn(userResponse);
//
//        // WHEN
//        var response = userService.getUser(userId);
//
//        // THEN
//        assertThat(response.getId()).isEqualTo(userId);
//        assertThat(response.getEmail()).isEqualTo("nguyenbinh@gmail.com");
//        verify(userRepository).findById(userId);
//    }
//
//    @Test
//    void getUser_UserNotFound_Fail() {
//        // GIVEN
//        String userId = "non-existent-id";
//        when(userRepository.findById(userId)).thenReturn(Optional.empty());
//
//        // WHEN & THEN
//        AppException ex = assertThrows(AppException.class, () -> userService.getUser(userId));
//
//        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.USER_NOT_EXISTED);
//        verify(userRepository).findById(userId);
//        verifyNoInteractions(userMapper); // Đảm bảo mapper không được gọi nếu không có data
//    }
//    // --- HELPER ---
//
//    /**
//     * Mô phỏng JWT Authentication trong SecurityContext
//     * Vì getCurrentUserr() ép kiểu sang Jwt và lấy claim "userId"
//     */
//    private void mockJwtContext(String userId) {
//        Jwt jwt = mock(Jwt.class);
//        // Thêm lenient() vào trước các khi gọi when()
//        lenient().when(jwt.getClaim("userId")).thenReturn(userId);
//
//        Authentication auth = mock(Authentication.class);
//        lenient().when(auth.getPrincipal()).thenReturn(jwt);
//
//        SecurityContext securityContext = mock(SecurityContext.class);
//        lenient().when(securityContext.getAuthentication()).thenReturn(auth);
//
//        SecurityContextHolder.setContext(securityContext);
//    }
//}