//package com.HTPj.htpj.service;
//
//import com.HTPj.htpj.dto.request.roomHold.CreateRoomHoldRequest;
//import com.HTPj.htpj.dto.request.roomHold.ExtendRoomHoldRequest;
//import com.HTPj.htpj.dto.request.roomHold.RoomTypeHoldItemRequest;
//import com.HTPj.htpj.dto.response.roomHold.RoomHoldResponse;
//import com.HTPj.htpj.entity.RoomHold;
//import com.HTPj.htpj.exception.AppException;
//import com.HTPj.htpj.exception.ErrorCode;
//import com.HTPj.htpj.mapper.RoomHoldMapper;
//import com.HTPj.htpj.repository.RoomHoldRepository;
//import com.HTPj.htpj.service.impl.RoomHoldServiceImpl;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.junit.jupiter.params.ParameterizedTest;
//import org.junit.jupiter.params.provider.ValueSource;
//import org.mockito.ArgumentCaptor;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.MockedStatic;
//import org.mockito.junit.jupiter.MockitoExtension;
//
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//import java.time.ZoneId;
//import java.util.List;
//import java.util.Optional;
//import java.util.UUID;
//
//import static org.junit.jupiter.api.Assertions.assertEquals;
//import static org.junit.jupiter.api.Assertions.assertThrows;
//import static org.junit.jupiter.api.Assertions.assertTrue;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.Mockito.never;
//import static org.mockito.Mockito.times;
//import static org.mockito.Mockito.verify;
//import static org.mockito.Mockito.when;
//
//@ExtendWith(MockitoExtension.class)
//class RoomHoldServiceImplTest {
//
//    @Mock
//    private RoomHoldRepository roomHoldRepository;
//
//    @Mock
//    private RoomHoldMapper roomHoldMapper;
//
//    @InjectMocks
//    private RoomHoldServiceImpl roomHoldService;
//
//    //create hold
//    @Test
//    void createHold_shouldCreateHoldWithMultipleItems_givenValidRequest() {
//        // GIVEN
//        LocalDateTime fixedNow = LocalDateTime.of(2026, 4, 15, 10, 30, 0);
//        UUID fixedUuid = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");
//        CreateRoomHoldRequest request = CreateRoomHoldRequest.builder()
//                .hotelId(101)
//                .checkInDate(LocalDate.of(2026, 5, 1))
//                .checkOutDate(LocalDate.of(2026, 5, 4))
//                .items(List.of(
//                        RoomTypeHoldItemRequest.builder().roomTypeId(11).quantity(2).build(),
//                        RoomTypeHoldItemRequest.builder().roomTypeId(22).quantity(1).build()
//                ))
//                .build();
//
//        when(roomHoldRepository.save(any(RoomHold.class))).thenAnswer(invocation -> invocation.getArgument(0));
//        when(roomHoldMapper.toResponse(any(RoomHold.class))).thenAnswer(invocation -> {
//            RoomHold hold = invocation.getArgument(0);
//            return RoomHoldResponse.builder()
//                    .holdCode(hold.getHoldCode())
//                    .expiredAt(hold.getExpiredAt())
//                    .status(hold.getStatus())
//                    .build();
//        });
//
//        // WHEN
//        RoomHoldResponse response;
//        ArgumentCaptor<RoomHold> holdCaptor = ArgumentCaptor.forClass(RoomHold.class);
//        try (MockedStatic<LocalDateTime> timeMock = org.mockito.Mockito.mockStatic(LocalDateTime.class);
//             MockedStatic<UUID> uuidMock = org.mockito.Mockito.mockStatic(UUID.class)) {
//            timeMock.when(LocalDateTime::now).thenReturn(fixedNow);
//            uuidMock.when(UUID::randomUUID).thenReturn(fixedUuid);
//
//            response = roomHoldService.createHold(request);
//
//            // THEN
//            uuidMock.verify(UUID::randomUUID, times(1));
//        }
//
//        verify(roomHoldRepository).save(holdCaptor.capture());
//        RoomHold savedHold = holdCaptor.getValue();
//
//        assertEquals("HOLD-" + fixedUuid, savedHold.getHoldCode());
//        assertEquals("HOLDING", savedHold.getStatus());
//        assertEquals(fixedNow, savedHold.getCreatedAt());
//        assertEquals(fixedNow.plusMinutes(15), savedHold.getExpiredAt());
//        assertEquals(2, savedHold.getDetails().size());
//        assertEquals(savedHold, savedHold.getDetails().getFirst().getRoomHold());
//        assertEquals(11, savedHold.getDetails().getFirst().getRoomTypeId());
//        assertEquals(2, savedHold.getDetails().getFirst().getQuantity());
//        assertEquals(savedHold, savedHold.getDetails().get(1).getRoomHold());
//        assertEquals(22, savedHold.getDetails().get(1).getRoomTypeId());
//        assertEquals(1, savedHold.getDetails().get(1).getQuantity());
//
//        assertEquals(savedHold.getHoldCode(), response.getHoldCode());
//        assertEquals(savedHold.getExpiredAt(), response.getExpiredAt());
//        assertEquals(savedHold.getStatus(), response.getStatus());
//    }
//
//    @Test
//    void createHold_shouldCreateHoldWithEmptyItems_givenRequestWithoutRooms() {
//        // GIVEN
//        LocalDateTime fixedNow = LocalDateTime.of(2026, 4, 15, 11, 0, 0);
//        UUID fixedUuid = UUID.fromString("223e4567-e89b-12d3-a456-426614174000");
//        CreateRoomHoldRequest request = CreateRoomHoldRequest.builder()
//                .hotelId(202)
//                .checkInDate(LocalDate.of(2026, 6, 1))
//                .checkOutDate(LocalDate.of(2026, 6, 3))
//                .items(List.of())
//                .build();
//
//        when(roomHoldRepository.save(any(RoomHold.class))).thenAnswer(invocation -> invocation.getArgument(0));
//        when(roomHoldMapper.toResponse(any(RoomHold.class))).thenAnswer(invocation -> {
//            RoomHold hold = invocation.getArgument(0);
//            return RoomHoldResponse.builder()
//                    .holdCode(hold.getHoldCode())
//                    .expiredAt(hold.getExpiredAt())
//                    .status(hold.getStatus())
//                    .build();
//        });
//
//        // WHEN
//        RoomHoldResponse response;
//        ArgumentCaptor<RoomHold> holdCaptor = ArgumentCaptor.forClass(RoomHold.class);
//        try (MockedStatic<LocalDateTime> timeMock = org.mockito.Mockito.mockStatic(LocalDateTime.class);
//             MockedStatic<UUID> uuidMock = org.mockito.Mockito.mockStatic(UUID.class)) {
//            timeMock.when(LocalDateTime::now).thenReturn(fixedNow);
//            uuidMock.when(UUID::randomUUID).thenReturn(fixedUuid);
//
//            response = roomHoldService.createHold(request);
//        }
//
//        // THEN
//        verify(roomHoldRepository).save(holdCaptor.capture());
//        RoomHold savedHold = holdCaptor.getValue();
//
//        assertEquals("HOLD-" + fixedUuid, savedHold.getHoldCode());
//        assertEquals("HOLDING", savedHold.getStatus());
//        assertEquals(fixedNow, savedHold.getCreatedAt());
//        assertEquals(fixedNow.plusMinutes(15), savedHold.getExpiredAt());
//        assertTrue(savedHold.getDetails().isEmpty());
//        assertEquals(savedHold.getHoldCode(), response.getHoldCode());
//        assertEquals(savedHold.getExpiredAt(), response.getExpiredAt());
//        assertEquals(savedHold.getStatus(), response.getStatus());
//    }
//
//    @Test
//    void createHold_shouldThrowException_givenNullItems() {
//        // GIVEN
//        CreateRoomHoldRequest request = CreateRoomHoldRequest.builder()
//                .hotelId(303)
//                .checkInDate(LocalDate.of(2026, 7, 1))
//                .checkOutDate(LocalDate.of(2026, 7, 5))
//                .items(null)
//                .build();
//
//        // WHEN & THEN
//        assertThrows(NullPointerException.class, () -> {
//            roomHoldService.createHold(request);
//        });
//
//        verify(roomHoldRepository, never()).save(any());
//    }
//
//    //extendhold
//    @Test
//    void extendHold_shouldExtendExistingHoldingHold_givenValidHoldCode() {
//        // GIVEN
//        LocalDateTime fixedNow = LocalDateTime.of(2026, 4, 15, 12, 0, 0);
//        RoomHold existingHold = RoomHold.builder()
//                .holdCode("HOLD-EXISTING-001")
//                .hotelId(303)
//                .checkInDate(LocalDate.of(2026, 7, 1))
//                .checkOutDate(LocalDate.of(2026, 7, 2))
//                .createdAt(LocalDateTime.of(2026, 4, 15, 11, 40, 0))
//                .expiredAt(LocalDateTime.of(2026, 4, 15, 11, 55, 0))
//                .status("HOLDING")
//                .build();
//        ExtendRoomHoldRequest request = ExtendRoomHoldRequest.builder()
//                .holdCode(existingHold.getHoldCode())
//                .build();
//
//        when(roomHoldRepository.findByHoldCode(existingHold.getHoldCode())).thenReturn(Optional.of(existingHold));
//        when(roomHoldRepository.save(any(RoomHold.class))).thenAnswer(invocation -> invocation.getArgument(0));
//        when(roomHoldMapper.toResponse(any(RoomHold.class))).thenAnswer(invocation -> {
//            RoomHold hold = invocation.getArgument(0);
//            return RoomHoldResponse.builder()
//                    .holdCode(hold.getHoldCode())
//                    .expiredAt(hold.getExpiredAt())
//                    .status(hold.getStatus())
//                    .build();
//        });
//
//        // WHEN
//        RoomHoldResponse response;
//        ArgumentCaptor<RoomHold> holdCaptor = ArgumentCaptor.forClass(RoomHold.class);
//        try (MockedStatic<LocalDateTime> timeMock = org.mockito.Mockito.mockStatic(LocalDateTime.class)) {
//            timeMock.when(LocalDateTime::now).thenReturn(fixedNow);
//
//            response = roomHoldService.extendHold(request);
//        }
//
//        // THEN
//        verify(roomHoldRepository).save(holdCaptor.capture());
//        RoomHold savedHold = holdCaptor.getValue();
//        LocalDateTime expectedExpiredAt = fixedNow.plusMinutes(15);
//        long expectedExpireEpochMillis = expectedExpiredAt.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();
//
//        assertEquals(existingHold.getHoldCode(), savedHold.getHoldCode());
//        assertEquals("HOLDING", savedHold.getStatus());
//        assertEquals(expectedExpiredAt, savedHold.getExpiredAt());
//        assertEquals(expectedExpireEpochMillis, savedHold.getExpiredAt().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli());
//        assertEquals(savedHold.getHoldCode(), response.getHoldCode());
//        assertEquals(savedHold.getExpiredAt(), response.getExpiredAt());
//        assertEquals(savedHold.getStatus(), response.getStatus());
//    }
//
//    @Test
//    void extendHold_shouldThrowHoldNotFound_givenMissingHoldCode() {
//        // GIVEN
//        ExtendRoomHoldRequest request = ExtendRoomHoldRequest.builder()
//                .holdCode("MISSING-HOLD")
//                .build();
//        when(roomHoldRepository.findByHoldCode(request.getHoldCode())).thenReturn(Optional.empty());
//
//        // WHEN
//        AppException exception = assertThrows(AppException.class, () -> roomHoldService.extendHold(request));
//
//        // THEN
//        assertEquals(ErrorCode.HOLD_NOT_FOUND, exception.getErrorCode());
//        verify(roomHoldRepository, never()).save(any(RoomHold.class));
//        verify(roomHoldMapper, never()).toResponse(any(RoomHold.class));
//    }
//
//    @Test
//    void extendHold_shouldThrowHoldExpired_givenHoldStatusIsNotHolding() {
//        // GIVEN
//        String holdCode = "HOLD-INVALID-STATUS";
//        RoomHold expiredHold = RoomHold.builder()
//                .holdCode(holdCode)
//                .status("EXPIRED")
//                .build();
//
//        ExtendRoomHoldRequest request = ExtendRoomHoldRequest.builder()
//                .holdCode(holdCode)
//                .build();
//
//        when(roomHoldRepository.findByHoldCode(holdCode)).thenReturn(Optional.of(expiredHold));
//
//        // WHEN
//        AppException exception = assertThrows(AppException.class, () -> roomHoldService.extendHold(request));
//
//        // THEN
//        assertEquals(ErrorCode.HOLD_EXPIRED, exception.getErrorCode());
//        verify(roomHoldRepository, never()).save(any(RoomHold.class));
//    }
//
//    @ParameterizedTest
//    @ValueSource(strings = {"EXPIRED", "CANCELLED", "COMPLETED"})
//    void extendHold_shouldThrowHoldExpired_givenNonHoldingStatus(String status) {
//        // GIVEN
//        RoomHold existingHold = RoomHold.builder()
//                .holdCode("HOLD-NON-HOLDING")
//                .hotelId(404)
//                .checkInDate(LocalDate.of(2026, 8, 1))
//                .checkOutDate(LocalDate.of(2026, 8, 2))
//                .createdAt(LocalDateTime.of(2026, 4, 15, 11, 0, 0))
//                .expiredAt(LocalDateTime.of(2026, 4, 15, 11, 15, 0))
//                .status(status)
//                .build();
//        ExtendRoomHoldRequest request = ExtendRoomHoldRequest.builder()
//                .holdCode(existingHold.getHoldCode())
//                .build();
//
//        when(roomHoldRepository.findByHoldCode(existingHold.getHoldCode())).thenReturn(Optional.of(existingHold));
//
//        // WHEN
//        AppException exception = assertThrows(AppException.class, () -> roomHoldService.extendHold(request));
//
//        // THEN
//        assertEquals(ErrorCode.HOLD_EXPIRED, exception.getErrorCode());
//        verify(roomHoldRepository, never()).save(any(RoomHold.class));
//        verify(roomHoldMapper, never()).toResponse(any(RoomHold.class));
//    }
//
//}