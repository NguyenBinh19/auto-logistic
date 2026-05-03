package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.booking.RoomAvailabilityRequest;
import com.HTPj.htpj.dto.request.roomHold.CreateRoomHoldRequest;
import com.HTPj.htpj.dto.request.roomHold.ExtendRoomHoldRequest;
import com.HTPj.htpj.dto.response.booking.RoomAvailabilityResponse;
import com.HTPj.htpj.dto.response.roomHold.RoomHoldResponse;
import com.HTPj.htpj.entity.RoomHold;
import com.HTPj.htpj.entity.RoomHoldDetail;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.mapper.RoomHoldMapper;
import com.HTPj.htpj.repository.RoomHoldRepository;
import com.HTPj.htpj.service.BookingService;
import com.HTPj.htpj.service.RoomHoldService;
//import com.HTPj.htpj.temporal.client.RoomHoldWorkflowClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
@Service
@RequiredArgsConstructor
public class RoomHoldServiceImpl implements RoomHoldService {

    private final RoomHoldRepository roomHoldRepository;
    private final RoomHoldMapper roomHoldMapper;
//    private final RoomHoldWorkflowClient workflowClient;
    private final BookingService bookingService;


    @Override
    public RoomHoldResponse createHold(CreateRoomHoldRequest req) {

        RoomAvailabilityRequest avaiRequest = RoomAvailabilityRequest.builder()
                .hotelId(req.getHotelId())
                .checkIn(req.getCheckInDate())
                .checkOut(req.getCheckOutDate())
                .build();
        List<RoomAvailabilityResponse> avaiResponses = bookingService.checkAvailability(avaiRequest);

        for (var item : req.getItems()) {
            RoomAvailabilityResponse avai = avaiResponses.stream()
                    .filter(r -> r.getRoomTypeId().equals(item.getRoomTypeId()))
                    .findFirst()
                    .orElseThrow(() -> new AppException(ErrorCode.ROOM_TYPE_NOT_FOUND));

            if (avai.getQuantityAvaiable() < item.getQuantity()) {
                throw new AppException(ErrorCode.ROOM_NOT_AVAILABLE);
            }
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiredAt = now.plusMinutes(15);

        RoomHold hold = RoomHold.builder()
                .holdCode("HOLD-" + UUID.randomUUID())
                .hotelId(req.getHotelId())
                .checkInDate(req.getCheckInDate())
                .checkOutDate(req.getCheckOutDate())
                .createdAt(now)
                .expiredAt(expiredAt)
                .status("HOLDING")
                .build();

        List<RoomHoldDetail> details = req.getItems().stream()
                .map(i -> RoomHoldDetail.builder()
                        .roomHold(hold)
                        .roomTypeId(i.getRoomTypeId())
                        .quantity(i.getQuantity())
                        .build())
                .toList();

        hold.setDetails(details);

        roomHoldRepository.save(hold);

//        workflowClient.startWorkflow(
//                hold.getHoldCode(),
//                expiredAt.atZone(java.time.ZoneId.systemDefault())
//                        .toInstant()
//                        .toEpochMilli()
//        );


        return roomHoldMapper.toResponse(hold);
    }

    @Override
    public RoomHoldResponse extendHold(ExtendRoomHoldRequest request) {

        final int EXTEND_MINUTES = 15;

        RoomHold hold = roomHoldRepository.findByHoldCode(request.getHoldCode())
                .orElseThrow(() -> new AppException(ErrorCode.HOLD_NOT_FOUND));

        if (!"HOLDING".equals(hold.getStatus())) {
            throw new AppException(ErrorCode.HOLD_EXPIRED);
        }

        LocalDateTime newExpiredAt = LocalDateTime.now().plusMinutes(EXTEND_MINUTES);

        hold.setExpiredAt(newExpiredAt);
        roomHoldRepository.save(hold);

        long newExpireEpochMillis = newExpiredAt
                .atZone(java.time.ZoneId.systemDefault())
                .toInstant()
                .toEpochMilli();

//        workflowClient.extendWorkflow(
//                hold.getHoldCode(),
//                newExpireEpochMillis
//        );

        return roomHoldMapper.toResponse(hold);
    }



}
