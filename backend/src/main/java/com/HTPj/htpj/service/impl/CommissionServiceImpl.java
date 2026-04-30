package com.HTPj.htpj.service.impl;

import com.HTPj.htpj.dto.request.commission.CreateCommissionRequest;
import com.HTPj.htpj.dto.request.commission.DeleteCommissionRequest;
import com.HTPj.htpj.dto.request.commission.UpdateCommissionRequest;
import com.HTPj.htpj.dto.response.commision.CommissionDetailResponse;
import com.HTPj.htpj.dto.response.commision.CommissionLogResponse;
import com.HTPj.htpj.dto.response.commision.CommissionResponse;
import com.HTPj.htpj.dto.response.commision.HotelUsingDealResponse;
import com.HTPj.htpj.dto.response.hotel.HotelListResponse;
import com.HTPj.htpj.entity.*;
import com.HTPj.htpj.exception.AppException;
import com.HTPj.htpj.exception.ErrorCode;
import com.HTPj.htpj.mapper.CommissionLogMapper;
import com.HTPj.htpj.repository.*;
import com.HTPj.htpj.service.CommissionService;
import com.HTPj.htpj.service.NotificationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CommissionServiceImpl implements CommissionService {

    CommissionRepository commissionRepository;
    CommissionHotelRepository commissionHotelRepository;
    HotelRepository hotelRepository;
    UserRepository userRepository;
    NotificationService notificationService;
    SystemLogRepository systemLogRepository;
    CommissionLogRepository commissionLogRepository;
    CommissionLogMapper commissionLogMapper;

    private String getUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Jwt jwt = (Jwt) authentication.getPrincipal();
        return jwt.getClaim("userId");
    }

    private void saveLog(String action) {
        SystemLog log = new SystemLog();
        log.setUserId(getUserId());
        log.setAction(action);
        log.setUpdatedAt(LocalDateTime.now());

        systemLogRepository.save(log);
    }

    private void saveCommissionLog(
            Hotel hotel,
            Commission newCommission,
            String userId,
            String note
    ) {
        CommissionLog log = new CommissionLog();

        log.setHotelId(Long.valueOf(hotel.getHotelId()));

        // OLD
        log.setOldCommissionId(hotel.getCommissionId());
        log.setOldValue(hotel.getCommissionValue());
        log.setOldCommissionType(hotel.getCommissionType());
        log.setOldRateType(hotel.getRateType());

        // NEW
        log.setNewCommissionId(newCommission.getCommissionId());
        log.setNewValue(newCommission.getCommissionValue());
        log.setNewCommissionType(newCommission.getCommissionType());
        log.setNewRateType(newCommission.getRateType());

        log.setChangedBy(userId);
        log.setChangedAt(LocalDateTime.now());
        log.setNote(note);

        commissionLogRepository.save(log);
    }

    private String getUsernameFromId(String userId) {
        if (userId == null || userId.isEmpty()) {
            return "Unknown";
        }
        return userRepository.findById(userId)
                .map(Users::getUsername)
                .orElse("User not found in system");
    }

    @Override
    public String create(CreateCommissionRequest request) {

        String userId = getUserId();
        LocalDateTime now = LocalDateTime.now();

        Commission commission = new Commission();

        // DEFAULT
        if ("DEFAULT".equals(request.getCommissionType())) {

            commissionRepository.findDefault().ifPresent(c -> {
                throw new AppException(ErrorCode.DEFAULT_ALREADY_EXIST);
            });

            commission.setCommissionType("DEFAULT");
            commission.setRateType(request.getRateType());
            commission.setCommissionValue(request.getCommissionValue());
            commission.setNote(request.getNote());

            commission.setIsActive(true);
            commission.setStartDate(null);
            commission.setEndDate(null);

            saveLog("Tạo % hoa hồng mặc định: "
                    + commission.getCommissionValue() + "%");
        }

        // DEAL
        else if ("DEAL".equals(request.getCommissionType())) {

            commission.setCommissionType("DEAL");
            commission.setRateType(request.getRateType());
            commission.setCommissionValue(request.getCommissionValue());
            commission.setStartDate(request.getStartDate());
            commission.setEndDate(request.getEndDate());
            commission.setIsActive(request.getIsActive());
            commission.setNote(request.getNote());

            saveLog("Tạo % hoa hồng khuyến mãi: từ "
                    + request.getStartDate() + " - " + request.getEndDate()
                    + ", giá trị: " + commission.getCommissionValue() + "%");
        }

        // HOTEL
        else {

            commission.setCommissionType("HOTEL");
            commission.setRateType(request.getRateType());
            commission.setCommissionValue(request.getCommissionValue());
            commission.setStartDate(null);
            commission.setEndDate(null);
            commission.setIsActive(true);
            commission.setNote(request.getNote());
        }

        commission.setCreatedAt(now);
        commission.setUpdatedAt(now);
        commission.setCreatedBy(userId);
        commission.setUpdatedBy(userId);

        commission = commissionRepository.save(commission);


        if ("HOTEL".equals(request.getCommissionType())) {

            for (Integer hotelId : request.getHotelIds()) {
                // HOTEL mapping
                CommissionHotel ch = new CommissionHotel();
                ch.setCommissionId(commission.getCommissionId());
                ch.setHotelId(hotelId);
                commissionHotelRepository.save(ch);

                //update hotel
                Hotel hotel = hotelRepository.findById(hotelId)
                        .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));

                hotel.setUpdatedAt(now);

                hotel.setCommissionValue(commission.getCommissionValue());
                hotel.setRateType(commission.getRateType());
                hotel.setCommissionId(commission.getCommissionId());

                hotel.setCommissionUpdatedAt(now);
                hotel.setCommissionUpdatedBy(userId);
                hotel.setCommissionType("HOTEL");

                hotelRepository.save(hotel);

                saveCommissionLog(
                        hotel,
                        commission,
                        userId,
                        "Cập nhật hoa hồng riêng cho khách sạn"
                );

                saveLog("Tạo % hoa hồng cho khách sạn: "
                        + hotel.getHotelId() + " - " + hotel.getHotelName()
                        + ", giá trị: " + commission.getCommissionValue() + "%");
            }

            // Notify hotels about new commission
            for (Integer hotelId : request.getHotelIds()) {
                List<Users> hotelUsers = userRepository.findByHotel_HotelId(hotelId);
                for (Users hotelUser : hotelUsers) {
                    notificationService.sendNotification(
                            hotelUser.getId(), "COMMISSION",
                            "Cập nhật hoa hồng",
                            "Hoa hồng cho khách sạn của bạn đã được thiết lập.",
                            "COMMISSION", String.valueOf(commission.getCommissionId()),
                            "/hotel/profile"
                    );
                }
            }
        }

        return "Create successfully";
    }

    @Override
    public String delete(Long commissionId, DeleteCommissionRequest request) {

        Commission commission = commissionRepository.findById(commissionId)
                .orElseThrow(() -> new AppException(ErrorCode.COMMISSION_NOT_FOUND));

        if ("DEFAULT".equals(commission.getCommissionType())) {
            throw new AppException(ErrorCode.CANNOT_DELETE_DEFAULT);
        }

        if (request.getReason() == null || request.getReason().isEmpty()) {
            throw new AppException(ErrorCode.REASON_REQUIRED);
        }

        commission.setIsActive(false);
        commission.setReason(request.getReason());
        commission.setUpdatedAt(LocalDateTime.now());
        commission.setUpdatedBy(getUserId());

        commissionRepository.save(commission);

        saveLog("Dừng hoạt động % hoa hồng: commissionId = "
                + commission.getCommissionId());

        return "Archived successfully";
    }

    @Override
    public List<CommissionResponse> getAll() {
        return commissionRepository.findAll().stream().map(c -> {
            CommissionResponse res = new CommissionResponse();
            res.setCommissionId(c.getCommissionId());
            res.setCommissionType(c.getCommissionType());
            res.setRateType(c.getRateType());
            res.setCommissionValue(c.getCommissionValue());
            res.setStartDate(c.getStartDate());
            res.setEndDate(c.getEndDate());
            res.setIsActive(c.getIsActive());
            return res;
        }).toList();
    }

    @Override
    public CommissionDetailResponse getDetail(Long commissionId) {

        Commission commission = commissionRepository.findById(commissionId)
                .orElseThrow(() -> new AppException(ErrorCode.COMMISSION_NOT_FOUND));


        String createBy = getUsernameFromId(commission.getCreatedBy());
        String updateBy = getUsernameFromId(commission.getUpdatedBy());

        commission.setCreatedBy(createBy);
        commission.setUpdatedBy(updateBy);

        CommissionDetailResponse response = new CommissionDetailResponse();
        response.setCommission(commission);


        // HOTEL
        if ("HOTEL".equals(commission.getCommissionType())) {
            List<CommissionHotel> chs = commissionHotelRepository.findByCommissionId(commissionId);

            List<Hotel> hotels = chs.stream()
                    .map(ch -> hotelRepository.findById(ch.getHotelId()).orElse(null))
                    .toList();

            response.setHotels(hotels);
        }

        return response;
    }

    @Override
    public String update(UpdateCommissionRequest request) {

        Commission commission = commissionRepository.findById(request.getCommissionId())
                .orElseThrow(() -> new AppException(ErrorCode.COMMISSION_NOT_FOUND));

        String userId = getUserId();
        LocalDateTime now = LocalDateTime.now();

        String type = commission.getCommissionType();

        // default
        if ("DEFAULT".equals(type)) {
            commission.setRateType(request.getRateType());
            commission.setCommissionValue(request.getCommissionValue());
            commission.setNote(request.getNote());
            commission.setReason(request.getReason());

            saveLog("Cập nhật hoa hồng mặc định thành: "
                    + commission.getCommissionValue() + "%");
        }
        // deal
        else if ("DEAL".equals(type)) {
            List<Hotel> hotelsUsingCommission =
                    hotelRepository.findByCommissionId(commission.getCommissionId());

            boolean isUsed = hotelsUsingCommission != null && !hotelsUsingCommission.isEmpty();

            // đã sd
            if (isUsed) {
                commission.setStartDate(request.getStartDate());
                commission.setEndDate(request.getEndDate());
                commission.setNote(request.getNote());
                commission.setReason(request.getReason());

            //chua sd
            } else {
                commission.setRateType(request.getRateType());
                commission.setCommissionValue(request.getCommissionValue());
                commission.setStartDate(request.getStartDate());
                commission.setEndDate(request.getEndDate());
                commission.setNote(request.getNote());
                commission.setReason(request.getReason());
            }

            saveLog("Cập nhật hoa hồng: commissionId = "
                    + commission.getCommissionId()
                    + ", thời gian: " + request.getStartDate()
                    + " - " + request.getEndDate());
        }

        // hotel
        else {

            commission.setRateType(request.getRateType());
            commission.setCommissionValue(request.getCommissionValue());
            commission.setNote(request.getNote());
            commission.setReason(request.getReason());

            //check hotel exits
            List<CommissionHotel> existingHotels =
                    commissionHotelRepository.findByCommissionId(commission.getCommissionId());

            boolean existed = existingHotels != null && !existingHotels.isEmpty();

            if (existed) {
                for (CommissionHotel ch : existingHotels) {

                    Hotel hotel = hotelRepository.findById(ch.getHotelId())
                            .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));
                    saveCommissionLog(hotel, commission, userId, "Cập nhật chiết khấu riêng của khách sạn");
                    hotel.setUpdatedAt(now);

                    hotel.setCommissionValue(request.getCommissionValue());
                    hotel.setRateType(request.getRateType());

                    hotel.setCommissionUpdatedAt(now);
                    hotel.setCommissionUpdatedBy(userId);

                    hotelRepository.save(hotel);
                }
            }
            else {

                for (Integer hotelId : request.getHotelIds()) {

                    // insert mapping
                    CommissionHotel ch = new CommissionHotel();
                    ch.setCommissionId(commission.getCommissionId());
                    ch.setHotelId(hotelId);
                    commissionHotelRepository.save(ch);

                    Hotel hotel = hotelRepository.findById(hotelId)
                            .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));

                    hotel.setUpdatedAt(now);

                    hotel.setCommissionValue(request.getCommissionValue());
                    hotel.setRateType(request.getRateType());
                    hotel.setCommissionId(commission.getCommissionId());
                    hotel.setCommissionType("HOTEL");

                    hotel.setCommissionUpdatedAt(now);
                    hotel.setCommissionUpdatedBy(userId);

                    hotelRepository.save(hotel);
                }
            }

            saveLog("Cập nhật hoa hồng khách sạn, mã hoa hồng: "
                    + commission.getCommissionId()
                    + ", giá trị: " + commission.getCommissionValue() + "%");
        }

        // common update
        commission.setUpdatedAt(now);
        commission.setUpdatedBy(userId);

        commissionRepository.save(commission);

        // Notify hotels about commission update (HOTEL type only)
        if ("HOTEL".equals(commission.getCommissionType())) {
            List<CommissionHotel> hotelLinks = commissionHotelRepository.findByCommissionId(commission.getCommissionId());
            if (hotelLinks != null) {
                for (CommissionHotel ch : hotelLinks) {
                    List<Users> hotelUsers = userRepository.findByHotel_HotelId(ch.getHotelId());
                    for (Users hotelUser : hotelUsers) {
                        notificationService.sendNotification(
                                hotelUser.getId(), "COMMISSION",
                                "Cập nhật hoa hồng",
                                "Hoa hồng của khách sạn bạn đã được cập nhật.",
                                "COMMISSION", String.valueOf(commission.getCommissionId()),
                                "/hotel/profile"
                        );
                    }
                }
            }
        }

        return "Update successfully";
    }

    @Override
    public String activeCommission(Long commissionId) {

        Commission commission = commissionRepository.findById(commissionId)
                .orElseThrow(() -> new AppException(ErrorCode.COMMISSION_NOT_FOUND));

        // chỉ cho active DEAL
        if (!"DEAL".equalsIgnoreCase(commission.getCommissionType())) {
            throw new AppException(ErrorCode.INVALID_COMMISSION_TYPE);
        }

        // chỉ active khi đang false
        if (Boolean.TRUE.equals(commission.getIsActive())) {
            throw new AppException(ErrorCode.COMMISSION_ALREADY_ACTIVE);
        }

        commission.setIsActive(true);
        commission.setUpdatedAt(LocalDateTime.now());
        commission.setUpdatedBy(getUserId());

        commissionRepository.save(commission);

        saveLog("Kích hoạt % hoa hồng: commissionId = "
                + commission.getCommissionId());

        return "Active commission thành công";
    }

    @Override
    public HotelUsingDealResponse getHotelsUsingDeal(Long commissionId) {

        Commission commission = commissionRepository.findById(commissionId)
                .orElseThrow(() -> new AppException(ErrorCode.COMMISSION_NOT_FOUND));

        // chỉ áp dụng cho DEAL
        if (!"DEAL".equalsIgnoreCase(commission.getCommissionType())) {
            throw new AppException(ErrorCode.INVALID_COMMISSION_TYPE);
        }

        List<Hotel> hotels = hotelRepository.findHotelUsingDeal(commissionId);

        List<HotelListResponse> responseList = hotels.stream()
                .map(h -> {
                    HotelListResponse res = new HotelListResponse();
                    res.setHotelId(h.getHotelId());
                    res.setHotelName(h.getHotelName());
                    res.setPhone(h.getPhone());
                    res.setAddress(h.getAddress());
                    res.setStatus(h.getStatus());
                    return res;
                })
                .toList();

        return HotelUsingDealResponse.builder()
                .commissionId(commissionId)
                .totalHotel(responseList.size())
                .hotels(responseList)
                .build();
    }

    @Override
    @Transactional
    public String setDefaultCommission(Integer hotelId) {

        // chekc hotel exist
        Hotel hotel = hotelRepository.findByHotelIdAndStatus(hotelId, "ACTIVE")
                .orElseThrow(() -> new AppException(ErrorCode.HOTEL_NOT_FOUND));

        // get default commission
        Commission commission = commissionRepository.findDefault()
                .orElseThrow(() -> new AppException(ErrorCode.COMMISSION_NOT_FOUND));

        if ("DEFAULT".equalsIgnoreCase(hotel.getCommissionType())) {
            return "Hotel đã đang sử dụng DEFAULT commission";
        }

        LocalDateTime now = LocalDateTime.now();
        String userId = getUserId();

        if ("HOTEL".equalsIgnoreCase(hotel.getCommissionType())) {
            commissionHotelRepository.deleteByHotelId(hotelId);
        }

        //update hotel to default
        hotel.setCommissionValue(commission.getCommissionValue());
        hotel.setRateType(commission.getRateType());
        hotel.setCommissionId(commission.getCommissionId());
        hotel.setCommissionType("DEFAULT");

        hotel.setCommissionUpdatedAt(now);
        hotel.setCommissionUpdatedBy(userId);

        hotelRepository.save(hotel);

        return "Set hotel về DEFAULT commission thành công";
    }

    @Override
    public List<CommissionLogResponse> getAllCommissionLogs() {

        List<CommissionLogResponse> logs = commissionLogMapper.toResponseList(
                commissionLogRepository.findAll()
        );

        logs.forEach(log ->
                log.setChangedBy(getUsernameFromId(log.getChangedBy()))
        );

        return logs;
    }

    @Override
    public List<CommissionLogResponse> getHotelCommissionLogs() {

        String userId = getUserId();

        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getHotel() == null) {
            throw new RuntimeException("User does not belong to any hotel");
        }

        Long hotelId = Long.valueOf(user.getHotel().getHotelId());

        List<CommissionLogResponse> logs = commissionLogMapper.toResponseList(
                commissionLogRepository.findByHotelId(hotelId)
        );

        logs.forEach(log ->
                log.setChangedBy(getUsernameFromId(log.getChangedBy()))
        );

        return logs;
    }

}
