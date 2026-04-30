//package com.HTPj.htpj.service;
//
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.junit.jupiter.api.Assertions.assertThrows;
//import static org.mockito.ArgumentMatchers.*;
//import static org.mockito.Mockito.*;
//
//import java.time.LocalDate;
//import java.util.*;
//
//import com.HTPj.htpj.dto.request.allotment.BulkAllotmentUpdateRequest;
//import com.HTPj.htpj.dto.request.allotment.SingleAllotmentUpdateRequest;
//import com.HTPj.htpj.dto.request.allotment.StopSellRequest;
//import com.HTPj.htpj.dto.response.allotment.RoomAllotmentResponse;
//import com.HTPj.htpj.exception.AppException;
//import com.HTPj.htpj.exception.ErrorCode;
//import com.HTPj.htpj.service.impl.RoomAllotmentServiceImpl;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.DisplayName;
//import org.junit.jupiter.api.Nested;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoSettings;
//import org.mockito.quality.Strictness;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.context.SecurityContext;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.oauth2.jwt.Jwt;
//
//import com.HTPj.htpj.dto.response.allotment.InventoryGridResponse;
//import com.HTPj.htpj.entity.Booking;
//import com.HTPj.htpj.entity.BookingDetail;
//import com.HTPj.htpj.entity.Hotel;
//import com.HTPj.htpj.entity.RoomAllotment;
//import com.HTPj.htpj.entity.RoomType;
//import com.HTPj.htpj.repository.BookingDetailRepository;
//import com.HTPj.htpj.repository.RoomAllotmentRepository;
//import com.HTPj.htpj.repository.RoomTypeRepository;
//
//@ExtendWith(MockitoExtension.class)
//@MockitoSettings(strictness = Strictness.LENIENT)
//class RoomAllotmentServiceGetGridTest {
//
//    @Mock private RoomAllotmentRepository allotmentRepository;
//    @Mock private RoomTypeRepository roomTypeRepository;
//    @Mock private BookingDetailRepository bookingDetailRepository;
//
//    @InjectMocks private RoomAllotmentServiceImpl allotmentService;
//
//    private final LocalDate startDate = LocalDate.of(2026, 4, 1);
//    private final LocalDate endDate = LocalDate.of(2026, 4, 2);
//    private RoomType mockRoomType;
//
//    @BeforeEach
//    void setUp() {
//        mockRoomType = RoomType.builder()
//                .roomTypeId(1)
//                .roomTitle("Deluxe Room")
//                .totalRooms(10)
//                .roomStatus("active")
//                .hotel(Hotel.builder().hotelId(101).build())
//                .build();
//    }
//
//    private void mockJwtContext(Integer hotelId) {
//        Jwt jwt = mock(Jwt.class);
//        when(jwt.getClaim("hotelId")).thenReturn(Long.valueOf(hotelId));
//
//        Authentication auth = mock(Authentication.class);
//        when(auth.getPrincipal()).thenReturn(jwt);
//
//        SecurityContext securityContext = mock(SecurityContext.class);
//        when(securityContext.getAuthentication()).thenReturn(auth);
//
//        SecurityContextHolder.setContext(securityContext);
//    }
//
//    @Nested
//    @DisplayName("Hàm getInventoryGrid")
//    class GetInventoryGrid {
//
//        @Test
//        @DisplayName("Trường hợp 1: Thành công - Trả về dữ liệu lưới khi có đầy đủ cấu hình")
//        void getInventoryGrid_Success() {
//            // GIVEN
//            mockJwtContext(101);
//            when(roomTypeRepository.findByHotel_HotelId(101)).thenReturn(List.of(mockRoomType));
//
//            RoomAllotment allotment = RoomAllotment.builder()
//                    .roomTypeId(1)
//                    .allotmentDate(startDate)
//                    .allotment(10)
//                    .stopSell(false)
//                    .build();
//            when(allotmentRepository.findByRoomTypeIdsAndDateRange(anyList(), any(), any()))
//                    .thenReturn(List.of(allotment));
//
//            // WHEN
//            List<InventoryGridResponse> result = allotmentService.getInventoryGrid(startDate, endDate);
//
//            // THEN
//            assertThat(result).isNotEmpty();
//            assertThat(result.get(0).getRoomTypeName()).isEqualTo("Deluxe Room");
//            assertThat(result.get(0).getDates()).hasSize(2); // Từ 01/04 đến 02/04
//        }
//
//        @Test
//        @DisplayName("Trường hợp 2: Thành công - Trả về danh sách trống nếu Hotel không có RoomType")
//        void getInventoryGrid_NoRoomTypes_ReturnsEmpty() {
//            // GIVEN
//            mockJwtContext(101);
//            when(roomTypeRepository.findByHotel_HotelId(101)).thenReturn(Collections.emptyList());
//
//            // WHEN
//            List<InventoryGridResponse> result = allotmentService.getInventoryGrid(startDate, endDate);
//
//            // THEN
//            assertThat(result).isEmpty();
//            verify(allotmentRepository, never()).findByRoomTypeIdsAndDateRange(any(), any(), any());
//        }
//
//        @Test
//        @DisplayName("Trường hợp 3: Thành công - Kiểm tra logic available = allotment - sold")
//        void getInventoryGrid_Calculation_Success() {
//            // GIVEN
//            mockJwtContext(101);
//            when(roomTypeRepository.findByHotel_HotelId(101)).thenReturn(List.of(mockRoomType));
//
//            // Set allotment là 10
//            RoomAllotment allotment = RoomAllotment.builder()
//                    .roomTypeId(1).allotmentDate(startDate).allotment(10).build();
//            when(allotmentRepository.findByRoomTypeIdsAndDateRange(anyList(), any(), any()))
//                    .thenReturn(List.of(allotment));
//
//            // Giả lập đã bán 3 phòng (Sold = 3)
//            BookingDetail detail = new BookingDetail();
//            detail.setRoomType(mockRoomType);
//            detail.setQuantity(3);
//            detail.setBooking(Booking.builder().checkInDate(startDate).checkOutDate(startDate.plusDays(1)).build());
//
//            when(bookingDetailRepository.findOverlappingBookings(any(), any(), any(), any()))
//                    .thenReturn(List.of(detail));
//
//            // WHEN
//            var result = allotmentService.getInventoryGrid(startDate, endDate);
//
//            // THEN
//            var dateData = result.get(0).getDates().get(0);
//            assertThat(dateData.getAllotment()).isEqualTo(10);
//            assertThat(dateData.getSoldCount()).isEqualTo(3);
//            assertThat(dateData.getAvailable()).isEqualTo(7); // 10 - 3 = 7
//        }
//
//        @Test
//        @DisplayName("Trường hợp 4: Ngoại lệ - Lỗi khi không có Authentication trong Context")
//        void getInventoryGrid_NoAuth_ThrowsException() {
//            // GIVEN
//            SecurityContextHolder.clearContext();
//
//            // WHEN & THEN
//            assertThrows(NullPointerException.class, () -> {
//                allotmentService.getInventoryGrid(startDate, endDate);
//            });
//        }
//    }
//
//    @Nested
//    @DisplayName("Hàm bulkUpdateAllotment")
//    class BulkUpdateAllotment {
//
//        @Test
//        @DisplayName("Trường hợp 1: Thành công - Cập nhật toàn bộ khoảng ngày")
//        void bulkUpdate_AllDays_Success() {
//            // GIVEN
//            // Đảm bảo startDate và endDate bao phủ đúng 5 ngày
//            LocalDate start = LocalDate.of(2026, 4, 1); // Wednesday
//            LocalDate end = LocalDate.of(2026, 4, 5);   // Sunday
//
//            BulkAllotmentUpdateRequest request = BulkAllotmentUpdateRequest.builder()
//                    .roomTypeId(1)
//                    .startDate(start)
//                    .endDate(end)
//                    .allotment(8)
//                    .daysOfWeek(null) // Để allowedDays = null, giúp bỏ qua check 'continue'
//                    .build();
//
//            // Mock RoomType và Hotel (Vì code gọi roomType.getHotel().getHotelId())
//            Hotel mockHotel = Hotel.builder().hotelId(101).build();
//            mockRoomType.setHotel(mockHotel);
//            mockRoomType.setTotalRooms(10);
//            mockRoomType.setRoomTitle("Deluxe Room");
//
//            when(roomTypeRepository.findById(1)).thenReturn(Optional.of(mockRoomType));
//
//            // Stub tìm allotment cũ: Trả về danh sách trống để code dùng .getOrDefault tạo mới
//            when(allotmentRepository.findByRoomTypeIdAndAllotmentDateBetween(eq(1), any(), any()))
//                    .thenReturn(new ArrayList<>());
//
//            // Stub tính toán soldCount: Trả về map trống (mặc định sold = 0 cho mọi ngày)
//            // Nếu hàm computeSoldCountsForRoomType là private, Mockito sẽ tự xử lý thông qua việc gọi hàm public
//            // Ở đây ta cần đảm bảo các repository mà hàm private đó sử dụng được stub đúng.
//            // Giả sử hàm đó gọi bookingDetailRepository:
//            when(bookingDetailRepository.findOverlappingBookings(any(), any(), any(), any()))
//                    .thenReturn(Collections.emptyList());
//
//            // Quan trọng: Mock saveAll để trả về list đầu vào
//            when(allotmentRepository.saveAll(any())).thenAnswer(i -> i.getArgument(0));
//
//            // WHEN
//            List<RoomAllotmentResponse> result = allotmentService.bulkUpdateAllotment(request);
//
//            // THEN
//            assertThat(result)
//                    .hasSize(5);
//
//            // Kiểm tra dữ liệu ngày đầu tiên (Wednesday)
//            assertThat(result.get(0).getDate()).isEqualTo(start);
//            assertThat(result.get(0).getAllotment()).isEqualTo(8);
//            assertThat(result.get(0).getAvailable()).isEqualTo(8); // 8 - 0 sold
//
//            verify(allotmentRepository).saveAll(any());
//        }
//        @Test
//        @DisplayName("Trường hợp 2: Thành công - Chỉ cập nhật thứ 7 và Chủ nhật")
//        void bulkUpdate_SpecificDays_Success() {
//            // GIVEN - Fix cứng ngày để đảm bảo có T7, CN
//            LocalDate start = LocalDate.of(2026, 4, 1); // Thứ 4
//            LocalDate end = LocalDate.of(2026, 4, 5);   // Chủ Nhật
//
//            BulkAllotmentUpdateRequest request = BulkAllotmentUpdateRequest.builder()
//                    .roomTypeId(1)
//                    .startDate(start)
//                    .endDate(end)
//                    .allotment(5)
//                    .daysOfWeek(List.of("SATURDAY", "SUNDAY"))
//                    .build();
//
//            // Reset lại mockRoomType để tránh dữ liệu rác từ test trước
//            mockRoomType.setTotalRooms(10);
//            mockRoomType.setHotel(Hotel.builder().hotelId(101).build());
//
//            when(roomTypeRepository.findById(1)).thenReturn(Optional.of(mockRoomType));
//
//            // Stub cho các repository được gọi trong computeSoldCountsForRoomType
//            // Đảm bảo không trả về null để tránh NPE
//            when(allotmentRepository.findByRoomTypeIdAndAllotmentDateBetween(anyInt(), any(), any()))
//                    .thenReturn(new ArrayList<>());
//
//            // Nếu hàm computeSoldCounts sử dụng repository này, hãy stub nó:
//            // when(bookingDetailRepository.findOverlappingBookings(any(), any(), any(), any()))
//            //        .thenReturn(Collections.emptyList());
//
//            when(allotmentRepository.saveAll(any())).thenAnswer(i -> i.getArgument(0));
//
//            // WHEN
//            List<RoomAllotmentResponse> result = allotmentService.bulkUpdateAllotment(request);
//
//            // THEN
//            // Kiểm tra log nếu kết quả vẫn là 0:
//            // System.out.println("Result size: " + result.size());
//
//            assertThat(result).hasSize(2);
//            assertThat(result).extracting(r -> r.getDate().getDayOfWeek().name())
//                    .containsExactlyInAnyOrder("SATURDAY", "SUNDAY");
//
//            result.forEach(r -> assertThat(r.getAllotment()).isEqualTo(5));
//        }
//        @Test
//        @DisplayName("Trường hợp 3: Exception - Vượt quá số phòng vật lý (BR-INV-01)")
//        void bulkUpdate_ExceedPhysical_ThrowsException() {
//            // GIVEN: Set 15 phòng trong khi totalRooms = 10
//            BulkAllotmentUpdateRequest request = BulkAllotmentUpdateRequest.builder()
//                    .roomTypeId(1).startDate(startDate).endDate(endDate).allotment(15).build();
//
//            when(roomTypeRepository.findById(1)).thenReturn(Optional.of(mockRoomType));
//
//            // WHEN & THEN
//            AppException ex = assertThrows(AppException.class, () -> allotmentService.bulkUpdateAllotment(request));
//            assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.ALLOTMENT_EXCEEDS_PHYSICAL);
//        }
//
//        @Test
//        @DisplayName("Trường hợp 4: Exception - Thấp hơn số lượng đã bán (BR-INV-02)")
//        void bulkUpdate_BelowSold_ThrowsException() {
//            // GIVEN: Set 3 phòng nhưng thực tế đã bán 5 phòng
//            BulkAllotmentUpdateRequest request = BulkAllotmentUpdateRequest.builder()
//                    .roomTypeId(1).startDate(startDate).endDate(endDate).allotment(3).build();
//
//            when(roomTypeRepository.findById(1)).thenReturn(Optional.of(mockRoomType));
//
//            // Giả lập đã bán 5 phòng
//            BookingDetail soldDetail = new BookingDetail();
//            soldDetail.setRoomType(mockRoomType);
//            soldDetail.setQuantity(5);
//            soldDetail.setBooking(Booking.builder().checkInDate(startDate).checkOutDate(endDate).build());
//
//            when(bookingDetailRepository.findOverlappingBookings(any(), any(), any(), any()))
//                    .thenReturn(List.of(soldDetail));
//
//            // WHEN & THEN
//            AppException ex = assertThrows(AppException.class, () -> allotmentService.bulkUpdateAllotment(request));
//            assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.ALLOTMENT_BELOW_SOLD);
//        }
//
//        @Test
//        @DisplayName("Trường hợp 5: Exception - Khoảng ngày không hợp lệ")
//        void bulkUpdate_InvalidDate_ThrowsException() {
//            // GIVEN: endDate trước startDate
//            BulkAllotmentUpdateRequest request = BulkAllotmentUpdateRequest.builder()
//                    .roomTypeId(1).startDate(endDate).endDate(startDate).allotment(5).build();
//
//            // WHEN & THEN
//            AppException ex = assertThrows(AppException.class, () -> allotmentService.bulkUpdateAllotment(request));
//            assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.ALLOTMENT_INVALID_DATE_RANGE);
//        }
//
//        @Test
//        @DisplayName("Trường hợp 6: Exception - RoomType không tồn tại")
//        void bulkUpdate_RoomNotFound_ThrowsException() {
//            // GIVEN
//            BulkAllotmentUpdateRequest request = BulkAllotmentUpdateRequest.builder()
//                    .roomTypeId(99).startDate(startDate).endDate(endDate).allotment(5).build();
//
//            when(roomTypeRepository.findById(99)).thenReturn(Optional.empty());
//
//            // WHEN & THEN
//            AppException ex = assertThrows(AppException.class, () -> allotmentService.bulkUpdateAllotment(request));
//            assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.ROOM_TYPE_NOT_FOUND);
//        }
//    }
//    @Nested
//    @DisplayName("Test cho updateSingleAllotment")
//    class UpdateSingleAllotment {
//
//        @Test
//        @DisplayName("Trường hợp 1: Cập nhật thành công Allotment đã tồn tại")
//        void updateSingle_ExistingAllotment_Success() {
//            // GIVEN
//            LocalDate targetDate = LocalDate.of(2026, 4, 15);
//            SingleAllotmentUpdateRequest request = new SingleAllotmentUpdateRequest(1, targetDate, 12);
//
//            mockRoomType.setTotalRooms(20);
//            mockRoomType.setHotel(Hotel.builder().hotelId(101).build());
//            when(roomTypeRepository.findById(1)).thenReturn(Optional.of(mockRoomType));
//
//            RoomAllotment existingAllotment = RoomAllotment.builder()
//                    .allotmentId(100L)
//                    .roomTypeId(1)
//                    .allotmentDate(targetDate)
//                    .allotment(10)
//                    .soldCount(5)
//                    .build();
//            when(allotmentRepository.findByRoomTypeIdAndAllotmentDate(1, targetDate))
//                    .thenReturn(Optional.of(existingAllotment));
//
//            // --- SỬA TẠI ĐÂY ---
//            // Giả lập có một booking 5 phòng vào ngày targetDate để hàm computeSoldCounts trả về 5
//            Booking mockBooking = Booking.builder()
//                    .checkInDate(targetDate)
//                    .checkOutDate(targetDate.plusDays(1)) // Checkout ngày hôm sau
//                    .build();
//
//            BookingDetail bd = BookingDetail.builder()
//                    .roomType(mockRoomType)
//                    .booking(mockBooking)
//                    .quantity(5)
//                    .build();
//
//            // Thay vì trả về emptyList(), hãy trả về danh sách có chứa bookingDetail này
//            when(bookingDetailRepository.findOverlappingBookings(eq(101), any(), any(), any()))
//                    .thenReturn(List.of(bd));
//            // --------------------
//
//            when(allotmentRepository.save(any(RoomAllotment.class))).thenAnswer(i -> i.getArgument(0));
//
//            // WHEN
//            RoomAllotmentResponse response = allotmentService.updateSingleAllotment(request);
//
//            // THEN
//            assertThat(response.getAllotment()).isEqualTo(12);
//            assertThat(response.getSoldCount()).isEqualTo(5); // Kiểm tra soldCount được đồng bộ lại là 5
//            assertThat(response.getAvailable()).isEqualTo(7); // 12 - 5 = 7 -> SẼ PASS
//            assertThat(response.getStatus()).isEqualTo("AVAILABLE");
//            verify(allotmentRepository).save(any());
//        }
//
//        @Test
//        @DisplayName("Trường hợp 2: Tạo mới Allotment nếu ngày đó chưa được cấu hình")
//        void updateSingle_NewAllotment_Success() {
//            // GIVEN
//            LocalDate targetDate = LocalDate.of(2026, 4, 20);
//            SingleAllotmentUpdateRequest request = new SingleAllotmentUpdateRequest(1, targetDate, 8);
//
//            mockRoomType.setTotalRooms(20);
//            mockRoomType.setHotel(Hotel.builder().hotelId(101).build());
//            when(roomTypeRepository.findById(1)).thenReturn(Optional.of(mockRoomType));
//
//            // Giả lập chưa có bản ghi nào trong DB cho ngày này
//            when(allotmentRepository.findByRoomTypeIdAndAllotmentDate(1, targetDate))
//                    .thenReturn(Optional.empty());
//
//            when(bookingDetailRepository.findOverlappingBookings(any(), any(), any(), any()))
//                    .thenReturn(Collections.emptyList());
//
//            when(allotmentRepository.save(any())).thenAnswer(i -> i.getArgument(0));
//
//            // WHEN
//            RoomAllotmentResponse response = allotmentService.updateSingleAllotment(request);
//
//            // THEN
//            assertThat(response.getAllotment()).isEqualTo(8);
//            assertThat(response.getSoldCount()).isEqualTo(0);
//            assertThat(response.getAvailable()).isEqualTo(8);
//            verify(allotmentRepository).save(any());
//        }
//
//        @Test
//        @DisplayName("Trường hợp 3.1: Ném lỗi khi allotment vượt quá số phòng vật lý")
//        void updateSingle_ExceedPhysical_ThrowsException() {
//            // GIVEN
//            SingleAllotmentUpdateRequest request = new SingleAllotmentUpdateRequest(1, LocalDate.now(), 50);
//
//            mockRoomType.setTotalRooms(30); // Chỉ có 30 phòng
//            when(roomTypeRepository.findById(1)).thenReturn(Optional.of(mockRoomType));
//
//            // WHEN & THEN
//            AppException ex = assertThrows(AppException.class, () -> allotmentService.updateSingleAllotment(request));
//            assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.ALLOTMENT_EXCEEDS_PHYSICAL);
//        }
//
//        @Test
//        @DisplayName("Trường hợp 3.2: Ném lỗi khi allotment nhỏ hơn số phòng đã bán")
//        void updateSingle_BelowSold_ThrowsException() {
//            // GIVEN
//            LocalDate date = LocalDate.of(2026, 4, 10);
//            SingleAllotmentUpdateRequest request = new SingleAllotmentUpdateRequest(1, date, 3);
//
//            mockRoomType.setTotalRooms(20);
//            mockRoomType.setHotel(Hotel.builder().hotelId(101).build());
//            when(roomTypeRepository.findById(1)).thenReturn(Optional.of(mockRoomType));
//
//            // Tạo booking giả lập
//            Booking mockBooking = Booking.builder().checkInDate(date).checkOutDate(date.plusDays(1)).build();
//            BookingDetail bd = BookingDetail.builder()
//                    .roomType(mockRoomType)
//                    .booking(mockBooking)
//                    .quantity(5)
//                    .build();
//
//            // FIX LỖI Ở ĐÂY: Thay .contains(bd) bằng .thenReturn(List.of(bd))
//            when(bookingDetailRepository.findOverlappingBookings(any(), any(), any(), any()))
//                    .thenReturn(List.of(bd));
//
//            // WHEN & THEN
//            AppException ex = assertThrows(AppException.class, () -> allotmentService.updateSingleAllotment(request));
//            assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.ALLOTMENT_BELOW_SOLD);
//        }
//        @Test
//        @DisplayName("Trường hợp 4: Ném lỗi khi không tìm thấy RoomType")
//        void updateSingle_RoomTypeNotFound_ThrowsException() {
//            // GIVEN
//            when(roomTypeRepository.findById(anyInt())).thenReturn(Optional.empty());
//            SingleAllotmentUpdateRequest request = new SingleAllotmentUpdateRequest(999, LocalDate.now(), 10);
//
//            // WHEN & THEN
//            AppException ex = assertThrows(AppException.class, () -> allotmentService.updateSingleAllotment(request));
//            assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.ROOM_TYPE_NOT_FOUND);
//        }
//    }
//    @Nested
//    @DisplayName("Test cho setStopSell & removeStopSell")
//    class StopSellTest {
//
//        @Test
//        @DisplayName("Trường hợp 1: setStopSell thành công")
//        void setStopSell_Success() {
//            LocalDate date = LocalDate.of(2026, 4, 15);
//            StopSellRequest request = StopSellRequest.builder()
//                    .roomTypeId(1).startDate(date).endDate(date).build();
//
//            mockRoomType.setHotel(Hotel.builder().hotelId(101).build());
//            when(roomTypeRepository.findById(1)).thenReturn(Optional.of(mockRoomType));
//            when(allotmentRepository.findByRoomTypeIdAndAllotmentDateBetween(any(), any(), any()))
//                    .thenReturn(Collections.emptyList());
//            when(allotmentRepository.saveAll(anyList())).thenAnswer(i -> i.getArgument(0));
//
//            List<RoomAllotmentResponse> responses = allotmentService.setStopSell(request);
//
//            assertThat(responses).hasSize(1);
//            // Kiểm tra field stopSell (thử getStopSell nếu isStopSell báo lỗi)
//            assertThat(responses.get(0).getStopSell()).isTrue();
//            assertThat(responses.get(0).getStatus()).isEqualTo("STOP_SELL");
//        }
//
//        @Test
//        @DisplayName("Trường hợp 2: removeStopSell thành công")
//        void removeStopSell_Success() {
//            LocalDate date = LocalDate.of(2026, 4, 15);
//            StopSellRequest request = StopSellRequest.builder()
//                    .roomTypeId(1).startDate(date).endDate(date).build();
//
//            when(roomTypeRepository.findById(1)).thenReturn(Optional.of(mockRoomType));
//
//            // Giả lập đã tồn tại allotment đang STOP_SELL
//            RoomAllotment existing = RoomAllotment.builder()
//                    .allotmentDate(date).roomTypeId(1).allotment(10).soldCount(0).stopSell(true).build();
//
//            when(allotmentRepository.findByRoomTypeIdAndAllotmentDateBetween(any(), any(), any()))
//                    .thenReturn(List.of(existing));
//            when(allotmentRepository.saveAll(anyList())).thenAnswer(i -> i.getArgument(0));
//
//            List<RoomAllotmentResponse> responses = allotmentService.removeStopSell(request);
//
//            assertThat(responses.get(0).getStopSell()).isFalse();
//            // 10 allotment - 0 sold = 10 available -> Status phải là AVAILABLE
//            assertThat(responses.get(0).getStatus()).isEqualTo("AVAILABLE");
//        }
//
//
//        @Test
//        @DisplayName("Trường hợp 3: Lỗi khi ngày bắt đầu sau ngày kết thúc")
//        void stopSell_InvalidDateRange_ThrowsException() {
//            // GIVEN
//            StopSellRequest request = StopSellRequest.builder()
//                    .roomTypeId(1)
//                    .startDate(LocalDate.of(2026, 4, 20))
//                    .endDate(LocalDate.of(2026, 4, 15)) // Ngày kết thúc trước ngày bắt đầu
//                    .build();
//
//            // WHEN & THEN
//            AppException ex = assertThrows(AppException.class, () -> allotmentService.setStopSell(request));
//            assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.ALLOTMENT_INVALID_DATE_RANGE);
//        }
//
//        @Test
//        @DisplayName("Trường hợp 4: Lỗi khi roomTypeId không hợp lệ")
//        void stopSell_RoomTypeNotFound_ThrowsException() {
//            // GIVEN
//            when(roomTypeRepository.findById(999)).thenReturn(Optional.empty());
//            StopSellRequest request = StopSellRequest.builder()
//                    .roomTypeId(999).startDate(LocalDate.now()).endDate(LocalDate.now()).build();
//
//            // WHEN & THEN
//            AppException ex = assertThrows(AppException.class, () -> allotmentService.setStopSell(request));
//            assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.ROOM_TYPE_NOT_FOUND);
//        }
//    }
//}