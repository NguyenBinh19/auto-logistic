package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.financial.RevenueReportRequest;
import com.HTPj.htpj.dto.response.financial.RevenueReportResponse;
import com.HTPj.htpj.dto.response.financial.RevenueReportResponse.*;
import com.HTPj.htpj.entity.Booking;
import com.HTPj.htpj.entity.BookingDetail;
import com.HTPj.htpj.entity.RoomType;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.repository.BookingRepository;
import com.HTPj.htpj.repository.RoomTypeRepository;
import com.HTPj.htpj.service.RevenueReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.time.temporal.IsoFields;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RevenueReportServiceImpl implements RevenueReportService {

    private final BookingRepository bookingRepository;
    private final RoomTypeRepository roomTypeRepository;

    private static final List<String> REVENUE_STATUSES = List.of(
            "BOOKED", "CHECKED-IN", "COMPLETED", "CANCELLED", "NO_SHOW"
    );
    // Statuses that count toward room nights sold (CANCELLED rooms are freed)
    private static final List<String> ROOM_NIGHT_STATUSES = List.of(
            "BOOKED", "CHECKED-IN", "COMPLETED", "NO_SHOW"
    );
    private static final int MAX_DAILY_RANGE_DAYS = 365;

    @Override
    public RevenueReportResponse generateReport(RevenueReportRequest request) {
        validateRequest(request);

        LocalDate start = request.getStartDate();
        LocalDate end = request.getEndDate();
        String granularity = request.getGranularity() != null ? request.getGranularity() : "DAILY";

        List<Booking> bookings = fetchRevenueBookings(request);
        List<RoomType> roomTypes = roomTypeRepository.findByHotel_HotelId(request.getHotelId());

        // Only count active room types for available room nights
        long daysInPeriod = ChronoUnit.DAYS.between(start, end) + 1;
        int totalPhysicalRooms = roomTypes.stream()
                .filter(rt -> "active".equalsIgnoreCase(rt.getRoomStatus()))
                .mapToInt(rt -> rt.getTotalRooms() != null ? rt.getTotalRooms() : 0)
                .sum();
        int totalRoomNightsAvailable = (int) (totalPhysicalRooms * daysInPeriod);

        // Build current period summary with overlap-based calculations
        RevenueSummary summary = buildSummary(bookings, totalRoomNightsAvailable, start, end);

        // Build previous period for comparison
        long periodLength = ChronoUnit.DAYS.between(start, end) + 1;
        LocalDate prevStart = start.minusDays(periodLength);
        LocalDate prevEnd = start.minusDays(1);

        RevenueReportRequest prevRequest = new RevenueReportRequest();
        prevRequest.setHotelId(request.getHotelId());
        prevRequest.setStartDate(prevStart);
        prevRequest.setEndDate(prevEnd);
        prevRequest.setAgencyId(request.getAgencyId());

        List<Booking> prevBookings = fetchRevenueBookings(prevRequest);
        int prevRoomNightsAvailable = (int) (totalPhysicalRooms * periodLength);
        RevenueSummary prevSummary = buildSummary(prevBookings, prevRoomNightsAvailable, prevStart, prevEnd);

        summary.setPreviousPeriodRevenue(prevSummary.getTotalRevenue());
        summary.setPreviousPeriodBookings(prevSummary.getTotalBookings());
        summary.setRevenueGrowthPercent(calcGrowth(summary.getTotalRevenue(), prevSummary.getTotalRevenue()));
        summary.setOccupancyGrowthPercent(calcGrowthDouble(summary.getOccupancyRate(), prevSummary.getOccupancyRate()));
        summary.setAdrGrowthPercent(calcGrowth(summary.getAdr(), prevSummary.getAdr()));
        summary.setRevParGrowthPercent(calcGrowth(summary.getRevPar(), prevSummary.getRevPar()));

        List<RevenueTrendItem> trend = buildTrend(bookings, start, end, granularity, totalPhysicalRooms);
        List<RevenueByRoomType> byRoomType = buildByRoomType(bookings, roomTypes, start, end);

        return RevenueReportResponse.builder()
                .summary(summary)
                .trend(trend)
                .byRoomType(byRoomType)
                .build();
    }

    private void validateRequest(RevenueReportRequest request) {
        if (request.getStartDate() == null || request.getEndDate() == null) {
            throw new AppException(ErrorCode.REPORT_INVALID_DATE_RANGE);
        }
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new AppException(ErrorCode.REPORT_INVALID_DATE_RANGE);
        }
        String gran = request.getGranularity() != null ? request.getGranularity() : "DAILY";
        long days = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
        if ("DAILY".equalsIgnoreCase(gran) && days > MAX_DAILY_RANGE_DAYS) {
            throw new AppException(ErrorCode.REPORT_DATE_RANGE_TOO_LARGE);
        }
    }

    private List<Booking> fetchRevenueBookings(RevenueReportRequest request) {
        if (request.getAgencyId() != null) {
            return bookingRepository.findRevenueBookingsByAgency(
                    request.getHotelId(),
                    REVENUE_STATUSES,
                    request.getStartDate(),
                    request.getEndDate(),
                    request.getAgencyId()
            );
        }
        return bookingRepository.findRevenueBookings(
                request.getHotelId(),
                REVENUE_STATUSES,
                request.getStartDate(),
                request.getEndDate()
        );
    }

    /**
     * Get earned amount for a booking based on status:
     * - CANCELLED: hotel earns only the cancellation penalty
     * - NO_SHOW: hotel keeps the full amount (no refund)
     * - Others: finalAmount
     */
    private BigDecimal getEarnedAmount(Booking b) {
        if ("CANCELLED".equalsIgnoreCase(b.getBookingStatus())) {
            return b.getCancellationPenalty() != null ? b.getCancellationPenalty() : BigDecimal.ZERO;
        }
        return b.getFinalAmount() != null ? b.getFinalAmount() : BigDecimal.ZERO;
    }

    /**
     * Count the number of stay nights that overlap with the report period [reportStart, reportEnd].
     * A "night" on date D means the guest sleeps that night: checkIn <= D < checkOut.
     * Report period dates reportStart through reportEnd are inclusive.
     */
    private int countOverlapNights(LocalDate checkIn, LocalDate checkOut,
                                   LocalDate reportStart, LocalDate reportEnd) {
        LocalDate overlapStart = checkIn.isAfter(reportStart) ? checkIn : reportStart;
        LocalDate overlapEnd = checkOut.isBefore(reportEnd.plusDays(1)) ? checkOut : reportEnd.plusDays(1);
        long overlap = ChronoUnit.DAYS.between(overlapStart, overlapEnd);
        return (int) Math.max(0, overlap);
    }

    private int getBookingTotalNights(Booking b) {
        if (b.getNights() != null && b.getNights() > 0) return b.getNights();
        return (int) Math.max(1, ChronoUnit.DAYS.between(b.getCheckInDate(), b.getCheckOutDate()));
    }

    /** Returns true if the booking status should count toward room nights sold */
    private boolean countsRoomNights(Booking b) {
        String status = b.getBookingStatus();
        return ROOM_NIGHT_STATUSES.stream().anyMatch(s -> s.equalsIgnoreCase(status));
    }

    // ─── Summary (overlap-based) ─────────────────────────────────────────────────

    private RevenueSummary buildSummary(List<Booking> bookings, int totalRoomNightsAvailable,
                                        LocalDate reportStart, LocalDate reportEnd) {
        BigDecimal totalRevenue = BigDecimal.ZERO;
        int totalRoomNightsSold = 0;
        int activeBookings = 0;
        int cancelledBookings = 0;

        for (Booking b : bookings) {
            int totalNights = getBookingTotalNights(b);
            int overlapNights = countOverlapNights(b.getCheckInDate(), b.getCheckOutDate(),
                    reportStart, reportEnd);
            if (overlapNights <= 0) continue;

            // Pro-rate revenue by overlap nights / total nights
            BigDecimal earned = getEarnedAmount(b);
            BigDecimal overlapRevenue = earned.multiply(BigDecimal.valueOf(overlapNights))
                    .divide(BigDecimal.valueOf(totalNights), 2, RoundingMode.HALF_UP);
            totalRevenue = totalRevenue.add(overlapRevenue);

            if ("CANCELLED".equalsIgnoreCase(b.getBookingStatus())) {
                cancelledBookings++;
            } else {
                activeBookings++;
            }

            // Only count room nights for non-cancelled statuses
            if (countsRoomNights(b)) {
                int rooms = b.getTotalRooms() != null ? b.getTotalRooms() : 1;
                totalRoomNightsSold += overlapNights * rooms;
            }
        }

        double occupancyRate = totalRoomNightsAvailable > 0
                ? (double) totalRoomNightsSold / totalRoomNightsAvailable * 100
                : 0.0;

        BigDecimal adr = totalRoomNightsSold > 0
                ? totalRevenue.divide(BigDecimal.valueOf(totalRoomNightsSold), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal revPar = totalRoomNightsAvailable > 0
                ? totalRevenue.divide(BigDecimal.valueOf(totalRoomNightsAvailable), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return RevenueSummary.builder()
                .totalRevenue(totalRevenue)
                .totalBookings(activeBookings)
                .cancelledBookings(cancelledBookings)
                .totalRoomNightsSold(totalRoomNightsSold)
                .totalRoomNightsAvailable(totalRoomNightsAvailable)
                .occupancyRate(Math.round(occupancyRate * 100.0) / 100.0)
                .adr(adr)
                .revPar(revPar)
                .build();
    }

    // ─── Trend (per-night distribution then grouped by granularity) ───────────────

    private List<RevenueTrendItem> buildTrend(List<Booking> bookings, LocalDate start,
                                              LocalDate end, String granularity,
                                              int totalPhysicalRooms) {
        // Step 1: Build daily accumulators for revenue, room nights, booking IDs
        Map<LocalDate, BigDecimal> dailyRevenue = new LinkedHashMap<>();
        Map<LocalDate, Integer> dailyRoomNights = new LinkedHashMap<>();
        Map<LocalDate, Set<Long>> dailyBookingIds = new LinkedHashMap<>();

        for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
            dailyRevenue.put(d, BigDecimal.ZERO);
            dailyRoomNights.put(d, 0);
            dailyBookingIds.put(d, new HashSet<>());
        }

        // Step 2: Distribute each booking's revenue across its overlap nights
        for (Booking b : bookings) {
            int totalNights = getBookingTotalNights(b);
            BigDecimal earned = getEarnedAmount(b);
            BigDecimal perNight = totalNights > 0
                    ? earned.divide(BigDecimal.valueOf(totalNights), 4, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
            int rooms = b.getTotalRooms() != null ? b.getTotalRooms() : 1;
            boolean countsRN = countsRoomNights(b);

            LocalDate nightStart = b.getCheckInDate().isBefore(start) ? start : b.getCheckInDate();
            LocalDate nightEnd = b.getCheckOutDate().isAfter(end.plusDays(1)) ? end.plusDays(1) : b.getCheckOutDate();

            for (LocalDate d = nightStart; d.isBefore(nightEnd); d = d.plusDays(1)) {
                dailyRevenue.merge(d, perNight, BigDecimal::add);
                dailyBookingIds.get(d).add(b.getBookingId());
                if (countsRN) {
                    dailyRoomNights.merge(d, rooms, Integer::sum);
                }
            }
        }

        // Step 3: Build buckets and aggregate daily data into them
        Map<String, LocalDate[]> buckets = buildBuckets(start, end, granularity);

        List<RevenueTrendItem> items = new ArrayList<>();
        for (Map.Entry<String, LocalDate[]> bucket : buckets.entrySet()) {
            LocalDate bucketStart = bucket.getValue()[0];
            LocalDate bucketEnd = bucket.getValue()[1];

            BigDecimal revenue = BigDecimal.ZERO;
            int roomNightsSold = 0;
            Set<Long> bookingIds = new HashSet<>();
            int periodDays = 0;

            // Only count days that fall within the report range
            for (LocalDate d = bucketStart; !d.isAfter(bucketEnd); d = d.plusDays(1)) {
                if (!d.isBefore(start) && !d.isAfter(end)) {
                    revenue = revenue.add(dailyRevenue.getOrDefault(d, BigDecimal.ZERO));
                    roomNightsSold += dailyRoomNights.getOrDefault(d, 0);
                    bookingIds.addAll(dailyBookingIds.getOrDefault(d, Collections.emptySet()));
                    periodDays++;
                }
            }

            int periodAvailable = totalPhysicalRooms * periodDays;
            double occ = periodAvailable > 0
                    ? (double) roomNightsSold / periodAvailable * 100 : 0.0;

            items.add(RevenueTrendItem.builder()
                    .period(bucket.getKey())
                    .revenue(revenue.setScale(2, RoundingMode.HALF_UP))
                    .bookings(bookingIds.size())
                    .roomNightsSold(roomNightsSold)
                    .occupancyRate(Math.round(occ * 100.0) / 100.0)
                    .build());
        }
        return items;
    }

    /**
     * Build ordered buckets for the given granularity.
     * Each entry: key -> [bucketStart, bucketEnd] (inclusive).
     * Weekly buckets are normalized to ISO Monday.
     * Monthly buckets use the full calendar month boundaries.
     * The actual report range is clipped when aggregating, not here.
     */
    private Map<String, LocalDate[]> buildBuckets(LocalDate start, LocalDate end, String granularity) {
        Map<String, LocalDate[]> buckets = new LinkedHashMap<>();

        if ("MONTHLY".equalsIgnoreCase(granularity)) {
            LocalDate cursor = start.withDayOfMonth(1);
            while (!cursor.isAfter(end)) {
                String key = cursor.getYear() + "-" + String.format("%02d", cursor.getMonthValue());
                LocalDate monthEnd = cursor.plusMonths(1).minusDays(1);
                buckets.put(key, new LocalDate[]{cursor, monthEnd});
                cursor = cursor.plusMonths(1);
            }
        } else if ("WEEKLY".equalsIgnoreCase(granularity)) {
            // Normalize to ISO Monday
            LocalDate cursor = start.with(DayOfWeek.MONDAY);
            if (cursor.isAfter(start)) cursor = cursor.minusWeeks(1);
            while (!cursor.isAfter(end)) {
                int isoYear = cursor.get(IsoFields.WEEK_BASED_YEAR);
                int isoWeek = cursor.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
                String key = isoYear + "-W" + String.format("%02d", isoWeek);
                LocalDate weekEnd = cursor.plusDays(6);
                buckets.put(key, new LocalDate[]{cursor, weekEnd});
                cursor = cursor.plusWeeks(1);
            }
        } else { // DAILY
            LocalDate cursor = start;
            while (!cursor.isAfter(end)) {
                buckets.put(cursor.toString(), new LocalDate[]{cursor, cursor});
                cursor = cursor.plusDays(1);
            }
        }
        return buckets;
    }

    // ─── By Room Type (overlap-aware, consistent with summary) ───────────────────

    private List<RevenueByRoomType> buildByRoomType(List<Booking> bookings,
                                                    List<RoomType> roomTypes,
                                                    LocalDate reportStart,
                                                    LocalDate reportEnd) {
        Map<Integer, BigDecimal> revenueMap = new HashMap<>();
        Map<Integer, Integer> nightsMap = new HashMap<>();

        for (Booking b : bookings) {
            if (b.getBookingDetails() == null) continue;

            int totalNights = getBookingTotalNights(b);
            int overlapNights = countOverlapNights(b.getCheckInDate(), b.getCheckOutDate(),
                    reportStart, reportEnd);
            if (overlapNights <= 0) continue;

            BigDecimal earned = getEarnedAmount(b);
            // Use booking-level totalAmount as denominator for proportional split
            BigDecimal bookingTotal = b.getTotalAmount() != null && b.getTotalAmount().compareTo(BigDecimal.ZERO) > 0
                    ? b.getTotalAmount() : BigDecimal.ONE;

            for (BookingDetail bd : b.getBookingDetails()) {
                Integer rtId = bd.getRoomType().getRoomTypeId();
                BigDecimal detailAmount = bd.getTotalAmount() != null ? bd.getTotalAmount() : BigDecimal.ZERO;
                int qty = bd.getQuantity() != null ? bd.getQuantity() : 1;

                // Proportional share of earned amount, pro-rated by overlap
                BigDecimal rtShare = earned.multiply(detailAmount)
                        .divide(bookingTotal, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(overlapNights))
                        .divide(BigDecimal.valueOf(totalNights), 2, RoundingMode.HALF_UP);

                revenueMap.merge(rtId, rtShare, BigDecimal::add);
                if (countsRoomNights(b)) {
                    nightsMap.merge(rtId, overlapNights * qty, Integer::sum);
                }
            }
        }

        // Use the sum of per-room-type revenue as the denominator for contribution
        // This guarantees contributions sum to exactly 100%
        BigDecimal totalRevenue = revenueMap.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<RevenueByRoomType> result = new ArrayList<>();
        for (RoomType rt : roomTypes) {
            BigDecimal rev = revenueMap.getOrDefault(rt.getRoomTypeId(), BigDecimal.ZERO);
            int nights = nightsMap.getOrDefault(rt.getRoomTypeId(), 0);
            double contribution = totalRevenue.compareTo(BigDecimal.ZERO) > 0
                    ? rev.divide(totalRevenue, 4, RoundingMode.HALF_UP).doubleValue() * 100
                    : 0.0;

            result.add(RevenueByRoomType.builder()
                    .roomTypeId(rt.getRoomTypeId())
                    .roomTypeName(rt.getRoomTitle())
                    .revenue(rev)
                    .roomNightsSold(nights)
                    .contribution(Math.round(contribution * 100.0) / 100.0)
                    .build());
        }
        return result;
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    private String getPeriodKey(LocalDate date, String granularity) {
        if ("MONTHLY".equalsIgnoreCase(granularity)) {
            return date.getYear() + "-" + String.format("%02d", date.getMonthValue());
        } else if ("WEEKLY".equalsIgnoreCase(granularity)) {
            int isoYear = date.get(IsoFields.WEEK_BASED_YEAR);
            int isoWeek = date.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
            return isoYear + "-W" + String.format("%02d", isoWeek);
        }
        return date.toString();
    }

    private Double calcGrowth(BigDecimal current, BigDecimal previous) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) return null;
        return current.subtract(previous)
                .divide(previous, 4, RoundingMode.HALF_UP)
                .doubleValue() * 100;
    }

    private Double calcGrowthDouble(Double current, Double previous) {
        if (previous == null || previous == 0.0) return null;
        return ((current - previous) / previous) * 100;
    }
}
