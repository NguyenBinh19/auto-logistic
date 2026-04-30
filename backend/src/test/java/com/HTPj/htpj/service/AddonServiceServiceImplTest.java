//package com.HTPj.htpj.service;
//
//import com.HTPj.htpj.dto.request.addonservice.AddBookingAddonsRequest;
//import com.HTPj.htpj.dto.request.addonservice.BookingAddonServiceRequest;
//import com.HTPj.htpj.dto.request.addonservice.CreateAddonServiceRequest;
//import com.HTPj.htpj.dto.request.addonservice.UpdateAddonServiceRequest;
//import com.HTPj.htpj.dto.response.addonservice.AddonServiceResponse;
//import com.HTPj.htpj.dto.response.addonservice.BookingAddonServiceResponse;
//import com.HTPj.htpj.entity.AddonService;
//import com.HTPj.htpj.entity.Booking;
//import com.HTPj.htpj.entity.BookingAddonService;
//import com.HTPj.htpj.entity.Hotel;
//import com.HTPj.htpj.exception.AppException;
//import com.HTPj.htpj.exception.ErrorCode;
//import com.HTPj.htpj.repository.AddonServiceRepository;
//import com.HTPj.htpj.repository.BookingAddonServiceRepository;
//import com.HTPj.htpj.repository.BookingRepository;
//import com.HTPj.htpj.repository.HotelRepository;
//import com.HTPj.htpj.service.impl.AddonServiceServiceImpl;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.ArgumentCaptor;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//
//import java.math.BigDecimal;
//import java.util.List;
//import java.util.Optional;
//
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.assertj.core.api.Assertions.assertThatThrownBy;
//import static org.junit.jupiter.api.Assertions.assertThrows;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//class AddonServiceServiceImplTest {
//
//    @Mock
//    private AddonServiceRepository addonServiceRepository;
//
//    @Mock
//    private BookingAddonServiceRepository bookingAddonServiceRepository;
//
//    @Mock
//    private HotelRepository hotelRepository;
//
//    @Mock
//    private BookingRepository bookingRepository;
//
//    @InjectMocks
//    private AddonServiceServiceImpl addonServiceService;
//
//    @Test
//    void createService_N_Success() {
//        // GIVEN
//        CreateAddonServiceRequest request = new CreateAddonServiceRequest();
//        request.setHotelId(1);
//        request.setServiceName("Airport Pickup");
//        request.setCategory("transport");
//        request.setDescription("Private car transfer");
//        request.setNetPrice(new BigDecimal("20.00"));
//        request.setPublicPrice(new BigDecimal("30.00"));
//        request.setUnit("trip");
//        request.setImageUrl("https://img.test/pickup.png");
//        request.setRequireServiceDate(true);
//        request.setRequireFlightInfo(true);
//        request.setRequireSpecialNote(false);
//
//        Hotel hotel = new Hotel();
//        when(hotelRepository.findById(1)).thenReturn(Optional.of(hotel));
//        when(addonServiceRepository.save(any(AddonService.class)))
//                .thenAnswer(invocation -> invocation.getArgument(0));
//
//        // WHEN
//        AddonServiceResponse response = addonServiceService.createService(request);
//
//        // THEN
//        ArgumentCaptor<AddonService> captor = ArgumentCaptor.forClass(AddonService.class);
//        verify(addonServiceRepository).save(captor.capture());
//        AddonService saved = captor.getValue();
//
//        assertThat(saved.getHotel()).isSameAs(hotel);
//        assertThat(saved.getServiceName()).isEqualTo("Airport Pickup");
//        assertThat(saved.getStatus()).isEqualTo("active");
//        assertThat(saved.getRequireServiceDate()).isTrue();
//        assertThat(saved.getRequireFlightInfo()).isTrue();
//        assertThat(saved.getRequireSpecialNote()).isFalse();
//        assertThat(response).isNotNull();
//    }
//
//    @Test
//    void createService_A_HotelNotFound() {
//        // GIVEN
//        CreateAddonServiceRequest request = new CreateAddonServiceRequest();
//        request.setHotelId(999);
//
//        when(hotelRepository.findById(999)).thenReturn(Optional.empty());
//
//        // WHEN
//        // THEN
//        assertThatThrownBy(() -> addonServiceService.createService(request))
//                .isInstanceOf(AppException.class);
//
//        verify(addonServiceRepository, never()).save(any(AddonService.class));
//    }
//
//    @Test
//    void createService_B_NullBooleans() {
//        // GIVEN
//        CreateAddonServiceRequest request = new CreateAddonServiceRequest();
//        request.setHotelId(1);
//        request.setServiceName("Late Checkout");
//        request.setCategory("room");
//        request.setDescription("Extend checkout time");
//        request.setNetPrice(new BigDecimal("10.00"));
//        request.setPublicPrice(new BigDecimal("15.00"));
//        request.setUnit("hour");
//        request.setImageUrl("https://img.test/late-checkout.png");
//        request.setRequireServiceDate(null);
//        request.setRequireFlightInfo(null);
//        request.setRequireSpecialNote(null);
//
//        Hotel hotel = new Hotel();
//        when(hotelRepository.findById(1)).thenReturn(Optional.of(hotel));
//        when(addonServiceRepository.save(any(AddonService.class)))
//                .thenAnswer(invocation -> invocation.getArgument(0));
//
//        // WHEN
//        addonServiceService.createService(request);
//
//        // THEN
//        ArgumentCaptor<AddonService> captor = ArgumentCaptor.forClass(AddonService.class);
//        verify(addonServiceRepository).save(captor.capture());
//        AddonService saved = captor.getValue();
//
//        assertThat(saved.getRequireServiceDate()).isFalse();
//        assertThat(saved.getRequireFlightInfo()).isFalse();
//        assertThat(saved.getRequireSpecialNote()).isFalse();
//    }
//
//    @Test
//    void addServicesToBooking_N_Success() {
//        // GIVEN
//        Booking booking = new Booking();
//        booking.setBookingId(1L);
//        booking.setFinalAmount(new BigDecimal("100.00"));
//
//        AddonService breakfast = buildAddonService(11L, "Breakfast", new BigDecimal("15.00"));
//        AddonService shuttle = buildAddonService(22L, "Shuttle", new BigDecimal("20.00"));
//
//        AddBookingAddonsRequest request = new AddBookingAddonsRequest();
//        request.setBookingId(1L);
//        request.setServices(List.of(
//                BookingAddonServiceRequest.builder().serviceId(11L).quantity(2).build(),
//                BookingAddonServiceRequest.builder().serviceId(22L).quantity(1).build()
//        ));
//
//        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
//        when(addonServiceRepository.findById(11L)).thenReturn(Optional.of(breakfast));
//        when(addonServiceRepository.findById(22L)).thenReturn(Optional.of(shuttle));
//        when(bookingAddonServiceRepository.saveAll(anyList())).thenAnswer(invocation -> {
//            List<BookingAddonService> services = invocation.getArgument(0);
//            for (int i = 0; i < services.size(); i++) {
//                services.get(i).setId((long) (i + 1));
//            }
//            return services;
//        });
//        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));
//
//        // WHEN
//        List<BookingAddonServiceResponse> response = addonServiceService.addServicesToBooking(request);
//
//        // THEN
//        verify(bookingAddonServiceRepository).saveAll(anyList());
//        verify(bookingRepository).save(booking);
//        assertThat(booking.getFinalAmount()).isEqualByComparingTo("150.00");
//        assertThat(response).hasSize(2);
//    }
//
//    @Test
//    void addServicesToBooking_B_QuantityBoundaryDefaultsToOne() {
//        // GIVEN
//        Booking booking = new Booking();
//        booking.setBookingId(2L);
//        booking.setFinalAmount(new BigDecimal("50.00"));
//
//        AddonService laundry = buildAddonService(31L, "Laundry", new BigDecimal("5.00"));
//        AddonService parking = buildAddonService(32L, "Parking", new BigDecimal("8.00"));
//
//        AddBookingAddonsRequest request = new AddBookingAddonsRequest();
//        request.setBookingId(2L);
//        request.setServices(List.of(
//                BookingAddonServiceRequest.builder().serviceId(31L).quantity(null).build(),
//                BookingAddonServiceRequest.builder().serviceId(32L).quantity(-1).build()
//        ));
//
//        when(bookingRepository.findById(2L)).thenReturn(Optional.of(booking));
//        when(addonServiceRepository.findById(31L)).thenReturn(Optional.of(laundry));
//        when(addonServiceRepository.findById(32L)).thenReturn(Optional.of(parking));
//        when(bookingAddonServiceRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));
//        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));
//
//        // WHEN
//        addonServiceService.addServicesToBooking(request);
//
//        // THEN
//        @SuppressWarnings("unchecked")
//        ArgumentCaptor<List<BookingAddonService>> captor = ArgumentCaptor.forClass(List.class);
//        verify(bookingAddonServiceRepository).saveAll(captor.capture());
//        List<BookingAddonService> saved = captor.getValue();
//
//        assertThat(saved).hasSize(2);
//        assertThat(saved.get(0).getQuantity()).isEqualTo(1);
//        assertThat(saved.get(1).getQuantity()).isEqualTo(1);
//        assertThat(saved.get(0).getTotalPrice()).isEqualByComparingTo("5.00");
//        assertThat(saved.get(1).getTotalPrice()).isEqualByComparingTo("8.00");
//        assertThat(booking.getFinalAmount()).isEqualByComparingTo("63.00");
//    }
//
//    @Test
//    void addServicesToBooking_A_BookingNotFound() {
//        // GIVEN
//        AddBookingAddonsRequest request = new AddBookingAddonsRequest();
//        request.setBookingId(999L);
//        request.setServices(List.of(BookingAddonServiceRequest.builder().serviceId(11L).quantity(1).build()));
//
//        when(bookingRepository.findById(999L)).thenReturn(Optional.empty());
//
//        // WHEN
//        // THEN
//        assertThatThrownBy(() -> addonServiceService.addServicesToBooking(request))
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.BOOKING_NOT_FOUND));
//
//        verify(bookingAddonServiceRepository, never()).saveAll(anyList());
//        verify(bookingRepository, never()).save(any(Booking.class));
//    }
//
//    @Test
//    void addServicesToBooking_C_ServiceNotFound() {
//        // GIVEN
//        Booking booking = new Booking();
//        booking.setBookingId(3L);
//        booking.setFinalAmount(new BigDecimal("80.00"));
//
//        AddBookingAddonsRequest request = new AddBookingAddonsRequest();
//        request.setBookingId(3L);
//        request.setServices(List.of(
//                BookingAddonServiceRequest.builder().serviceId(404L).quantity(2).build()
//        ));
//
//        when(bookingRepository.findById(3L)).thenReturn(Optional.of(booking));
//        when(addonServiceRepository.findById(404L)).thenReturn(Optional.empty());
//
//        // WHEN
//        // THEN
//        assertThatThrownBy(() -> addonServiceService.addServicesToBooking(request))
//                .isInstanceOfSatisfying(AppException.class,
//                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.ADDON_SERVICE_NOT_FOUND));
//
//        verify(bookingAddonServiceRepository, never()).saveAll(anyList());
//        verify(bookingRepository, never()).save(any(Booking.class));
//    }
//
//    private AddonService buildAddonService(Long serviceId, String serviceName, BigDecimal netPrice) {
//        return AddonService.builder()
//                .serviceId(serviceId)
//                .serviceName(serviceName)
//                .category("general")
//                .unit("item")
//                .netPrice(netPrice)
//                .build();
//    }
//
//    @Test
//    void updateService_N_Success() {
//        // GIVEN
//        Long serviceId = 1L;
//        UpdateAddonServiceRequest request = new UpdateAddonServiceRequest();
//        request.setServiceName("New Name");
//        request.setNetPrice(new BigDecimal("50.00"));
//        request.setRequireServiceDate(true);
//
//        Hotel hotel = new Hotel();
//        hotel.setHotelId(1);
//
//        AddonService existingService = new AddonService();
//        existingService.setServiceId(serviceId);
//        existingService.setServiceName("Old Name");
//        existingService.setRequireServiceDate(false);
//        existingService.setHotel(hotel);
//
//        when(addonServiceRepository.findById(serviceId)).thenReturn(Optional.of(existingService));
//        when(addonServiceRepository.save(any(AddonService.class))).thenAnswer(i -> i.getArgument(0));
//
//        // WHEN
//        AddonServiceResponse response = addonServiceService.updateService(serviceId, request);
//
//        // THEN
//        verify(addonServiceRepository).save(existingService);
//        assertThat(existingService.getServiceName()).isEqualTo("New Name");
//        assertThat(existingService.getNetPrice()).isEqualByComparingTo("50.00");
//        assertThat(existingService.getRequireServiceDate()).isTrue();
//        assertThat(existingService.getUpdatedAt()).isNotNull();
//        assertThat(response).isNotNull();
//    }
//
//    @Test
//    void updateService_A_ServiceNotFound() {
//        // GIVEN
//        Long serviceId = 404L;
//        UpdateAddonServiceRequest request = new UpdateAddonServiceRequest();
//
//        when(addonServiceRepository.findById(serviceId)).thenReturn(Optional.empty());
//
//        // WHEN & THEN
//        assertThatThrownBy(() -> addonServiceService.updateService(serviceId, request))
//                .isInstanceOfSatisfying(AppException.class, ex -> {
//                    assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.ADDON_SERVICE_NOT_FOUND);
//                });
//        verify(addonServiceRepository, never()).save(any());
//    }
//
//    @Test
//    void updateService_B_NullFieldsNoUpdate() {
//        // GIVEN
//        Long serviceId = 1L;
//        UpdateAddonServiceRequest request = new UpdateAddonServiceRequest();
//        Hotel hotel = new Hotel();
//        hotel.setHotelId(1);
//
//        AddonService existingService = new AddonService();
//        existingService.setServiceName("Keep Me");
//        existingService.setHotel(hotel);
//
//        when(addonServiceRepository.findById(serviceId)).thenReturn(Optional.of(existingService));
//        when(addonServiceRepository.save(any(AddonService.class))).thenReturn(existingService);
//
//        // WHEN
//        addonServiceService.updateService(serviceId, request);
//
//        // THEN
//        verify(addonServiceRepository).save(existingService);
//        assertThat(existingService.getServiceName()).isEqualTo("Keep Me"); // Vẫn giữ nguyên giá trị cũ
//    }
//
//    @Test
//    void toggleStatus_N_ChangeToInactive() {
//        // GIVEN
//        Long serviceId = 1L;
//        AddonService service = new AddonService();
//        service.setStatus("active");
//
//        Hotel hotel = new Hotel();
//        hotel.setHotelId(1);
//        service.setHotel(hotel);
//
//        when(addonServiceRepository.findById(serviceId)).thenReturn(Optional.of(service));
//        when(addonServiceRepository.save(any(AddonService.class))).thenAnswer(i -> i.getArgument(0));
//
//        // WHEN
//        AddonServiceResponse response = addonServiceService.toggleStatus(serviceId);
//
//        // THEN
//        assertThat(service.getStatus()).isEqualTo("inactive");
//        verify(addonServiceRepository).save(service);
//        assertThat(response).isNotNull();
//    }
//
//    @Test
//    void toggleStatus_N_ChangeToActive() {
//        // GIVEN
//        Long serviceId = 1L;
//        AddonService service = new AddonService();
//        service.setStatus("inactive");
//
//        Hotel hotel = new Hotel();
//        hotel.setHotelId(1);
//        service.setHotel(hotel);
//
//        when(addonServiceRepository.findById(serviceId)).thenReturn(Optional.of(service));
//        when(addonServiceRepository.save(any(AddonService.class))).thenAnswer(i -> i.getArgument(0));
//
//        // WHEN
//        AddonServiceResponse response = addonServiceService.toggleStatus(serviceId);
//
//        // THEN
//        assertThat(service.getStatus()).isEqualTo("active");
//        verify(addonServiceRepository).save(service);
//        assertThat(response).isNotNull();
//    }
//
//    @Test
//    void toggleStatus_A_ServiceNotFound() {
//        // GIVEN
//        Long serviceId = 999L;
//        when(addonServiceRepository.findById(serviceId)).thenReturn(Optional.empty());
//
//        // WHEN & THEN
//        AppException exception = assertThrows(AppException.class, () -> {
//            addonServiceService.toggleStatus(serviceId);
//        });
//
//        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.ADDON_SERVICE_NOT_FOUND);
//        verify(addonServiceRepository, never()).save(any());
//    }
//
//
//}
