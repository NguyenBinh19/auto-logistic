package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.allotment.BulkAllotmentUpdateRequest;
import com.HTPj.htpj.dto.request.allotment.SingleAllotmentUpdateRequest;
import com.HTPj.htpj.dto.request.allotment.StopSellRequest;
import com.HTPj.htpj.dto.response.allotment.InventoryGridResponse;
import com.HTPj.htpj.dto.response.allotment.RoomAllotmentResponse;
import com.HTPj.htpj.entity.RoomAllotment;
import com.HTPj.htpj.entity.RoomType;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.repository.BookingDetailRepository;
import com.HTPj.htpj.repository.RoomAllotmentRepository;
import com.HTPj.htpj.repository.RoomTypeRepository;
import com.HTPj.htpj.service.RoomAllotmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomAllotmentServiceImpl implements RoomAllotmentService {

    private final RoomAllotmentRepository allotmentRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final BookingDetailRepository bookingDetailRepository;

    @Override
    public List<InventoryGridResponse> getInventoryGrid(LocalDate startDate, LocalDate endDate) {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        Jwt jwt = (Jwt) authentication.getPrincipal();

        Number hotelIdNum = jwt.getClaim("hotelId");
        Integer hotelId = hotelIdNum.intValue();
        List<RoomType> roomTypes = roomTypeRepository.findByHotel_HotelId(hotelId);
        if (roomTypes.isEmpty()) return Collections.emptyList();

        List<Integer> roomTypeIds = roomTypes.stream()
                .map(RoomType::getRoomTypeId).toList();

        // Fetch all allotments for the date range
        List<RoomAllotment> allotments = allotmentRepository
                .findByRoomTypeIdsAndDateRange(roomTypeIds, startDate, endDate);

        // Group by roomTypeId
        Map<Integer, List<RoomAllotment>> allotmentMap = allotments.stream()
                .collect(Collectors.groupingBy(RoomAllotment::getRoomTypeId));

        // Compute sold counts from bookings
        List<String> activeStatuses = List.of("BOOKED", "PENDING", "CHECKED_IN");
        Map<Integer, Map<LocalDate, Integer>> soldCountMap = computeSoldCounts(
                hotelId, roomTypeIds, startDate, endDate, activeStatuses);

        List<InventoryGridResponse> result = new ArrayList<>();

        for (RoomType rt : roomTypes) {
            if (!"active".equalsIgnoreCase(rt.getRoomStatus())) continue;

            List<RoomAllotment> rtAllotments = allotmentMap
                    .getOrDefault(rt.getRoomTypeId(), Collections.emptyList());

            Map<LocalDate, RoomAllotment> dateMap = rtAllotments.stream()
                    .collect(Collectors.toMap(RoomAllotment::getAllotmentDate, a -> a));

            Map<LocalDate, Integer> rtSoldMap = soldCountMap
                    .getOrDefault(rt.getRoomTypeId(), Collections.emptyMap());

            List<RoomAllotmentResponse> dateResponses = new ArrayList<>();
            for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
                RoomAllotment existing = dateMap.get(date);
                int sold = rtSoldMap.getOrDefault(date, 0);
                int allotment = existing != null ? existing.getAllotment() : rt.getTotalRooms();
                boolean stopSell = existing != null && Boolean.TRUE.equals(existing.getStopSell());
                int available = Math.max(0, allotment - sold);

                dateResponses.add(RoomAllotmentResponse.builder()
                        .allotmentId(existing != null ? existing.getAllotmentId() : null)
                        .roomTypeId(rt.getRoomTypeId())
                        .roomTypeName(rt.getRoomTitle())
                        .date(date)
                        .totalPhysicalRooms(rt.getTotalRooms())
                        .allotment(allotment)
                        .soldCount(sold)
                        .available(available)
                        .stopSell(stopSell)
                        .status(computeStatus(available, stopSell))
                        .updatedAt(existing != null ? existing.getUpdatedAt() : null)
                        .build());
            }

            result.add(InventoryGridResponse.builder()
                    .roomTypeId(rt.getRoomTypeId())
                    .roomTypeName(rt.getRoomTitle())
                    .totalPhysicalRooms(rt.getTotalRooms())
                    .dates(dateResponses)
                    .build());
        }

        return result;
    }

    @Override
    @Transactional
    public List<RoomAllotmentResponse> bulkUpdateAllotment(BulkAllotmentUpdateRequest request) {
        validateDateRange(request.getStartDate(), request.getEndDate());

        RoomType roomType = roomTypeRepository.findById(request.getRoomTypeId())
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_TYPE_NOT_FOUND));

        // BR-INV-01: Cannot exceed physical rooms
        if (request.getAllotment() > roomType.getTotalRooms()) {
            throw new AppException(ErrorCode.ALLOTMENT_EXCEEDS_PHYSICAL);
        }

        Set<String> allowedDays = request.getDaysOfWeek() != null && !request.getDaysOfWeek().isEmpty()
                ? new HashSet<>(request.getDaysOfWeek())
                : null;

        // Compute sold counts
        List<String> activeStatuses = List.of("BOOKED", "PENDING", "CHECKED_IN");
        Map<LocalDate, Integer> soldMap = computeSoldCountsForRoomType(
                roomType.getHotel().getHotelId(),
                request.getRoomTypeId(),
                request.getStartDate(),
                request.getEndDate(),
                activeStatuses);

        // Fetch existing allotments
        List<RoomAllotment> existingList = allotmentRepository
                .findByRoomTypeIdAndAllotmentDateBetween(
                        request.getRoomTypeId(), request.getStartDate(), request.getEndDate());
        Map<LocalDate, RoomAllotment> existingMap = existingList.stream()
                .collect(Collectors.toMap(RoomAllotment::getAllotmentDate, a -> a));

        List<RoomAllotment> toSave = new ArrayList<>();
        List<RoomAllotmentResponse> responses = new ArrayList<>();

        for (LocalDate date = request.getStartDate(); !date.isAfter(request.getEndDate()); date = date.plusDays(1)) {
            if (allowedDays != null) {
                String dayName = date.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH).toUpperCase();
                if (!allowedDays.contains(dayName)) continue;
            }

            int sold = soldMap.getOrDefault(date, 0);

            // BR-INV-02: Cannot reduce below sold count
            if (request.getAllotment() < sold) {
                throw new AppException(ErrorCode.ALLOTMENT_BELOW_SOLD);
            }

            RoomAllotment allotment = existingMap.getOrDefault(date,
                    RoomAllotment.builder()
                            .roomTypeId(request.getRoomTypeId())
                            .allotmentDate(date)
                            .soldCount(sold)
                            .stopSell(false)
                            .build());

            allotment.setAllotment(request.getAllotment());
            allotment.setSoldCount(sold);
            toSave.add(allotment);
        }

        List<RoomAllotment> saved = allotmentRepository.saveAll(toSave);

        for (RoomAllotment a : saved) {
            int available = a.getAvailable();
            boolean stopSell = Boolean.TRUE.equals(a.getStopSell());
            responses.add(RoomAllotmentResponse.builder()
                    .allotmentId(a.getAllotmentId())
                    .roomTypeId(a.getRoomTypeId())
                    .roomTypeName(roomType.getRoomTitle())
                    .date(a.getAllotmentDate())
                    .totalPhysicalRooms(roomType.getTotalRooms())
                    .allotment(a.getAllotment())
                    .soldCount(a.getSoldCount())
                    .available(available)
                    .stopSell(stopSell)
                    .status(computeStatus(available, stopSell))
                    .updatedAt(a.getUpdatedAt())
                    .build());
        }

        return responses;
    }

    @Override
    @Transactional
    public RoomAllotmentResponse updateSingleAllotment(SingleAllotmentUpdateRequest request) {
        RoomType roomType = roomTypeRepository.findById(request.getRoomTypeId())
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_TYPE_NOT_FOUND));

        // BR-INV-01
        if (request.getAllotment() > roomType.getTotalRooms()) {
            throw new AppException(ErrorCode.ALLOTMENT_EXCEEDS_PHYSICAL);
        }

        // Compute sold for this date
        List<String> activeStatuses = List.of("BOOKED", "PENDING", "CHECKED_IN");
        Map<LocalDate, Integer> soldMap = computeSoldCountsForRoomType(
                roomType.getHotel().getHotelId(),
                request.getRoomTypeId(),
                request.getDate(),
                request.getDate(),
                activeStatuses);
        int sold = soldMap.getOrDefault(request.getDate(), 0);

        // BR-INV-02
        if (request.getAllotment() < sold) {
            throw new AppException(ErrorCode.ALLOTMENT_BELOW_SOLD);
        }

        RoomAllotment allotment = allotmentRepository
                .findByRoomTypeIdAndAllotmentDate(request.getRoomTypeId(), request.getDate())
                .orElse(RoomAllotment.builder()
                        .roomTypeId(request.getRoomTypeId())
                        .allotmentDate(request.getDate())
                        .soldCount(sold)
                        .stopSell(false)
                        .build());

        allotment.setAllotment(request.getAllotment());
        allotment.setSoldCount(sold);

        RoomAllotment saved = allotmentRepository.save(allotment);
        int available = saved.getAvailable();
        boolean stopSell = Boolean.TRUE.equals(saved.getStopSell());

        return RoomAllotmentResponse.builder()
                .allotmentId(saved.getAllotmentId())
                .roomTypeId(saved.getRoomTypeId())
                .roomTypeName(roomType.getRoomTitle())
                .date(saved.getAllotmentDate())
                .totalPhysicalRooms(roomType.getTotalRooms())
                .allotment(saved.getAllotment())
                .soldCount(saved.getSoldCount())
                .available(available)
                .stopSell(stopSell)
                .status(computeStatus(available, stopSell))
                .updatedAt(saved.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional
    public List<RoomAllotmentResponse> setStopSell(StopSellRequest request) {
        return updateStopSellStatus(request, true);
    }

    @Override
    @Transactional
    public List<RoomAllotmentResponse> removeStopSell(StopSellRequest request) {
        return updateStopSellStatus(request, false);
    }

    private List<RoomAllotmentResponse> updateStopSellStatus(StopSellRequest request, boolean stopSell) {
        validateDateRange(request.getStartDate(), request.getEndDate());

        RoomType roomType = roomTypeRepository.findById(request.getRoomTypeId())
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_TYPE_NOT_FOUND));

        Set<String> allowedDays = request.getDaysOfWeek() != null && !request.getDaysOfWeek().isEmpty()
                ? new HashSet<>(request.getDaysOfWeek())
                : null;

        List<RoomAllotment> existingList = allotmentRepository
                .findByRoomTypeIdAndAllotmentDateBetween(
                        request.getRoomTypeId(), request.getStartDate(), request.getEndDate());
        Map<LocalDate, RoomAllotment> existingMap = existingList.stream()
                .collect(Collectors.toMap(RoomAllotment::getAllotmentDate, a -> a));

        List<RoomAllotment> toSave = new ArrayList<>();

        for (LocalDate date = request.getStartDate(); !date.isAfter(request.getEndDate()); date = date.plusDays(1)) {
            if (allowedDays != null) {
                String dayName = date.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH).toUpperCase();
                if (!allowedDays.contains(dayName)) continue;
            }

            RoomAllotment allotment = existingMap.getOrDefault(date,
                    RoomAllotment.builder()
                            .roomTypeId(request.getRoomTypeId())
                            .allotmentDate(date)
                            .allotment(roomType.getTotalRooms())
                            .soldCount(0)
                            .build());

            allotment.setStopSell(stopSell);
            toSave.add(allotment);
        }

        List<RoomAllotment> saved = allotmentRepository.saveAll(toSave);
        List<RoomAllotmentResponse> responses = new ArrayList<>();

        for (RoomAllotment a : saved) {
            int available = a.getAvailable();
            boolean ss = Boolean.TRUE.equals(a.getStopSell());
            responses.add(RoomAllotmentResponse.builder()
                    .allotmentId(a.getAllotmentId())
                    .roomTypeId(a.getRoomTypeId())
                    .roomTypeName(roomType.getRoomTitle())
                    .date(a.getAllotmentDate())
                    .totalPhysicalRooms(roomType.getTotalRooms())
                    .allotment(a.getAllotment())
                    .soldCount(a.getSoldCount())
                    .available(available)
                    .stopSell(ss)
                    .status(computeStatus(available, ss))
                    .updatedAt(a.getUpdatedAt())
                    .build());
        }

        return responses;
    }

    private String computeStatus(int available, boolean stopSell) {
        if (stopSell) return "STOP_SELL";
        if (available <= 0) return "SOLD_OUT";
        if (available < 3) return "HURRY";
        return "AVAILABLE";
    }

    private void validateDateRange(LocalDate start, LocalDate end) {
        if (start == null || end == null || end.isBefore(start)) {
            throw new AppException(ErrorCode.ALLOTMENT_INVALID_DATE_RANGE);
        }
    }

    private Map<Integer, Map<LocalDate, Integer>> computeSoldCounts(
            Integer hotelId,
            List<Integer> roomTypeIds,
            LocalDate startDate,
            LocalDate endDate,
            List<String> statuses) {

        var bookingDetails = bookingDetailRepository
                .findOverlappingBookings(hotelId, startDate, endDate.plusDays(1), statuses);

        Map<Integer, Map<LocalDate, Integer>> result = new HashMap<>();

        for (var bd : bookingDetails) {
            Integer rtId = bd.getRoomType().getRoomTypeId();
            if (!roomTypeIds.contains(rtId)) continue;

            LocalDate bookCheckIn = bd.getBooking().getCheckInDate();
            LocalDate bookCheckOut = bd.getBooking().getCheckOutDate();
            LocalDate overlapStart = bookCheckIn.isBefore(startDate) ? startDate : bookCheckIn;
            LocalDate overlapEnd = bookCheckOut.isAfter(endDate.plusDays(1)) ? endDate : bookCheckOut.minusDays(1);

            for (LocalDate d = overlapStart; !d.isAfter(overlapEnd); d = d.plusDays(1)) {
                result.computeIfAbsent(rtId, k -> new HashMap<>())
                        .merge(d, bd.getQuantity(), Integer::sum);
            }
        }

        return result;
    }

    private Map<LocalDate, Integer> computeSoldCountsForRoomType(
            Integer hotelId,
            Integer roomTypeId,
            LocalDate startDate,
            LocalDate endDate,
            List<String> statuses) {

        Map<Integer, Map<LocalDate, Integer>> all = computeSoldCounts(
                hotelId, List.of(roomTypeId), startDate, endDate, statuses);
        return all.getOrDefault(roomTypeId, Collections.emptyMap());
    }
}
