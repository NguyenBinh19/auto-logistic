package com.HTPj.htpj.dto.response.financial;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueReportResponse {
    private RevenueSummary summary;
    private List<RevenueTrendItem> trend;
    private List<RevenueByRoomType> byRoomType;

    @NoArgsConstructor
    @AllArgsConstructor
    @Data
    @Builder
    public static class RevenueSummary {
        private BigDecimal totalRevenue;
        private BigDecimal previousPeriodRevenue;
        private Double revenueGrowthPercent;
        private Integer totalBookings;
        private Integer cancelledBookings;
        private Integer previousPeriodBookings;
        private Integer totalRoomNightsSold;
        private Integer totalRoomNightsAvailable;
        private Double occupancyRate;           // BR-RPT-01
        private BigDecimal adr;                 // Average Daily Rate
        private BigDecimal revPar;              // Revenue Per Available Room
        private Double occupancyGrowthPercent;
        private Double adrGrowthPercent;
        private Double revParGrowthPercent;
    }
    @NoArgsConstructor
    @AllArgsConstructor
    @Data
    @Builder
    public static class RevenueTrendItem {
        private String period;          // date label based on granularity
        private BigDecimal revenue;
        private Integer bookings;
        private Integer roomNightsSold;
        private Double occupancyRate;
    }

    @Data
    @Builder
    public static class RevenueByRoomType {
        private Integer roomTypeId;
        private String roomTypeName;
        private BigDecimal revenue;
        private Integer roomNightsSold;
        private Double contribution;    // percentage of total revenue
    }
}
