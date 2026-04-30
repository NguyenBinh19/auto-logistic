package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.addonservice.AddBookingAddonsRequest;
import com.HTPj.htpj.dto.request.addonservice.BookingAddonServiceRequest;
import com.HTPj.htpj.dto.request.addonservice.CreateAddonServiceRequest;
import com.HTPj.htpj.dto.request.addonservice.UpdateAddonServiceRequest;
import com.HTPj.htpj.dto.response.addonservice.AddonServiceResponse;
import com.HTPj.htpj.dto.response.addonservice.BookingAddonServiceResponse;
import com.HTPj.htpj.entity.*;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.mapper.AddonServiceMapper;
import com.HTPj.htpj.repository.*;
import com.HTPj.htpj.service.AddonServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddonServiceServiceImpl implements AddonServiceService {

    private final AddonServiceRepository addonServiceRepository;
    private final BookingAddonServiceRepository bookingAddonServiceRepository;
    private final HotelRepository hotelRepository;
    private final BookingRepository bookingRepository;
    private final AgencyCreditHistoryRepository agencyCreditHistoryRepository;
    private final AgencyRepository agencyRepository;
    private final TransactionHistoryRepository transactionHistoryRepository;

    @Override
    public AddonServiceResponse createService(CreateAddonServiceRequest request) {
        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));

        AddonService service = AddonService.builder()
                .hotel(hotel)
                .serviceName(request.getServiceName())
                .category(request.getCategory())
                .description(request.getDescription())
                .netPrice(request.getPublicPrice())
                .publicPrice(request.getPublicPrice())
                .unit(request.getUnit())
                .imageUrl(request.getImageUrl())
                .status("active")
                .requireServiceDate(Boolean.TRUE.equals(request.getRequireServiceDate()))
                .requireFlightInfo(Boolean.TRUE.equals(request.getRequireFlightInfo()))
                .requireSpecialNote(Boolean.TRUE.equals(request.getRequireSpecialNote()))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return AddonServiceMapper.toResponse(addonServiceRepository.save(service));
    }

    @Override
    public AddonServiceResponse updateService(Long serviceId, UpdateAddonServiceRequest request) {
        AddonService service = addonServiceRepository.findById(serviceId)
                .orElseThrow(() -> new AppException(ErrorCode.ADDON_SERVICE_NOT_FOUND));

        if (request.getServiceName() != null) service.setServiceName(request.getServiceName());
        if (request.getCategory() != null) service.setCategory(request.getCategory());
        if (request.getDescription() != null) service.setDescription(request.getDescription());
        if (request.getNetPrice() != null) service.setNetPrice(request.getPublicPrice());
        if (request.getPublicPrice() != null) service.setPublicPrice(request.getPublicPrice());
        if (request.getUnit() != null) service.setUnit(request.getUnit());
        if (request.getImageUrl() != null) service.setImageUrl(request.getImageUrl());
        if (request.getRequireServiceDate() != null) service.setRequireServiceDate(request.getRequireServiceDate());
        if (request.getRequireFlightInfo() != null) service.setRequireFlightInfo(request.getRequireFlightInfo());
        if (request.getRequireSpecialNote() != null) service.setRequireSpecialNote(request.getRequireSpecialNote());
        service.setUpdatedAt(LocalDateTime.now());

        return AddonServiceMapper.toResponse(addonServiceRepository.save(service));
    }

    @Override
    public AddonServiceResponse deleteService(Long serviceId) {
        AddonService service = addonServiceRepository.findById(serviceId)
                .orElseThrow(() -> new AppException(ErrorCode.ADDON_SERVICE_NOT_FOUND));

        service.setStatus("inactive");
        service.setUpdatedAt(LocalDateTime.now());
        return AddonServiceMapper.toResponse(addonServiceRepository.save(service));
    }

    @Override
    public AddonServiceResponse toggleStatus(Long serviceId) {
        AddonService service = addonServiceRepository.findById(serviceId)
                .orElseThrow(() -> new AppException(ErrorCode.ADDON_SERVICE_NOT_FOUND));

        service.setStatus("active".equalsIgnoreCase(service.getStatus()) ? "inactive" : "active");
        service.setUpdatedAt(LocalDateTime.now());
        return AddonServiceMapper.toResponse(addonServiceRepository.save(service));
    }

    @Override
    public List<AddonServiceResponse> getServicesByHotelId(Integer hotelId, String category) {
        List<AddonService> services;
        if (category != null && !category.isBlank()) {
            services = addonServiceRepository.findByHotel_HotelIdAndCategory(hotelId, category);
        } else {
            services = addonServiceRepository.findByHotel_HotelId(hotelId);
        }
        return services.stream().map(AddonServiceMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<AddonServiceResponse> getActiveServicesByHotelId(Integer hotelId) {
        return addonServiceRepository.findByHotel_HotelIdAndStatus(hotelId, "active")
                .stream().map(AddonServiceMapper::toResponse).collect(Collectors.toList());
    }

    @Transactional
    @Override
    public List<BookingAddonServiceResponse> addServicesToBooking(AddBookingAddonsRequest request) {

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));

        Agency agency = agencyRepository.findById(booking.getAgencyId())
                .orElseThrow(() -> new AppException(ErrorCode.AGENCY_NOT_FOUND));

        List<BookingAddonService> addonServices = request.getServices().stream().map(req -> {

            AddonService addonService = addonServiceRepository.findById(req.getServiceId())
                    .orElseThrow(() -> new AppException(ErrorCode.ADDON_SERVICE_NOT_FOUND));

            if (!"active".equalsIgnoreCase(addonService.getStatus())) {
                throw new AppException(ErrorCode.ADDON_SERVICE_NOT_AVAILABLE);
            }

            if (!addonService.getHotel().getHotelId().equals(booking.getHotelId())) {
                throw new AppException(ErrorCode.ADDON_SERVICE_NOT_AVAILABLE);
            }

            int qty = (req.getQuantity() != null && req.getQuantity() > 0) ? req.getQuantity() : 1;

            BigDecimal unitPrice = addonService.getNetPrice();
            BigDecimal totalPrice = unitPrice.multiply(BigDecimal.valueOf(qty));

            return BookingAddonService.builder()
                    .booking(booking)
                    .addonService(addonService)
                    .quantity(qty)
                    .unitPrice(unitPrice)
                    .totalPrice(totalPrice)
                    .serviceDate(req.getServiceDate())
                    .flightNumber(req.getFlightNumber())
                    .flightTime(req.getFlightTime())
                    .specialNote(req.getSpecialNote())
                    .createdAt(LocalDateTime.now())
                    .build();

        }).collect(Collectors.toList());

        List<BookingAddonService> savedList = bookingAddonServiceRepository.saveAll(addonServices);

        BigDecimal totalAddonCost = savedList.stream()
                .map(BookingAddonService::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String paymentMethod = booking.getPaymentMethod();
        if (paymentMethod == null || paymentMethod.isBlank()) {
            throw new AppException(ErrorCode.INVALID_PAYMENT_METHOD);
        }

        if ("CREDIT".equalsIgnoreCase(paymentMethod)) {

            BigDecimal before = agency.getCurrentCredit();
            if (before == null || before.compareTo(totalAddonCost) < 0) {
                throw new AppException(ErrorCode.INSUFFICIENT_BALANCE);
            }

            BigDecimal after = before.subtract(totalAddonCost);

            AgencyCreditHistory creditHistory = AgencyCreditHistory.builder()
                    .agency(agency)
                    .booking(booking)
                    .creditBefore(before)
                    .amount(totalAddonCost)
                    .creditAfter(after)
                    .type("PAID_ADDON")
                    .description("Thanh toán dịch vụ thêm của booking" + booking.getBookingCode())
                    .createdAt(LocalDateTime.now())
                    .build();
            agencyCreditHistoryRepository.save(creditHistory);

            TransactionHistory tx = TransactionHistory.builder()
                    .transactionDate(LocalDateTime.now())
                    .transactionType("Payment")
                    .description("Thanh toán dịch vụ thêm của booking (" + booking.getBookingCode() + ")")
                    .sourceType("Credit")
                    .amount(totalAddonCost)
                    .balanceAfter(after)
                    .status("Success")
                    .direction("OUT")
                    .transactionCode("PENDING-" + UUID.randomUUID().toString().substring(0, 8))
                    .agency(agency)
                    .createdAt(LocalDateTime.now())
                    .build();

            tx = transactionHistoryRepository.save(tx);
            tx.setTransactionCode(String.format("TRK-%06d", tx.getId()));
            transactionHistoryRepository.save(tx);

            agency.setCurrentCredit(after);
            agencyRepository.save(agency);

        } else if ("WALLET".equalsIgnoreCase(paymentMethod)) {

            BigDecimal before = agency.getWalletBalance();
            if (before == null || before.compareTo(totalAddonCost) < 0) {
                throw new AppException(ErrorCode.INSUFFICIENT_BALANCE);
            }

            BigDecimal after = before.subtract(totalAddonCost);

            agency.setWalletBalance(after);
            agencyRepository.save(agency);

            TransactionHistory tx = TransactionHistory.builder()
                    .transactionDate(LocalDateTime.now())
                    .transactionType("Payment")
                    .description("Thanh toán dịch vụ thêm của booking (" + booking.getBookingCode() + ")")
                    .sourceType("Wallet")
                    .amount(totalAddonCost)
                    .balanceAfter(after)
                    .status("Success")
                    .direction("OUT")
                    .transactionCode("PENDING-" + UUID.randomUUID().toString().substring(0, 8))
                    .agency(agency)
                    .createdAt(LocalDateTime.now())
                    .build();

            tx = transactionHistoryRepository.save(tx);
            tx.setTransactionCode(String.format("TRK-%06d", tx.getId()));
            transactionHistoryRepository.save(tx);

        } else {
            throw new AppException(ErrorCode.INVALID_PAYMENT_METHOD);
        }

        BigDecimal oldTotalAmount = booking.getTotalAmount() == null ? BigDecimal.ZERO : booking.getTotalAmount();
        BigDecimal oldFinalAmount = booking.getFinalAmount() == null ? BigDecimal.ZERO : booking.getFinalAmount();

        booking.setTotalAmount(oldTotalAmount.add(totalAddonCost));
        booking.setFinalAmount(oldFinalAmount.add(totalAddonCost));
        booking.setUpdatedAt(LocalDateTime.now());

        bookingRepository.save(booking);

        return savedList.stream()
                .map(AddonServiceMapper::toBookingAddonResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingAddonServiceResponse> getBookingAddonServices(Long bookingId) {
        return bookingAddonServiceRepository.findByBookingIdWithService(bookingId)
                .stream().map(AddonServiceMapper::toBookingAddonResponse).collect(Collectors.toList());
    }
}
