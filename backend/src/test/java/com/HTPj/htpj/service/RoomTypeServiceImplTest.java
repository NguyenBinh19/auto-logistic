//package com.HTPj.htpj.service;
//
//import com.HTPj.htpj.dto.request.roomtype.CreateRoomTypeRequest;
//import com.HTPj.htpj.dto.request.roomtype.UpdateRoomTypeRequest;
//import com.HTPj.htpj.dto.response.roomtype.RoomTypeDetailResponse;
//import com.HTPj.htpj.entity.Hotel;
//import com.HTPj.htpj.entity.RoomType;
//import com.HTPj.htpj.entity.RoomTypeImage;
//import com.HTPj.htpj.entity.Users;
//import com.HTPj.htpj.exception.AppException;
//import com.HTPj.htpj.exception.ErrorCode;
//import com.HTPj.htpj.repository.RoomTypeImageRepository;
//import com.HTPj.htpj.repository.RoomTypeRepository;
//import com.HTPj.htpj.repository.UserRepository;
//import com.HTPj.htpj.service.impl.RoomTypeServiceImpl;
//import org.junit.jupiter.api.AfterEach;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.ArgumentCaptor;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.mock.web.MockMultipartFile;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.context.SecurityContext;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.oauth2.jwt.Jwt;
//
//import java.math.BigDecimal;
//import java.util.ArrayList;
//import java.util.List;
//import java.util.Optional;
//
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.assertj.core.api.Assertions.assertThatThrownBy;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.ArgumentMatchers.anyString;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//class RoomTypeServiceImplTest {
//
//    @Mock
//    private RoomTypeRepository roomTypeRepository;
//
//    @Mock
//    private RoomTypeImageRepository roomTypeImageRepository;
//
//    @Mock
//    private S3Service s3Service;
//
//    @Mock
//    private UserRepository usersRepository;
//
//    @Mock
//    private SecurityContext securityContext;
//
//    @Mock
//    private Authentication authentication;
//
//    @InjectMocks
//    private RoomTypeServiceImpl roomTypeService;
//
//    @BeforeEach
//    void setUpSecurityContext() {
//        SecurityContextHolder.setContext(securityContext);
//        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
//    }
//
//    @AfterEach
//    void clearSecurityContext() {
//        SecurityContextHolder.clearContext();
//    }
//
//    @Test
//    void createRoomType_Success_WithFiles() throws Exception {
//        String userId = "user-123";
//        Jwt jwt = buildJwt(userId);
//        when(authentication.getPrincipal()).thenReturn(jwt);
//
//        Hotel hotel = Hotel.builder().hotelId(7).hotelName("Demo Hotel").address("Demo Address").build();
//        Users user = Users.builder().id(userId).hotel(hotel).build();
//        when(usersRepository.findById(userId)).thenReturn(Optional.of(user));
//        when(roomTypeRepository.existsByRoomCode("DELUXE-1")).thenReturn(false);
//        when(roomTypeRepository.save(any(RoomType.class))).thenAnswer(invocation -> {
//            RoomType roomType = invocation.getArgument(0);
//            roomType.setRoomTypeId(99);
//            return roomType;
//        });
//        when(roomTypeImageRepository.save(any(RoomTypeImage.class))).thenAnswer(invocation -> invocation.getArgument(0));
//
//        CreateRoomTypeRequest request = CreateRoomTypeRequest.builder()
//                .roomCode("DELUXE-1")
//                .roomTitle("Deluxe Room")
//                .description("Spacious room with sea view")
//                .basePrice(new BigDecimal("150.00"))
//                .maxAdults(2)
//                .maxChildren(1)
//                .roomArea(new BigDecimal("32.50"))
//                .bedType("King")
//                .totalRooms(5)
//                .amenities(List.of("WiFi", "TV", "AC"))
//                .build();
//
//        MockMultipartFile image = new MockMultipartFile(
//                "files",
//                "room-1.png",
//                "image/png",
//                new byte[]{1, 2, 3}
//        );
//
//        RoomTypeDetailResponse response = roomTypeService.createRoomType(request, new MockMultipartFile[]{image});
//
//        ArgumentCaptor<RoomType> roomTypeCaptor = ArgumentCaptor.forClass(RoomType.class);
//        verify(roomTypeRepository).save(roomTypeCaptor.capture());
//        RoomType savedRoomType = roomTypeCaptor.getValue();
//
//        assertThat(savedRoomType.getHotel()).isSameAs(hotel);
//        assertThat(savedRoomType.getRoomCode()).isEqualTo("DELUXE-1");
//        assertThat(savedRoomType.getRoomTitle()).isEqualTo("Deluxe Room");
//        assertThat(savedRoomType.getRoomStatus()).isEqualTo("active");
//        assertThat(savedRoomType.getAmenities()).isEqualTo("[\"WiFi\",\"TV\",\"AC\"]");
//
//        ArgumentCaptor<String> keyCaptor = ArgumentCaptor.forClass(String.class);
//        verify(s3Service).uploadFile(any(MockMultipartFile.class), keyCaptor.capture());
//        assertThat(keyCaptor.getValue()).startsWith("room-types/99/");
//
//        verify(roomTypeImageRepository).save(any(RoomTypeImage.class));
//        assertThat(response.getRoomTypeId()).isEqualTo(99);
//        assertThat(response.getHotelId()).isEqualTo(7);
//        assertThat(response.getRoomCode()).isEqualTo("DELUXE-1");
//        assertThat(response.getRoomTitle()).isEqualTo("Deluxe Room");
//        assertThat(response.getAmenities()).containsExactly("WiFi", "TV", "AC");
//        assertThat(response.getImages()).isNull();
//    }
//
//    @Test
//    void createRoomType_UserNotExisted() throws Exception {
//        String userId = "missing-user";
//        when(authentication.getPrincipal()).thenReturn(buildJwt(userId));
//        when(usersRepository.findById(userId)).thenReturn(Optional.empty());
//
//        CreateRoomTypeRequest request = baseRequest();
//
//        assertThatThrownBy(() -> roomTypeService.createRoomType(request, null))
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.USER_NOT_EXISTED));
//
//        verify(usersRepository).findById(userId);
//        verify(roomTypeRepository, never()).existsByRoomCode(anyString());
//        verify(roomTypeRepository, never()).save(any(RoomType.class));
//        verify(s3Service, never()).uploadFile(any(), anyString());
//        verify(roomTypeImageRepository, never()).save(any(RoomTypeImage.class));
//    }
//
//    @Test
//    void createRoomType_HotelNotFound() throws Exception {
//        String userId = "user-456";
//        when(authentication.getPrincipal()).thenReturn(buildJwt(userId));
//        when(usersRepository.findById(userId)).thenReturn(Optional.of(Users.builder().id(userId).hotel(null).build()));
//
//        CreateRoomTypeRequest request = baseRequest();
//
//        assertThatThrownBy(() -> roomTypeService.createRoomType(request, null))
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.HOTEL_NOT_FOUND));
//
//        verify(usersRepository).findById(userId);
//        verify(roomTypeRepository, never()).existsByRoomCode(anyString());
//        verify(roomTypeRepository, never()).save(any(RoomType.class));
//        verify(s3Service, never()).uploadFile(any(), anyString());
//        verify(roomTypeImageRepository, never()).save(any(RoomTypeImage.class));
//    }
//
//    @Test
//    void createRoomType_RoomTypeExisted() throws Exception {
//        String userId = "user-789";
//        when(authentication.getPrincipal()).thenReturn(buildJwt(userId));
//
//        Hotel hotel = Hotel.builder().hotelId(11).hotelName("Hotel A").address("Addr").build();
//        when(usersRepository.findById(userId)).thenReturn(Optional.of(Users.builder().id(userId).hotel(hotel).build()));
//        when(roomTypeRepository.existsByRoomCode("DUP-1")).thenReturn(true);
//
//        CreateRoomTypeRequest request = baseRequest();
//        request.setRoomCode("DUP-1");
//
//        assertThatThrownBy(() -> roomTypeService.createRoomType(request, null))
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.ROOM_TYPE_EXISTED));
//
//        verify(usersRepository).findById(userId);
//        verify(roomTypeRepository).existsByRoomCode("DUP-1");
//        verify(roomTypeRepository, never()).save(any(RoomType.class));
//        verify(s3Service, never()).uploadFile(any(), anyString());
//        verify(roomTypeImageRepository, never()).save(any(RoomTypeImage.class));
//    }
//
//    private Jwt buildJwt(String userId) {
//        return Jwt.withTokenValue("token")
//                .header("alg", "none")
//                .claim("userId", userId)
//                .build();
//    }
//
//    private CreateRoomTypeRequest baseRequest() {
//        return CreateRoomTypeRequest.builder()
//                .roomCode("DELUXE-1")
//                .roomTitle("Deluxe Room")
//                .description("Spacious room with sea view")
//                .basePrice(new BigDecimal("150.00"))
//                .maxAdults(2)
//                .maxChildren(1)
//                .roomArea(new BigDecimal("32.50"))
//                .bedType("King")
//                .totalRooms(5)
//                .amenities(List.of("WiFi", "TV", "AC"))
//                .build();
//    }
//
//
//    // update room type
//    @Test
//    void updateRoomType_Success() throws Exception {
//        Integer roomTypeId = 99;
//        Hotel hotel = Hotel.builder().hotelId(7).hotelName("Demo Hotel").address("Demo Address").build();
//        RoomType roomType = RoomType.builder()
//                .roomTypeId(roomTypeId)
//                .hotel(hotel)
//                .roomCode("DELUXE-1")
//                .roomTitle("Old title")
//                .description("Old description")
//                .basePrice(new BigDecimal("120.00"))
//                .maxAdults(2)
//                .maxChildren(1)
//                .roomArea(new BigDecimal("30.00"))
//                .bedType("Queen")
//                .totalRooms(4)
//                .amenities("[\"Old\"]")
//                .roomStatus("active")
//                .build();
//
//        when(roomTypeRepository.findById(roomTypeId)).thenReturn(Optional.of(roomType));
//        when(roomTypeRepository.save(any(RoomType.class))).thenAnswer(invocation -> invocation.getArgument(0));
//
//        RoomTypeImage imageToDelete = RoomTypeImage.builder()
//                .imageId(5)
//                .roomType(roomType)
//                .s3Key("room-types/99/old-image")
//                .build();
//        when(roomTypeImageRepository.findAllById(List.of(5))).thenReturn(List.of(imageToDelete));
//
//        RoomTypeImage imageAfterUpdate = RoomTypeImage.builder()
//                .imageId(10)
//                .roomType(roomType)
//                .s3Key("room-types/99/new-image")
//                .build();
//        when(roomTypeImageRepository.findByRoomType_RoomTypeId(roomTypeId)).thenReturn(List.of(imageAfterUpdate));
//        when(s3Service.getFileUrl("room-types/99/new-image")).thenReturn("https://cdn.example.com/new-image");
//
//        UpdateRoomTypeRequest request = UpdateRoomTypeRequest.builder()
//                .roomTitle("New title")
//                .description("New description")
//                .basePrice(new BigDecimal("180.00"))
//                .maxAdults(3)
//                .maxChildren(2)
//                .roomArea(new BigDecimal("45.50"))
//                .bedType("King")
//                .totalRooms(8)
//                .amenities(List.of("WiFi", "TV", "AC"))
//                .deletedImageIds(List.of(5))
//                .build();
//
//        MockMultipartFile newImage = new MockMultipartFile("files", "new.png", "image/png", new byte[]{9, 8, 7});
//
//        RoomTypeDetailResponse response = roomTypeService.updateRoomType(roomTypeId, request, new MockMultipartFile[]{newImage});
//
//        ArgumentCaptor<RoomType> roomTypeCaptor = ArgumentCaptor.forClass(RoomType.class);
//        verify(roomTypeRepository).save(roomTypeCaptor.capture());
//        RoomType savedRoomType = roomTypeCaptor.getValue();
//
//        assertThat(savedRoomType.getRoomTitle()).isEqualTo("New title");
//        assertThat(savedRoomType.getDescription()).isEqualTo("New description");
//        assertThat(savedRoomType.getBasePrice()).isEqualByComparingTo("180.00");
//        assertThat(savedRoomType.getMaxAdults()).isEqualTo(3);
//        assertThat(savedRoomType.getMaxChildren()).isEqualTo(2);
//        assertThat(savedRoomType.getRoomArea()).isEqualByComparingTo("45.50");
//        assertThat(savedRoomType.getBedType()).isEqualTo("King");
//        assertThat(savedRoomType.getTotalRooms()).isEqualTo(8);
//        assertThat(savedRoomType.getAmenities()).isEqualTo("[\"WiFi\",\"TV\",\"AC\"]");
//
//        verify(roomTypeImageRepository).findAllById(List.of(5));
//        verify(s3Service).deleteFile("room-types/99/old-image");
//        verify(roomTypeImageRepository).delete(imageToDelete);
//
//        ArgumentCaptor<String> uploadKeyCaptor = ArgumentCaptor.forClass(String.class);
//        verify(s3Service).uploadFile(any(MockMultipartFile.class), uploadKeyCaptor.capture());
//        assertThat(uploadKeyCaptor.getValue()).startsWith("room-types/99/");
//        verify(roomTypeImageRepository).save(any(RoomTypeImage.class));
//
//        assertThat(response.getRoomTypeId()).isEqualTo(99);
//        assertThat(response.getHotelId()).isEqualTo(7);
//        assertThat(response.getRoomCode()).isEqualTo("DELUXE-1");
//        assertThat(response.getRoomTitle()).isEqualTo("New title");
//        assertThat(response.getAmenities()).containsExactly("WiFi", "TV", "AC");
//        assertThat(response.getImages()).hasSize(1);
//        assertThat(response.getImages().get(0).getImageId()).isEqualTo(10);
//        assertThat(response.getImages().get(0).getImageUrl()).isEqualTo("https://cdn.example.com/new-image");
//
//    }
//
//    @Test
//    void updateRoomType_NotFound() throws Exception {
//        Integer roomTypeId = 404;
//        when(roomTypeRepository.findById(roomTypeId)).thenReturn(Optional.empty());
//
//        UpdateRoomTypeRequest request = UpdateRoomTypeRequest.builder()
//                .roomTitle("Updated")
//                .amenities(List.of("WiFi"))
//                .build();
//
//        assertThatThrownBy(() -> roomTypeService.updateRoomType(roomTypeId, request, null))
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.ROOM_TYPE_NOT_FOUND));
//
//        verify(roomTypeRepository).findById(roomTypeId);
//        verify(roomTypeRepository, never()).save(any(RoomType.class));
//        verify(roomTypeImageRepository, never()).findAllById(any());
//        verify(roomTypeImageRepository, never()).findByRoomType_RoomTypeId(any());
//        verify(s3Service, never()).uploadFile(any(), anyString());
//        verify(s3Service, never()).deleteFile(anyString());
//        verify(s3Service, never()).getFileUrl(anyString());
//
//    }
//
//    @Test
//    void updateRoomType_NullFields() throws Exception {
//        Integer roomTypeId = 100;
//        Hotel hotel = Hotel.builder().hotelId(12).hotelName("Hotel B").address("Addr").build();
//        RoomType roomType = RoomType.builder()
//                .roomTypeId(roomTypeId)
//                .hotel(hotel)
//                .roomCode("ROOM-100")
//                .roomTitle("Title")
//                .description("Description")
//                .basePrice(new BigDecimal("90.00"))
//                .maxAdults(2)
//                .maxChildren(1)
//                .roomArea(new BigDecimal("22.00"))
//                .bedType("Twin")
//                .totalRooms(3)
//                .amenities("[\"WiFi\"]")
//                .roomStatus("active")
//                .build();
//
//        when(roomTypeRepository.findById(roomTypeId)).thenReturn(Optional.of(roomType));
//        when(roomTypeRepository.save(any(RoomType.class))).thenAnswer(invocation -> invocation.getArgument(0));
//        when(roomTypeImageRepository.findByRoomType_RoomTypeId(roomTypeId)).thenReturn(new ArrayList<>());
//
//        UpdateRoomTypeRequest request = UpdateRoomTypeRequest.builder().build();
//
//        RoomTypeDetailResponse response = roomTypeService.updateRoomType(roomTypeId, request, null);
//
//        ArgumentCaptor<RoomType> roomTypeCaptor = ArgumentCaptor.forClass(RoomType.class);
//        verify(roomTypeRepository).save(roomTypeCaptor.capture());
//        RoomType savedRoomType = roomTypeCaptor.getValue();
//
//        assertThat(savedRoomType.getRoomTitle()).isNull();
//        assertThat(savedRoomType.getDescription()).isNull();
//        assertThat(savedRoomType.getBasePrice()).isNull();
//        assertThat(savedRoomType.getMaxAdults()).isNull();
//        assertThat(savedRoomType.getMaxChildren()).isNull();
//        assertThat(savedRoomType.getRoomArea()).isNull();
//        assertThat(savedRoomType.getBedType()).isNull();
//        assertThat(savedRoomType.getTotalRooms()).isNull();
//        assertThat(savedRoomType.getAmenities()).isEqualTo("null");
//
//        assertThat(response.getRoomTypeId()).isEqualTo(100);
//        assertThat(response.getHotelId()).isEqualTo(12);
//        assertThat(response.getRoomCode()).isEqualTo("ROOM-100");
//        assertThat(response.getAmenities()).isNull();
//        assertThat(response.getImages()).isEmpty();
//
//        verify(roomTypeImageRepository, never()).findAllById(any());
//        verify(roomTypeImageRepository, never()).save(any(RoomTypeImage.class));
//        verify(s3Service, never()).deleteFile(anyString());
//        verify(s3Service, never()).uploadFile(any(), anyString());
//        verify(s3Service, never()).getFileUrl(anyString());
//
//    }
//
//    @Test
//    void updateRoomType_InvalidAmenitiesFormat() throws Exception {
//        Integer roomTypeId = 101;
//        Hotel hotel = Hotel.builder().hotelId(1).hotelName("Hotel C").address("Addr").build();
//        RoomType roomType = RoomType.builder()
//                .roomTypeId(roomTypeId)
//                .hotel(hotel)
//                .roomCode("ROOM-101")
//                .roomTitle("Title")
//                .build();
//
//        when(roomTypeRepository.findById(roomTypeId)).thenReturn(Optional.of(roomType));
//
//        List<String> amenities = new ArrayList<>();
//        ((List) amenities).add(amenities);
//        UpdateRoomTypeRequest request = UpdateRoomTypeRequest.builder()
//                .roomTitle("New")
//                .amenities(amenities)
//                .build();
//
//        assertThatThrownBy(() -> roomTypeService.updateRoomType(roomTypeId, request, null))
//                .isInstanceOf(RuntimeException.class)
//                .hasMessage("Invalid amenities format");
//
//        verify(roomTypeRepository).findById(roomTypeId);
//        verify(roomTypeRepository, never()).save(any(RoomType.class));
//        verify(roomTypeImageRepository, never()).findAllById(any());
//        verify(roomTypeImageRepository, never()).findByRoomType_RoomTypeId(any());
//        verify(s3Service, never()).deleteFile(anyString());
//        verify(s3Service, never()).uploadFile(any(), anyString());
//        verify(s3Service, never()).getFileUrl(anyString());
//
//    }
//
//    //get detail
//    @Test
//    void getRoomTypeDetail_Success() {
//        Integer roomTypeId = 66;
//        Hotel hotel = Hotel.builder().hotelId(9).hotelName("Hotel D").address("Addr").build();
//        RoomType roomType = RoomType.builder()
//                .roomTypeId(roomTypeId)
//                .hotel(hotel)
//                .roomCode("PREMIUM-66")
//                .roomTitle("Premium")
//                .description("Large room")
//                .basePrice(new BigDecimal("220.00"))
//                .amenities("[\"WiFi\",\"Mini bar\"]")
//                .roomStatus("active")
//                .build();
//
//        RoomTypeImage image1 = RoomTypeImage.builder().imageId(1).roomType(roomType).s3Key("room-types/66/img-1").build();
//        RoomTypeImage image2 = RoomTypeImage.builder().imageId(2).roomType(roomType).s3Key("room-types/66/img-2").build();
//
//        when(roomTypeRepository.findById(roomTypeId)).thenReturn(Optional.of(roomType));
//        when(roomTypeImageRepository.findByRoomType_RoomTypeId(roomTypeId)).thenReturn(List.of(image1, image2));
//        when(s3Service.getFileUrl("room-types/66/img-1")).thenReturn("https://cdn.example.com/img-1");
//        when(s3Service.getFileUrl("room-types/66/img-2")).thenReturn("https://cdn.example.com/img-2");
//
//        RoomTypeDetailResponse response = roomTypeService.getRoomTypeDetail(roomTypeId);
//
//        assertThat(response.getRoomTypeId()).isEqualTo(66);
//        assertThat(response.getHotelId()).isEqualTo(9);
//        assertThat(response.getRoomCode()).isEqualTo("PREMIUM-66");
//        assertThat(response.getRoomTitle()).isEqualTo("Premium");
//        assertThat(response.getAmenities()).containsExactly("WiFi", "Mini bar");
//        assertThat(response.getImages()).hasSize(2);
//        assertThat(response.getImages().get(0).getImageId()).isEqualTo(1);
//        assertThat(response.getImages().get(0).getImageUrl()).isEqualTo("https://cdn.example.com/img-1");
//        assertThat(response.getImages().get(1).getImageId()).isEqualTo(2);
//        assertThat(response.getImages().get(1).getImageUrl()).isEqualTo("https://cdn.example.com/img-2");
//
//        verify(s3Service).getFileUrl("room-types/66/img-1");
//        verify(s3Service).getFileUrl("room-types/66/img-2");
//
//    }
//
//    @Test
//    void getRoomTypeDetail_NotFound() {
//        Integer roomTypeId = 999;
//        when(roomTypeRepository.findById(roomTypeId)).thenReturn(Optional.empty());
//
//        assertThatThrownBy(() -> roomTypeService.getRoomTypeDetail(roomTypeId))
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.ROOM_TYPE_NOT_FOUND));
//
//        verify(roomTypeRepository).findById(roomTypeId);
//        verify(roomTypeImageRepository, never()).findByRoomType_RoomTypeId(any());
//        verify(s3Service, never()).getFileUrl(anyString());
//
//    }
//
//    @Test
//    void getRoomTypeDetail_WithNoImagesAndEmptyAmenities() {
//        Integer roomTypeId = 77;
//        Hotel hotel = Hotel.builder().hotelId(21).hotelName("Hotel E").address("Addr").build();
//        RoomType roomType = RoomType.builder()
//                .roomTypeId(roomTypeId)
//                .hotel(hotel)
//                .roomCode("STD-77")
//                .roomTitle("Standard")
//                .amenities("   ")
//                .build();
//
//        when(roomTypeRepository.findById(roomTypeId)).thenReturn(Optional.of(roomType));
//        when(roomTypeImageRepository.findByRoomType_RoomTypeId(roomTypeId)).thenReturn(List.of());
//
//        RoomTypeDetailResponse response = roomTypeService.getRoomTypeDetail(roomTypeId);
//
//        assertThat(response.getRoomTypeId()).isEqualTo(77);
//        assertThat(response.getHotelId()).isEqualTo(21);
//        assertThat(response.getAmenities()).isEmpty();
//        assertThat(response.getImages()).isEmpty();
//
//        verify(s3Service, never()).getFileUrl(anyString());
//
//    }
//}