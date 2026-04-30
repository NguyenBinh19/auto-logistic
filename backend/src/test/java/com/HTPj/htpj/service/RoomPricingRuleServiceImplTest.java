//package com.HTPj.htpj.service;
//
//import com.HTPj.htpj.dto.request.pricingrule.RoomPricingRuleRequest;
//import com.HTPj.htpj.dto.response.pricingrule.RoomPricingRuleResponse;
//import com.HTPj.htpj.entity.RoomPricingRule;
//import com.HTPj.htpj.repository.RoomPricingRuleRepository;
//import com.HTPj.htpj.service.impl.RoomPricingRuleServiceImpl;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//
//import java.math.BigDecimal;
//import java.time.LocalDate;
//import java.util.Collections;
//import java.util.List;
//import java.util.Optional;
//
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
//import static org.junit.jupiter.api.Assertions.assertThrows;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//class RoomPricingRuleServiceImplTest {
//
//    @Mock
//    private RoomPricingRuleRepository repository;
//
//    @InjectMocks
//    private RoomPricingRuleServiceImpl service;
//
//    // Helper tạo request nhanh
//    private RoomPricingRuleRequest createRequest(String type) {
//        RoomPricingRuleRequest request = new RoomPricingRuleRequest();
//        request.setRoomTypeId(1);
//        request.setRuleType(type);
//        request.setPriority(1);
//        request.setAction("INCREASE");
//        request.setAdjustmentType("FIXED");
//        request.setAdjustmentValue(BigDecimal.valueOf(100000));
//        return request;
//    }
//
//    @Test
//    void create_WeeklyRule_Success() {
//        // GIVEN
//        RoomPricingRuleRequest request = createRequest("WEEKLY");
//        request.setDayOfWeek("Monday");
//
//        // Mock behavior: repository.save trả về chính entity đó sau khi lưu
//        when(repository.save(any(RoomPricingRule.class))).thenAnswer(i -> i.getArguments()[0]);
//
//        // WHEN
//        RoomPricingRuleResponse response = service.create(request);
//
//        // THEN
//        assertThat(response).isNotNull();
//        verify(repository, times(1)).save(any());
//        // Đảm bảo không gọi check conflict cho loại WEEKLY
//        verify(repository, never()).findOverlappingEvent(any(), any(), any());
//    }
//    @Test
//    void create_EventRule_Success() {
//        // GIVEN
//        RoomPricingRuleRequest request = createRequest("EVENT");
//        request.setStartDate(LocalDate.of(2026, 5, 1));
//        request.setEndDate(LocalDate.of(2026, 5, 3));
//
//        // Không tìm thấy conflict (trả về list rỗng)
//        when(repository.findOverlappingEvent(any(), any(), any())).thenReturn(List.of());
//        when(repository.save(any())).thenAnswer(i -> i.getArguments()[0]);
//
//        // WHEN
//        RoomPricingRuleResponse response = service.create(request);
//
//        // THEN
//        assertThat(response).isNotNull();
//        verify(repository).findOverlappingEvent(eq(1), eq(request.getStartDate()), eq(request.getEndDate()));
//        verify(repository).save(any());
//    }
//    @Test
//    void create_EventRule_Conflict_ShouldThrowException() {
//        // GIVEN
//        RoomPricingRuleRequest request = createRequest("EVENT");
//        request.setStartDate(LocalDate.now());
//        request.setEndDate(LocalDate.now().plusDays(1));
//
//        // Giả lập tìm thấy một rule đã tồn tại trong khoảng ngày này
//        when(repository.findOverlappingEvent(any(), any(), any()))
//                .thenReturn(List.of(new RoomPricingRule()));
//
//        // WHEN & THEN
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> service.create(request));
//
//        assertThat(exception.getMessage()).isEqualTo("Event date conflict detected");
//        // Quan trọng: Đảm bảo Save KHÔNG bao giờ được gọi nếu có lỗi
//        verify(repository, never()).save(any());
//    }
//    @Test
//    void create_WeeklyRule_MissingDayOfWeek_ShouldThrowException() {
//        // GIVEN: Type WEEKLY nhưng dayOfWeek null
//        RoomPricingRuleRequest request = createRequest("WEEKLY");
//        request.setDayOfWeek(null);
//
//        // WHEN & THEN
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> service.create(request));
//        assertThat(exception.getMessage()).isEqualTo("Day of week is required for WEEKLY rule");
//    }
//
//    @Test
//    void create_EventRule_MissingDates_ShouldThrowException() {
//        // GIVEN: Type EVENT nhưng thiếu ngày
//        RoomPricingRuleRequest request = createRequest("EVENT");
//        request.setStartDate(null);
//
//        // WHEN & THEN
//        RuntimeException exception = assertThrows(RuntimeException.class, () -> service.create(request));
//        assertThat(exception.getMessage()).contains("Start date and End date are required");
//    }
//
//    @Test
//    void update_Success_ShouldSaveAndReturnResponse() {
//        // GIVEN
//        Integer ruleId = 100;
//        RoomPricingRuleRequest request = new RoomPricingRuleRequest();
//        request.setRuleType("WEEKLY");
//        request.setDayOfWeek("Sunday");
//        request.setRoomTypeId(1);
//
//        RoomPricingRule existingRule = new RoomPricingRule();
//        existingRule.setRuleId(ruleId);
//
//        // Mock tìm thấy rule cũ
//        when(repository.findById(ruleId)).thenReturn(Optional.of(existingRule));
//        // Mock lưu thành công
//        when(repository.save(any(RoomPricingRule.class))).thenAnswer(i -> i.getArguments()[0]);
//
//        // WHEN
//        RoomPricingRuleResponse response = service.update(ruleId, request);
//
//        // THEN
//        assertThat(response).isNotNull();
//        verify(repository).findById(ruleId);
//        verify(repository).save(existingRule); // Đảm bảo lưu đúng instance đã tìm thấy
//    }
//
//    @Test
//    void update_EventConflict_ShouldThrowException() {
//        // GIVEN
//        Integer ruleId = 100;
//        RoomPricingRuleRequest request = new RoomPricingRuleRequest();
//        request.setRuleType("EVENT");
//        request.setStartDate(LocalDate.now());
//        request.setEndDate(LocalDate.now().plusDays(2));
//
//        when(repository.findById(ruleId)).thenReturn(Optional.of(new RoomPricingRule()));
//
//        // Giả lập tìm thấy conflict với một rule khác
//        when(repository.findOverlappingEventForUpdate(any(), eq(ruleId), any(), any()))
//                .thenReturn(List.of(new RoomPricingRule()));
//
//        // WHEN & THEN
//        RuntimeException ex = assertThrows(RuntimeException.class, () -> service.update(ruleId, request));
//
//        assertThat(ex.getMessage()).isEqualTo("Event date conflict detected");
//        verify(repository, never()).save(any());
//    }
//    @Test
//    void update_RuleIdNotFound_ShouldThrowException() {
//        // GIVEN
//        Integer ruleId = 999;
//        when(repository.findById(ruleId)).thenReturn(Optional.empty());
//
//        // WHEN & THEN
//        RuntimeException ex = assertThrows(RuntimeException.class, () ->
//                service.update(ruleId, new RoomPricingRuleRequest()));
//
//        assertThat(ex.getMessage()).isEqualTo("Room pricing rule not found");
//        verify(repository, never()).save(any());
//    }
//
//    @Test
//    void update_InvalidRequest_ShouldThrowException() {
//        // GIVEN: Loại WEEKLY nhưng thiếu DayOfWeek
//        Integer ruleId = 100;
//        RoomPricingRuleRequest request = new RoomPricingRuleRequest();
//        request.setRuleType("WEEKLY");
//        request.setDayOfWeek(null);
//
//        when(repository.findById(ruleId)).thenReturn(Optional.of(new RoomPricingRule()));
//
//        // WHEN & THEN
//        RuntimeException ex = assertThrows(RuntimeException.class, () -> service.update(ruleId, request));
//
//        assertThat(ex.getMessage()).contains("Day of week is required");
//    }
//
//    @Test
//    void getByRoomType_Success_ShouldReturnDtoList() {
//        // GIVEN
//        Integer roomTypeId = 1;
//
//        RoomPricingRule rule1 = new RoomPricingRule();
//        rule1.setRuleId(101); // Sử dụng Setter để chuẩn bị dữ liệu
//
//        RoomPricingRule rule2 = new RoomPricingRule();
//        rule2.setRuleId(102);
//
//        when(repository.findByRoomTypeId(roomTypeId)).thenReturn(List.of(rule1, rule2));
//
//        // WHEN
//        List<RoomPricingRuleResponse> result = service.getByRoomType(roomTypeId);
//
//        // THEN
//        assertThat(result).hasSize(2);
//
//        // SỬA LỖI TẠI ĐÂY: Dùng getter để lấy giá trị ra so sánh
//        assertThat(result.get(0).getRuleId()).isEqualTo(101);
//        assertThat(result.get(1).getRuleId()).isEqualTo(102);
//
//        verify(repository, times(1)).findByRoomTypeId(roomTypeId);
//    }
//
//    @Test
//    void getByRoomType_NoRulesFound_ShouldReturnEmptyList() {
//        // GIVEN
//        Integer roomTypeId = 999;
//        when(repository.findByRoomTypeId(roomTypeId)).thenReturn(Collections.emptyList());
//
//        // WHEN
//        List<RoomPricingRuleResponse> result = service.getByRoomType(roomTypeId);
//
//        // THEN
//        assertThat(result).isNotNull();
//        assertThat(result).isEmpty();
//        verify(repository).findByRoomTypeId(roomTypeId);
//    }
//    @Test
//    void getByRoomType_WithNullId_ShouldReturnEmptyList() {
//        // GIVEN
//        when(repository.findByRoomTypeId(null)).thenReturn(Collections.emptyList());
//
//        // WHEN
//        List<RoomPricingRuleResponse> result = service.getByRoomType(null);
//
//        // THEN
//        assertThat(result).isEmpty();
//    }
//
//    @Test
//    void calculateFinalPrice_PriorityCheck_HigherPriorityFirst() {
//        // GIVEN
//        Integer roomTypeId = 1;
//        LocalDate date = LocalDate.of(2026, 4, 13); // Monday
//        BigDecimal basePrice = new BigDecimal("1000000");
//
//        // Rule 1: Weekly Monday, Priority 1, Tăng 10%
//        RoomPricingRule lowPriority = new RoomPricingRule();
//        lowPriority.setRuleType("WEEKLY");
//        lowPriority.setDayOfWeek("Monday");
//        lowPriority.setAction("INCREASE");
//        lowPriority.setAdjustmentType("PERCENT");
//        lowPriority.setAdjustmentValue(new BigDecimal("10"));
//        lowPriority.setPriority(1);
//        lowPriority.setIsActive(true);
//
//        // Rule 2: Event, Priority 10 (Cao hơn), Giảm 200,000
//        RoomPricingRule highPriority = new RoomPricingRule();
//        highPriority.setRuleType("EVENT");
//        highPriority.setStartDate(date);
//        highPriority.setEndDate(date);
//        highPriority.setAction("DECREASE");
//        highPriority.setAdjustmentType("FIXED");
//        highPriority.setAdjustmentValue(new BigDecimal("200000"));
//        highPriority.setPriority(10);
//        highPriority.setIsActive(true);
//
//        when(repository.findByRoomTypeId(roomTypeId)).thenReturn(List.of(lowPriority, highPriority));
//
//        // WHEN
//        BigDecimal result = service.calculateFinalPrice(roomTypeId, date, basePrice);
//
//        // THEN: Logic dự kiến:
//        // 1. Áp dụng Priority 10 trước: 1,000,000 - 200,000 = 800,000
//        // 2. Áp dụng Priority 1 sau: 800,000 + (800,000 * 10%) = 880,000
//        assertThat(result).isEqualByComparingTo("880000");
//    }
//
//    @Test
//    void calculateFinalPrice_ShouldIgnoreInactiveOrNonMatchingRules() {
//        // GIVEN
//        LocalDate date = LocalDate.of(2026, 4, 14); // Tuesday
//        BigDecimal basePrice = new BigDecimal("500000");
//
//        // Rule 1: Khớp thứ nhưng Inactive
//        RoomPricingRule inactiveRule = new RoomPricingRule();
//        inactiveRule.setRuleType("WEEKLY");
//        inactiveRule.setDayOfWeek("Tuesday");
//        inactiveRule.setIsActive(false);
//        inactiveRule.setAdjustmentValue(new BigDecimal("100000"));
//
//        // Rule 2: Khớp Active nhưng sai ngày (Weekly Monday)
//        RoomPricingRule wrongDayRule = new RoomPricingRule();
//        wrongDayRule.setRuleType("WEEKLY");
//        wrongDayRule.setDayOfWeek("Monday");
//        wrongDayRule.setIsActive(true);
//
//        when(repository.findByRoomTypeId(1)).thenReturn(List.of(inactiveRule, wrongDayRule));
//
//        // WHEN
//        BigDecimal result = service.calculateFinalPrice(1, date, basePrice);
//
//        // THEN: Giá phải giữ nguyên vì không có quy tắc nào khớp
//        assertThat(result).isEqualByComparingTo("500000");
//    }
//
//    @Test
//    void calculateFinalPrice_ResultShouldNotBeNegative() {
//        // GIVEN
//        BigDecimal basePrice = new BigDecimal("100000");
//        RoomPricingRule discountRule = new RoomPricingRule();
//        discountRule.setRuleType("WEEKLY");
//        discountRule.setDayOfWeek("Monday");
//        discountRule.setAction("DECREASE");
//        discountRule.setAdjustmentType("FIXED");
//        discountRule.setAdjustmentValue(new BigDecimal("200000")); // Giảm nhiều hơn giá gốc
//        discountRule.setIsActive(true);
//        discountRule.setPriority(1);
//
//        when(repository.findByRoomTypeId(1)).thenReturn(List.of(discountRule));
//
//        // WHEN
//        BigDecimal result = service.calculateFinalPrice(1, LocalDate.of(2026, 4, 13), basePrice);
//
//        // THEN: 100k - 200k = -100k -> Phải trả về 0
//        assertThat(result).isEqualByComparingTo("0");
//    }
//
//    @Test
//    void calculateFinalPrice_ActionKeep_ShouldNotChangePrice() {
//        // GIVEN
//        BigDecimal basePrice = new BigDecimal("500000");
//        RoomPricingRule keepRule = new RoomPricingRule();
//        keepRule.setRuleType("WEEKLY");
//        keepRule.setDayOfWeek("Monday");
//        keepRule.setAction("KEEP");
//        keepRule.setIsActive(true);
//        keepRule.setPriority(1);
//
//        when(repository.findByRoomTypeId(1)).thenReturn(List.of(keepRule));
//
//        // WHEN
//        BigDecimal result = service.calculateFinalPrice(1, LocalDate.of(2026, 4, 13), basePrice);
//
//        // THEN
//        assertThat(result).isEqualByComparingTo("500000");
//    }
//    @Test
//    void calculateFinalPrice_NullPriority_ShouldBeAppliedLast() {
//        // GIVEN
//        Integer roomTypeId = 1;
//        LocalDate date = LocalDate.of(2026, 4, 13); // Monday
//        BigDecimal basePrice = new BigDecimal("1000000");
//
//        // Rule 1: Priority cao (10) - Giảm 200k
//        RoomPricingRule highPriority = createRule("EVENT", "DECREASE", "FIXED", 200000, 10);
//        highPriority.setStartDate(date); highPriority.setEndDate(date);
//
//        // Rule 2: Priority NULL - Tăng 10%
//        RoomPricingRule nullPriority = createRule("WEEKLY", "INCREASE", "PERCENT", 10, 0);
//        nullPriority.setPriority(null); // Giả lập database trả về null
//        nullPriority.setDayOfWeek("Monday");
//
//        when(repository.findByRoomTypeId(roomTypeId)).thenReturn(List.of(highPriority, nullPriority));
//
//        // WHEN
//        BigDecimal result = service.calculateFinalPrice(roomTypeId, date, basePrice);
//
//        // THEN: Logic dự kiến:
//        // 1. Áp dụng Priority 10 trước: 1,000,000 - 200,000 = 800,000
//        // 2. Áp dụng Priority NULL sau cùng: 800,000 + 10% = 880,000
//        assertThat(result).isEqualByComparingTo("880000");
//    }
//
//    @Test
//    void calculateFinalPrice_EventBoundaryDates_ShouldMatch() {
//        // GIVEN: Kiểm tra chính xác ngày bắt đầu của Event
//        LocalDate startDate = LocalDate.of(2026, 5, 1);
//        BigDecimal basePrice = new BigDecimal("1000000");
//
//        RoomPricingRule eventRule = createRule("EVENT", "INCREASE", "FIXED", 100000, 1);
//        eventRule.setStartDate(startDate);
//        eventRule.setEndDate(startDate.plusDays(2));
//
//        when(repository.findByRoomTypeId(1)).thenReturn(List.of(eventRule));
//
//        // WHEN
//        BigDecimal result = service.calculateFinalPrice(1, startDate, basePrice);
//
//        // THEN: Phải khớp vì ngày khảo sát trùng với StartDate
//        assertThat(result).isEqualByComparingTo("1100000");
//    }
//    @Test
//    void calculateFinalPrice_ComplexMath_ShouldNotThrowException() {
//        // GIVEN
//        BigDecimal basePrice = new BigDecimal("1234567"); // Số lẻ
//        RoomPricingRule percentRule = createRule("WEEKLY", "DECREASE", "PERCENT", 15.5, 1);
//        percentRule.setDayOfWeek("Monday");
//
//        when(repository.findByRoomTypeId(1)).thenReturn(List.of(percentRule));
//
//        // WHEN & THEN: Đảm bảo không văng lỗi ArithmeticException
//        assertDoesNotThrow(() -> service.calculateFinalPrice(1, LocalDate.of(2026, 4, 13), basePrice));
//    }
//
//    private RoomPricingRule createRule(String type, String action, String adjType, double value, int priority) {
//        RoomPricingRule rule = new RoomPricingRule();
//        rule.setRuleType(type);
//        rule.setAction(action);
//        rule.setAdjustmentType(adjType);
//        rule.setAdjustmentValue(BigDecimal.valueOf(value));
//        rule.setPriority(priority);
//        rule.setIsActive(true);
//        return rule;
//    }
//}