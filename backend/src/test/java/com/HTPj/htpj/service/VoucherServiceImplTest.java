//package com.HTPj.htpj.service;
//
//import com.HTPj.htpj.entity.*;
//import com.HTPj.htpj.exception.AppException;
//import com.HTPj.htpj.exception.ErrorCode;
//import com.HTPj.htpj.repository.BookingRepository;
//import com.HTPj.htpj.repository.HotelRepository;
//import com.HTPj.htpj.repository.UserRepository;
//import com.HTPj.htpj.service.impl.EmailServiceImpl;
//import com.HTPj.htpj.service.impl.VoucherServiceImpl;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.Spy;
//import org.mockito.junit.jupiter.MockitoExtension;
//
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//import java.util.Collections;
//import java.util.Optional;
//
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.assertj.core.api.Assertions.assertThatThrownBy;
//import static org.mockito.ArgumentMatchers.*;
//import static org.mockito.Mockito.doReturn;
//import static org.mockito.Mockito.when;
//
//@ExtendWith(MockitoExtension.class)
//class VoucherServiceImplTest {
//
//    @Mock
//    private UserRepository userRepository;
//
//    @Mock
//    private BookingRepository bookingRepository;
//
//    @Mock
//    private HotelRepository hotelRepository;
//
//    @InjectMocks
//    @Spy // Dùng Spy để có thể stub (ghi đè) method extractUserId()
//    private VoucherServiceImpl voucherService;
//
//    private Users mockUser;
//    private Agency mockAgency;
//    private Booking mockBooking;
//
//    @BeforeEach
//    void setUp() {
//        mockAgency = new Agency();
//        mockAgency.setAgencyName("HTPj Travel Agency");
//
//        mockUser = new Users();
//        mockUser.setId("USER_UUID_STRING");
//        mockUser.setUsername("test_user");
//        mockUser.setAgency(mockAgency);
//
//        mockBooking = new Booking();
//        mockBooking.setBookingCode("BK12345");
//        mockBooking.setBookingStatus("BOOKED");
//        mockBooking.setHotelId(99);
//        mockBooking.setGuestName("Nguyen Van A");
//        mockBooking.setCheckInDate(LocalDate.now());
//        mockBooking.setCheckOutDate(LocalDate.now().plusDays(1));
//        mockBooking.setCreatedAt(LocalDateTime.now());
//        mockBooking.setNights(1);
//        mockBooking.setTotalRooms(1);
//        mockBooking.setBookingDetails(Collections.emptyList());
//    }
//
//    @Test
//    void generateVoucherPdf_Success() {
//        // GIVEN: Giả lập method extractUserId() trả về "test_user"
//        // Lưu ý: Phải đổi extractUserId() trong VoucherServiceImpl sang 'protected'
//        doReturn("test_user").when(voucherService).extractUserId();
//
//        when(userRepository.findByUsername("test_user")).thenReturn(Optional.of(mockUser));
//        when(bookingRepository.findDetailByBookingCodeAndUserId("BK12345", "USER_UUID_STRING"))
//                .thenReturn(Optional.of(mockBooking));
//        when(hotelRepository.findById(99)).thenReturn(Optional.of(new Hotel()));
//
//        // WHEN
//        byte[] result = voucherService.generateVoucherPdf("BK12345");
//
//        // THEN
//        assertThat(result).isNotEmpty();
//    }
//
//    @Test
//    void generateVoucherPdf_Success_Cancelled() {
//        // GIVEN
//        mockBooking.setBookingStatus("CANCELLED");
//        doReturn("test_user").when(voucherService).extractUserId();
//
//        when(userRepository.findByUsername("test_user")).thenReturn(Optional.of(mockUser));
//        when(bookingRepository.findDetailByBookingCodeAndUserId(anyString(), anyString()))
//                .thenReturn(Optional.of(mockBooking));
//        when(hotelRepository.findById(anyInt())).thenReturn(Optional.of(new Hotel()));
//
//        // WHEN
//        byte[] result = voucherService.generateVoucherPdf("BK12345");
//
//        // THEN
//        assertThat(result).isNotEmpty();
//    }
//    @Test
//    void generateVoucherPdf_UserNotFound_Fail() {
//        // GIVEN
//        String bookingCode = "BK123";
//        String username = "unknown_user";
//
//        // Sử dụng doReturn vì voucherService là @Spy
//        doReturn(username).when(voucherService).extractUserId();
//
//        // Giả lập DB không tìm thấy user
//        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());
//
//        // WHEN & THEN
//        AppException ex = org.junit.jupiter.api.Assertions.assertThrows(
//                AppException.class,
//                () -> voucherService.generateVoucherPdf(bookingCode)
//        );
//        assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.UNAUTHENTICATED);
//    }
//    @Test
//    void generateVoucherPdf_Fail_AgencyNotFound() {
//        // GIVEN
//        mockUser.setAgency(null);
//        doReturn("test_user").when(voucherService).extractUserId();
//        when(userRepository.findByUsername("test_user")).thenReturn(Optional.of(mockUser));
//
//        // WHEN & THEN
//        assertThatThrownBy(() -> voucherService.generateVoucherPdf("BK12345"))
//                .isInstanceOf(AppException.class)
//                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.AGENCY_NOT_FOUND);
//    }
//
//    @Test
//    void generateVoucherPdf_Fail_VoucherNotAvailable() {
//        // GIVEN
//        mockBooking.setBookingStatus("PENDING");
//        doReturn("test_user").when(voucherService).extractUserId();
//
//        when(userRepository.findByUsername("test_user")).thenReturn(Optional.of(mockUser));
//        when(bookingRepository.findDetailByBookingCodeAndUserId(anyString(), anyString()))
//                .thenReturn(Optional.of(mockBooking));
//
//        // WHEN & THEN
//        assertThatThrownBy(() -> voucherService.generateVoucherPdf("BK12345"))
//                .isInstanceOf(AppException.class)
//                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.VOUCHER_NOT_AVAILABLE);
//    }
//
//    @Test
//    void generateVoucherPdf_Fail_BookingNotFound() {
//        // GIVEN
//        doReturn("test_user").when(voucherService).extractUserId();
//        when(userRepository.findByUsername("test_user")).thenReturn(Optional.of(mockUser));
//        when(bookingRepository.findDetailByBookingCodeAndUserId(anyString(), anyString()))
//                .thenReturn(Optional.empty());
//
//        // WHEN & THEN
//        assertThatThrownBy(() -> voucherService.generateVoucherPdf("BK12345"))
//                .isInstanceOf(AppException.class)
//                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.BOOKING_NOT_FOUND);
//    }
//
//    @Test
//    void getVoucherFileName_Success_NormalName() {
//        // GIVEN
//        String bookingCode = "BK123";
//        mockBooking.setBookingCode(bookingCode);
//        mockBooking.setGuestName("Nguyen Van A"); // Tên bình thường
//
//        when(bookingRepository.findByBookingCode(bookingCode)).thenReturn(Optional.of(mockBooking));
//
//        // WHEN
//        String fileName = voucherService.getVoucherFileName(bookingCode);
//
//        // THEN
//        // "Nguyen Van A" -> "Nguyen_Van_A" do regex thay thế khoảng trắng thành "_"
//        assertThat(fileName).isEqualTo("Voucher_BK123_Nguyen_Van_A.pdf");
//    }
//
//    @Test
//    void getVoucherFileName_Success_SpecialCharacters() {
//        // GIVEN
//        String bookingCode = "BK999";
//        mockBooking.setBookingCode(bookingCode);
//        mockBooking.setGuestName("Mr. @Binh-Nguyen#!"); // Tên có ký tự đặc biệt
//
//        when(bookingRepository.findByBookingCode(bookingCode)).thenReturn(Optional.of(mockBooking));
//
//        // WHEN
//        String fileName = voucherService.getVoucherFileName(bookingCode);
//
//        // THEN
//        // Regex [^a-zA-Z0-9] sẽ thay tất cả ký tự lạ thành "_"
//        assertThat(fileName).isEqualTo("Voucher_BK999_Mr___Binh_Nguyen__.pdf");
//    }
//
//    @Test
//    void getVoucherFileName_Success_NullGuestName() {
//        // GIVEN
//        String bookingCode = "BK_NULL";
//        mockBooking.setBookingCode(bookingCode);
//        mockBooking.setGuestName(null); // Tên bị null
//
//        when(bookingRepository.findByBookingCode(bookingCode)).thenReturn(Optional.of(mockBooking));
//
//        // WHEN
//        String fileName = voucherService.getVoucherFileName(bookingCode);
//
//        // THEN
//        assertThat(fileName).isEqualTo("Voucher_BK_NULL_Guest.pdf");
//    }
//
//    @Test
//    void getVoucherFileName_Fail_BookingNotFound() {
//        // GIVEN
//        String bookingCode = "NOT_EXIST";
//        when(bookingRepository.findByBookingCode(bookingCode)).thenReturn(Optional.empty());
//
//        // WHEN & THEN
//        assertThatThrownBy(() -> voucherService.getVoucherFileName(bookingCode))
//                .isInstanceOf(AppException.class)
//                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.BOOKING_NOT_FOUND);
//    }
//}