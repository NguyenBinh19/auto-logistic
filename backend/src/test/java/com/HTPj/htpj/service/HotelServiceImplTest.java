//package com.HTPj.htpj.service;
//
//import com.HTPj.htpj.dto.request.hotel.BankInfoRequest;
//import com.HTPj.htpj.dto.request.hotel.UpdateHotelRequest;
//import com.HTPj.htpj.dto.response.hotel.HotelDetailListResponse;
//import com.HTPj.htpj.dto.response.hotel.HotelDetailResponse;
//import com.HTPj.htpj.dto.response.hotel.HotelSearchProjection;
//import com.HTPj.htpj.dto.response.kyc.VerificationInfoResponse;
//import com.HTPj.htpj.entity.BookingDetail;
//import com.HTPj.htpj.entity.Hotel;
//import com.HTPj.htpj.entity.HotelImage;
//import com.HTPj.htpj.entity.PartnerVerification;
//import com.HTPj.htpj.entity.RoomHoldDetail;
//import com.HTPj.htpj.entity.RoomType;
//import com.HTPj.htpj.entity.Users;
//import com.HTPj.htpj.exception.AppException;
//import com.HTPj.htpj.exception.ErrorCode;
//import com.HTPj.htpj.mapper.HotelMapper;
//import com.HTPj.htpj.repository.*;
//import com.HTPj.htpj.service.impl.HotelServiceImpl;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.ArgumentCaptor;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.MockedStatic;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.mock.web.MockMultipartFile;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.context.SecurityContext;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.oauth2.jwt.Jwt;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.IOException;
//import java.math.BigDecimal;
//import java.time.LocalDate;
//import java.util.List;
//import java.util.Optional;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.ArgumentMatchers.*;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//class HotelServiceImplTest {
//
//    @Mock
//    private HotelRepository hotelRepository;
//
//    @Mock
//    private HotelImageRepository hotelImageRepository;
//
//    @Mock
//    private HotelReviewRepository hotelReviewRepository;
//
//    @Mock
//    private HotelMapper hotelMapper;
//
//    @Mock
//    private RoomTypeRepository roomTypeRepository;
//
//    @Mock
//    private BookingDetailRepository bookingDetailRepository;
//
//    @Mock
//    private RoomHoldRepository roomHoldRepository;
//
//    @Mock
//    private PartnerVerificationRepository partnerVerificationRepository;
//
//    @Mock
//    private S3Service s3Service;
//
//    @Mock
//    private UserRepository userRepository;
//
//    @Mock
//    private NotificationService notificationService;
//
//    @InjectMocks
//    private HotelServiceImpl hotelService;
//
//    //search
//    @Test
//    void searchHotels_shouldReturnEmptyList_whenNoHotelsFound() {
//        // GIVEN
//        when(hotelRepository.searchHotels("hanoi")).thenReturn(List.of());
//
//        // WHEN
//        List<HotelDetailResponse> result = hotelService.searchHotels("hanoi", null, null, 1);
//
//        // THEN
//        assertTrue(result.isEmpty());
//        verify(hotelImageRepository, never()).findByHotelHotelIdInOrderBySortOrderAsc(anyList());
//        verify(roomTypeRepository, never()).findByHotel_HotelIdIn(anyList());
//    }
//
//    @Test
//    void searchHotels_shouldReturnListWithoutAvailability_whenDatesAreNull() {
//        // GIVEN
//        HotelSearchProjection projection = mockProjection(
//                1,
//                "Hotel A",
//                "[\"wifi\",\"pool\"]",
//                4.8,
//                15
//        );
//        HotelImage image = hotelImage(101, 1, "https://bucket.com/hotels/1/cover.jpg", true, 1);
//
//        when(hotelRepository.searchHotels("hotel")).thenReturn(List.of(projection));
//        when(hotelImageRepository.findByHotelHotelIdInOrderBySortOrderAsc(List.of(1))).thenReturn(List.of(image));
//
//        // WHEN
//        List<HotelDetailResponse> result = hotelService.searchHotels("hotel", null, null, 2);
//
//        // THEN
//        assertEquals(1, result.size());
//        HotelDetailResponse response = result.get(0);
//        assertEquals(1, response.getHotelId());
//        assertEquals(List.of("https://bucket.com/hotels/1/cover.jpg"), response.getImages());
//        assertEquals(List.of("wifi", "pool"), response.getAmenities());
//        assertNull(response.getMinPrice());
//        assertNull(response.getTotalAvailableRooms());
//
//        verify(roomTypeRepository, never()).findByHotel_HotelIdIn(anyList());
//        verify(bookingDetailRepository, never()).findOverlappingBookingsForHotels(anyList(), any(), any(), anyList());
//        verify(roomHoldRepository, never()).findActiveOverlappingHoldDetailsForHotels(anyList(), any(), any());
//    }
//
//    @Test
//    void searchHotels_shouldCalculateAvailabilityAndMinPrice_whenDatesAreValid() {
//        // GIVEN
//        LocalDate checkIn = LocalDate.of(2026, 5, 10);
//        LocalDate checkOut = LocalDate.of(2026, 5, 12);
//
//        HotelSearchProjection projection = mockProjection(
//                1,
//                "Hotel A",
//                "[\"wifi\"]",
//                4.5,
//                20
//        );
//        when(hotelRepository.searchHotels("hotel")).thenReturn(List.of(projection));
//        when(hotelImageRepository.findByHotelHotelIdInOrderBySortOrderAsc(List.of(1)))
//                .thenReturn(List.of(hotelImage(101, 1, "https://bucket.com/hotels/1/img1.jpg", false, 1)));
//
//        RoomType rt1 = roomType(11, 1, "ACTIVE", 10, new BigDecimal("100.00"));
//        RoomType rt2 = roomType(12, 1, "ACTIVE", 5, new BigDecimal("80.00"));
//        RoomType rt3 = roomType(13, 1, "INACTIVE", 99, new BigDecimal("50.00"));
//        when(roomTypeRepository.findByHotel_HotelIdIn(List.of(1))).thenReturn(List.of(rt1, rt2, rt3));
//
//        BookingDetail bd1 = BookingDetail.builder().roomType(rt1).quantity(3).build();
//        BookingDetail bd2 = BookingDetail.builder().roomType(rt2).quantity(1).build();
//        when(bookingDetailRepository.findOverlappingBookingsForHotels(eq(List.of(1)), eq(checkIn), eq(checkOut), anyList()))
//                .thenReturn(List.of(bd1, bd2));
//
//        RoomHoldDetail hold1 = RoomHoldDetail.builder().roomTypeId(11).quantity(2).build();
//        RoomHoldDetail hold2 = RoomHoldDetail.builder().roomTypeId(12).quantity(1).build();
//        when(roomHoldRepository.findActiveOverlappingHoldDetailsForHotels(List.of(1), checkIn, checkOut))
//                .thenReturn(List.of(hold1, hold2));
//
//        // WHEN
//        List<HotelDetailResponse> result = hotelService.searchHotels("hotel", checkIn, checkOut, 2);
//
//        // THEN
//        assertEquals(1, result.size());
//        HotelDetailResponse response = result.get(0);
//        assertEquals(8, response.getTotalAvailableRooms());
//        assertEquals(new BigDecimal("80.00"), response.getMinPrice());
//
//        verify(roomTypeRepository).findByHotel_HotelIdIn(List.of(1));
//        verify(bookingDetailRepository).findOverlappingBookingsForHotels(eq(List.of(1)), eq(checkIn), eq(checkOut), anyList());
//        verify(roomHoldRepository).findActiveOverlappingHoldDetailsForHotels(List.of(1), checkIn, checkOut);
//    }
//
//    @Test
//    void searchHotels_shouldFilterOutHotel_whenTotalAvailableRoomsLessThanRequired() {
//        // GIVEN
//        LocalDate checkIn = LocalDate.of(2026, 6, 1);
//        LocalDate checkOut = LocalDate.of(2026, 6, 2);
//
//        HotelSearchProjection projection = mockProjection(2, "Hotel B", "[\"wifi\"]", 4.0, 2);
//        lenient().when(hotelRepository.searchHotels("hotel")).thenReturn(List.of(projection));
//        lenient().when(hotelImageRepository.findByHotelHotelIdInOrderBySortOrderAsc(List.of(2))).thenReturn(List.of());
//
//        RoomType rt = roomType(21, 2, "ACTIVE", 2, new BigDecimal("120.00"));
//        lenient().when(roomTypeRepository.findByHotel_HotelIdIn(List.of(2))).thenReturn(List.of(rt));
//
//        BookingDetail booked = BookingDetail.builder().roomType(rt).quantity(1).build();
//        lenient().when(bookingDetailRepository.findOverlappingBookingsForHotels(eq(List.of(2)), eq(checkIn), eq(checkOut), anyList()))
//                .thenReturn(List.of(booked));
//        lenient().when(roomHoldRepository.findActiveOverlappingHoldDetailsForHotels(List.of(2), checkIn, checkOut))
//                .thenReturn(List.of());
//
//        // WHEN
//        List<HotelDetailResponse> result = hotelService.searchHotels("hotel", checkIn, checkOut, 2);
//
//        // THEN
//        assertTrue(result.isEmpty());
//    }
//
//    @Test
//    void searchHotels_shouldReturnEmptyAmenities_whenAmenitiesJsonMalformed() {
//        // GIVEN
//        HotelSearchProjection projection = mockProjection(3, "Hotel C", "{broken-json", 3.5, 1);
//        when(hotelRepository.searchHotels("hotel")).thenReturn(List.of(projection));
//        when(hotelImageRepository.findByHotelHotelIdInOrderBySortOrderAsc(List.of(3))).thenReturn(List.of());
//
//        // WHEN
//        List<HotelDetailResponse> result = hotelService.searchHotels("hotel", null, null, 1);
//
//        // THEN
//        assertEquals(1, result.size());
//        assertEquals(List.of(), result.get(0).getAmenities());
//    }
//
//    @Test
//    void searchHotels_shouldUseDefaultRoomCount_whenRoomsIsInvalid() {
//        // GIVEN
//        LocalDate checkIn = LocalDate.now().plusDays(1);
//        LocalDate checkOut = LocalDate.now().plusDays(2);
//        HotelSearchProjection projection = mockProjection(5, "Hotel E", "[]", 5.0, 10);
//
//        when(hotelRepository.searchHotels("hotel")).thenReturn(List.of(projection));
//        when(roomTypeRepository.findByHotel_HotelIdIn(anyList()))
//                .thenReturn(List.of(roomType(51, 5, "ACTIVE", 1, new BigDecimal("100"))));
//
//        // WHEN
//        List<HotelDetailResponse> result = hotelService.searchHotels("hotel", checkIn, checkOut, 0);
//
//        // THEN
//        assertEquals(1, result.size());
//        assertEquals(1, result.get(0).getTotalAvailableRooms());
//    }
//
//    //get detail
//    @Test
//    void getHotelDetailByHotelId_shouldReturnFullDetail_whenHotelExists() {
//        // GIVEN
//        Integer hotelId = 10;
//        Hotel hotel = Hotel.builder().hotelId(hotelId).amenities("[\"wifi\",\"gym\"]").build();
//        PartnerVerification verification = PartnerVerification.builder().id(900).build();
//        VerificationInfoResponse verificationInfo = VerificationInfoResponse.builder().verificationId(900).build();
//        HotelDetailListResponse mapped = HotelDetailListResponse.builder().hotelId(hotelId).hotelName("Hotel 10").build();
//
//        when(hotelRepository.findById(hotelId)).thenReturn(Optional.of(hotel));
//        when(partnerVerificationRepository.findByHotelOrderByVersionDesc(hotelId)).thenReturn(List.of(verification));
//        when(hotelMapper.toHotelDetailListResponse(hotel)).thenReturn(mapped);
//        when(hotelMapper.toVerificationInfoResponse(verification)).thenReturn(verificationInfo);
//        when(hotelImageRepository.findByHotelHotelIdOrderBySortOrderAsc(hotelId))
//                .thenReturn(List.of(
//                        hotelImage(1, hotelId, "https://bucket.com/hotels/10/1.jpg", true, 1),
//                        hotelImage(2, hotelId, "https://bucket.com/hotels/10/2.jpg", false, 2)
//                ));
//        when(hotelReviewRepository.getAvgRating(hotelId)).thenReturn(4.7);
//        when(hotelReviewRepository.countByHotelId(hotelId)).thenReturn(12);
//
//        // WHEN
//        HotelDetailListResponse result = hotelService.getHotelDetail(hotelId);
//
//        // THEN
//        assertEquals(hotelId, result.getHotelId());
//        assertNotNull(result.getVerification());
//        assertEquals(900, result.getVerification().getVerificationId());
//        assertEquals(2, result.getImages().size());
//        assertEquals(4.7, result.getAvgRating());
//        assertEquals(12, result.getTotalReviews());
//        assertEquals(List.of("wifi", "gym"), result.getAmenitiesList());
//    }
//
//    @Test
//    void getHotelDetailByHotelId_shouldThrowAppException_whenHotelNotFound() {
//        // GIVEN
//        when(hotelRepository.findById(404)).thenReturn(Optional.empty());
//
//        // WHEN
//        AppException exception = assertThrows(AppException.class, () -> hotelService.getHotelDetail(404));
//
//        // THEN
//        assertEquals(ErrorCode.HOTEL_NOT_FOUND, exception.getErrorCode());
//    }
//
//    @Test
//    void getHotelDetailByCurrentUser_shouldReturnFullDetail_whenUserAndHotelExist() {
//        // GIVEN
//        Integer hotelId = 20;
//        Hotel hotel = Hotel.builder().hotelId(hotelId).amenities("[\"spa\"]").build();
//        Users user = Users.builder().id("test-user-id").hotel(hotel).build();
//        PartnerVerification verification = PartnerVerification.builder().id(901).build();
//        VerificationInfoResponse verificationInfo = VerificationInfoResponse.builder().verificationId(901).build();
//        HotelDetailListResponse mapped = HotelDetailListResponse.builder().hotelId(hotelId).hotelName("Hotel 20").build();
//
//        when(userRepository.findById("test-user-id")).thenReturn(Optional.of(user));
//        when(partnerVerificationRepository.findByHotelOrderByVersionDesc(hotelId)).thenReturn(List.of(verification));
//        when(hotelMapper.toHotelDetailListResponse(hotel)).thenReturn(mapped);
//        when(hotelMapper.toVerificationInfoResponse(verification)).thenReturn(verificationInfo);
//        when(hotelImageRepository.findByHotelHotelIdOrderBySortOrderAsc(hotelId))
//                .thenReturn(List.of(hotelImage(3, hotelId, "https://bucket.com/hotels/20/1.jpg", true, 1)));
//        when(hotelReviewRepository.getAvgRating(hotelId)).thenReturn(null);
//        when(hotelReviewRepository.countByHotelId(hotelId)).thenReturn(3);
//
//        // WHEN
//        HotelDetailListResponse result;
//        try (MockedStatic<SecurityContextHolder> ignored = mockSecurityContextWithJwt("test-user-id")) {
//            result = hotelService.getHotelDetail();
//        }
//
//        // THEN
//        assertEquals(hotelId, result.getHotelId());
//        assertEquals(0.0, result.getAvgRating());
//        assertEquals(3, result.getTotalReviews());
//        assertEquals(List.of("spa"), result.getAmenitiesList());
//        assertNotNull(result.getVerification());
//    }
//
//    @Test
//    void getHotelDetailByCurrentUser_shouldThrowAppException_whenUserHasNoHotel() {
//        // GIVEN
//        Users user = Users.builder().id("test-user-id").hotel(null).build();
//        when(userRepository.findById("test-user-id")).thenReturn(Optional.of(user));
//
//        // WHEN
//        AppException exception;
//        try (MockedStatic<SecurityContextHolder> ignored = mockSecurityContextWithJwt("test-user-id")) {
//            exception = assertThrows(AppException.class, () -> hotelService.getHotelDetail());
//        }
//
//        // THEN
//        assertEquals(ErrorCode.HOTEL_NOT_FOUND, exception.getErrorCode());
//    }
//
//    @Test
//    void getHotelDetail_shouldThrowAppException_whenUserNotFound() {
//        // GIVEN
//        when(userRepository.findById("non-existent-user")).thenReturn(Optional.empty());
//
//        // WHEN / THEN
//        AppException exception;
//        try (MockedStatic<SecurityContextHolder> ignored = mockSecurityContextWithJwt("non-existent-user")) {
//            exception = assertThrows(AppException.class, () -> hotelService.getHotelDetail());
//        }
//
//        assertEquals(ErrorCode.USER_NOT_EXISTED, exception.getErrorCode());
//        verify(partnerVerificationRepository, never()).findByHotelOrderByVersionDesc(anyInt());
//    }
//
//    //update
//    @Test
//    void updateHotel_shouldUpdateFieldsImagesCoverAndNotify_whenRequestIsValid() throws IOException {
//        // GIVEN
//        Integer hotelId = 99;
//        Hotel hotel = Hotel.builder().hotelId(hotelId).amenities("[]").build();
//        Users currentUser = Users.builder().id("test-user-id").hotel(hotel).build();
//        Users user1 = Users.builder().id("user-1").build();
//        Users user2 = Users.builder().id("user-2").build();
//
//        UpdateHotelRequest request = UpdateHotelRequest.builder()
//                .hotelName("Updated Hotel")
//                .address("New Address")
//                .city("New City")
//                .country("VN")
//                .phone("0900000000")
//                .description("New Description")
//                .email("hotel@example.com")
//                .amenitiesList(List.of("wifi", "pool"))
//                .deleteImageIds(List.of(11, 12))
//                .coverImageId(21)
//                .build();
//
//        MultipartFile[] newImages = new MultipartFile[] {
//                new MockMultipartFile("file1", "1.jpg", "image/jpeg", "a".getBytes()),
//                new MockMultipartFile("file2", "2.jpg", "image/jpeg", "b".getBytes())
//        };
//
//        HotelImage delete1 = hotelImage(11, hotelId, "https://bucket.com/hotels/99/old-1.jpg", false, 1);
//        HotelImage delete2 = hotelImage(12, hotelId, "https://bucket.com/hotels/99/old-2.jpg", false, 2);
//        HotelImage coverTarget = hotelImage(21, hotelId, "https://bucket.com/hotels/99/keep-cover.jpg", false, 3);
//        HotelImage nonCover = hotelImage(22, hotelId, "https://bucket.com/hotels/99/keep-other.jpg", true, 4);
//
//        PartnerVerification verification = PartnerVerification.builder().id(501).build();
//        HotelDetailListResponse mapped = HotelDetailListResponse.builder().hotelId(hotelId).hotelName("Updated Hotel").build();
//
//        when(userRepository.findById("test-user-id")).thenReturn(Optional.of(currentUser));
//        when(hotelImageRepository.findAllById(request.getDeleteImageIds())).thenReturn(List.of(delete1, delete2));
//        when(hotelImageRepository.findByHotelHotelIdOrderBySortOrderAsc(hotelId))
//                .thenReturn(
//                        List.of(coverTarget, nonCover),
//                        List.of(coverTarget, nonCover),
//                        List.of(coverTarget, nonCover)
//                );
//        when(s3Service.getFileUrl(anyString())).thenAnswer(invocation -> "https://bucket.com/" + invocation.getArgument(0));
//        when(userRepository.findByHotel_HotelId(hotelId)).thenReturn(List.of(user1, user2));
//        when(hotelRepository.findById(hotelId)).thenReturn(Optional.of(hotel));
//        when(partnerVerificationRepository.findByHotelOrderByVersionDesc(hotelId)).thenReturn(List.of(verification));
//        when(hotelMapper.toHotelDetailListResponse(hotel)).thenReturn(mapped);
//        when(hotelMapper.toVerificationInfoResponse(verification))
//                .thenReturn(VerificationInfoResponse.builder().verificationId(501).build());
//        when(hotelReviewRepository.getAvgRating(hotelId)).thenReturn(4.9);
//        when(hotelReviewRepository.countByHotelId(hotelId)).thenReturn(22);
//
//        // WHEN
//        HotelDetailListResponse result;
//        try (MockedStatic<SecurityContextHolder> ignored = mockSecurityContextWithJwt("test-user-id")) {
//            result = hotelService.updateHotel(request, newImages);
//        }
//
//        // THEN
//        assertEquals("Updated Hotel", hotel.getHotelName());
//        assertEquals("hotel@example.com", hotel.getEmail());
//        assertEquals("[\"wifi\",\"pool\"]", hotel.getAmenities());
//        assertTrue(coverTarget.getIsCover());
//        assertFalse(nonCover.getIsCover());
//        assertNotNull(result);
//        assertEquals(hotelId, result.getHotelId());
//
//        verify(hotelRepository).save(hotel);
//        verify(s3Service).deleteFile("hotels/99/old-1.jpg");
//        verify(s3Service).deleteFile("hotels/99/old-2.jpg");
//        verify(hotelImageRepository).deleteByImageIdIn(request.getDeleteImageIds());
//        verify(s3Service, times(2)).uploadFile(any(MultipartFile.class), anyString());
//        verify(hotelImageRepository, times(2)).save(any(HotelImage.class));
//        verify(hotelImageRepository).saveAll(anyList());
//        verify(notificationService).sendNotification(
//                eq("user-1"), eq("HOTEL"), anyString(), anyString(), eq("HOTEL"), eq(String.valueOf(hotelId)), eq("/hotel/profile")
//        );
//        verify(notificationService).sendNotification(
//                eq("user-2"), eq("HOTEL"), anyString(), anyString(), eq("HOTEL"), eq(String.valueOf(hotelId)), eq("/hotel/profile")
//        );
//    }
//
//    @Test
//    void updateHotel_shouldThrowRuntimeException_whenS3UploadFails() throws IOException {
//        // GIVEN
//        Integer hotelId = 100;
//        Hotel hotel = Hotel.builder().hotelId(hotelId).build();
//        Users user = Users.builder().id("test-user-id").hotel(hotel).build();
//        UpdateHotelRequest request = UpdateHotelRequest.builder().amenitiesList(List.of("wifi")).build();
//        MultipartFile[] newImages = new MultipartFile[] {
//                new MockMultipartFile("file", "bad.jpg", "image/jpeg", "x".getBytes())
//        };
//
//        when(userRepository.findById("test-user-id")).thenReturn(Optional.of(user));
//        when(hotelImageRepository.findByHotelHotelIdOrderBySortOrderAsc(hotelId)).thenReturn(List.of());
//        doThrow(new IOException("S3 down")).when(s3Service).uploadFile(any(MultipartFile.class), anyString());
//
//        // WHEN
//        RuntimeException exception;
//        try (MockedStatic<SecurityContextHolder> ignored = mockSecurityContextWithJwt("test-user-id")) {
//            exception = assertThrows(RuntimeException.class, () -> hotelService.updateHotel(request, newImages));
//        }
//
//        // THEN
//        assertEquals("Upload image failed", exception.getMessage());
//        verify(hotelImageRepository, never()).save(any(HotelImage.class));
//    }
//
//    @Test
//    void updateHotel_shouldThrowAppException_whenUserHasNoHotel() {
//        // GIVEN
//        Users user = Users.builder().id("test-user-id").hotel(null).build();
//        UpdateHotelRequest request = UpdateHotelRequest.builder().amenitiesList(List.of()).build();
//
//        when(userRepository.findById("test-user-id")).thenReturn(Optional.of(user));
//
//        // WHEN
//        AppException exception;
//        try (MockedStatic<SecurityContextHolder> ignored = mockSecurityContextWithJwt("test-user-id")) {
//            exception = assertThrows(AppException.class, () -> hotelService.updateHotel(request, null));
//        }
//
//        // THEN
//        assertEquals(ErrorCode.HOTEL_NOT_FOUND, exception.getErrorCode());
//    }
//
//    @Test
//    void updateHotel_shouldNotifyAllHotelUsers_whenUpdateSucceeds() throws IOException {
//        // GIVEN
//        Integer hotelId = 55;
//        Hotel hotel = Hotel.builder().hotelId(hotelId).build();
//        Users currentUser = Users.builder().id("test-user-id").hotel(hotel).build();
//        Users user1 = Users.builder().id("u1").build();
//        Users user2 = Users.builder().id("u2").build();
//        Users user3 = Users.builder().id("u3").build();
//
//        UpdateHotelRequest request = UpdateHotelRequest.builder().amenitiesList(List.of("wifi")).build();
//        PartnerVerification verification = PartnerVerification.builder().id(601).build();
//        HotelDetailListResponse mapped = HotelDetailListResponse.builder().hotelId(hotelId).build();
//
//        when(userRepository.findById("test-user-id")).thenReturn(Optional.of(currentUser));
//        when(userRepository.findByHotel_HotelId(hotelId)).thenReturn(List.of(user1, user2, user3));
//        when(hotelRepository.findById(hotelId)).thenReturn(Optional.of(hotel));
//        when(partnerVerificationRepository.findByHotelOrderByVersionDesc(hotelId)).thenReturn(List.of(verification));
//        when(hotelMapper.toHotelDetailListResponse(hotel)).thenReturn(mapped);
//        when(hotelMapper.toVerificationInfoResponse(verification)).thenReturn(VerificationInfoResponse.builder().verificationId(601).build());
//        when(hotelImageRepository.findByHotelHotelIdOrderBySortOrderAsc(hotelId)).thenReturn(List.of());
//        when(hotelReviewRepository.getAvgRating(hotelId)).thenReturn(4.0);
//        when(hotelReviewRepository.countByHotelId(hotelId)).thenReturn(1);
//
//        // WHEN
//        try (MockedStatic<SecurityContextHolder> ignored = mockSecurityContextWithJwt("test-user-id")) {
//            hotelService.updateHotel(request, null);
//        }
//
//        // THEN
//        ArgumentCaptor<String> userIdCaptor = ArgumentCaptor.forClass(String.class);
//        verify(notificationService, times(3)).sendNotification(
//                userIdCaptor.capture(),
//                eq("HOTEL"),
//                anyString(),
//                anyString(),
//                eq("HOTEL"),
//                eq(String.valueOf(hotelId)),
//                eq("/hotel/profile")
//        );
//        assertEquals(List.of("u1", "u2", "u3"), userIdCaptor.getAllValues());
//    }
//
//    private MockedStatic<SecurityContextHolder> mockSecurityContextWithJwt(String userId) {
//        SecurityContext context = mock(SecurityContext.class);
//        Authentication authentication = mock(Authentication.class);
//
//        Jwt jwt = Jwt.withTokenValue("token")
//                .header("alg", "none")
//                .claim("userId", userId)
//                .build();
//
//        when(authentication.getPrincipal()).thenReturn(jwt);
//        when(context.getAuthentication()).thenReturn(authentication);
//
//        MockedStatic<SecurityContextHolder> securityContextHolder = mockStatic(SecurityContextHolder.class);
//        securityContextHolder.when(SecurityContextHolder::getContext).thenReturn(context);
//        return securityContextHolder;
//    }
//
//    private HotelSearchProjection mockProjection(Integer hotelId,
//                                                 String hotelName,
//                                                 String amenities,
//                                                 Double avgRating,
//                                                 Integer totalReviews) {
//        HotelSearchProjection projection = mock(HotelSearchProjection.class);
//        lenient().when(projection.getHotelId()).thenReturn(hotelId);
//        lenient().when(projection.getHotelName()).thenReturn(hotelName);
//        lenient().when(projection.getAddress()).thenReturn("Address " + hotelId);
//        lenient().when(projection.getCity()).thenReturn("City " + hotelId);
//        lenient().when(projection.getCountry()).thenReturn("Country " + hotelId);
//        lenient().when(projection.getPhone()).thenReturn("0909" + hotelId);
//        lenient().when(projection.getDescription()).thenReturn("Description " + hotelId);
//        lenient().when(projection.getStarRating()).thenReturn(4);
//        lenient().when(projection.getAvgRating()).thenReturn(avgRating);
//        lenient().when(projection.getTotalReviews()).thenReturn(totalReviews);
//        lenient().when(projection.getAmenities()).thenReturn(amenities);
//        return projection;
//    }
//
//    private HotelImage hotelImage(Integer imageId,
//                                  Integer hotelId,
//                                  String imageUrl,
//                                  Boolean isCover,
//                                  Integer sortOrder) {
//        return HotelImage.builder()
//                .imageId(imageId)
//                .hotel(Hotel.builder().hotelId(hotelId).build())
//                .imageUrl(imageUrl)
//                .isCover(isCover)
//                .sortOrder(sortOrder)
//                .build();
//    }
//
//    private RoomType roomType(Integer roomTypeId,
//                              Integer hotelId,
//                              String status,
//                              Integer totalRooms,
//                              BigDecimal basePrice) {
//        return RoomType.builder()
//                .roomTypeId(roomTypeId)
//                .hotel(Hotel.builder().hotelId(hotelId).build())
//                .roomStatus(status)
//                .totalRooms(totalRooms)
//                .basePrice(basePrice)
//                .build();
//    }
//
//}